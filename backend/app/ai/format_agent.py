from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END, START
from langgraph.constants import Send
from langchain_groq import ChatGroq
import json
import re
import subprocess
import tempfile
import os
from pathlib import Path
from dotenv import load_dotenv
from langsmith import traceable
from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from app.ai.template_store import StyleRetriever
import uuid

# --- ENV SETUP ---
current_file_path = Path(__file__).resolve()
project_root = current_file_path.parent.parent.parent
env_path = project_root / "envs" / ".env"
load_dotenv(dotenv_path=env_path)

print(f"Loading env from: {env_path}")
print(f"API Key Found: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")

# --- LLM ---
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    streaming=False  # streaming=False for parallel chunk calls, avoids race conditions
)

# ============================================================
# STATE DEFINITIONS
# ============================================================

class ChunkState(TypedDict):
    """State for each individual chunk processed in parallel"""
    chunk: str        # The raw text chunk
    index: int        # Position in the original document
from typing import TypedDict, Annotated, List
class AgentState(TypedDict, total=False):
    """Main graph state"""
    user_request: str
    raw_text: str
    chunks: List[str]                        # After chunking
    markdown_chunks: Annotated[list, lambda x, y: x + y]  # Reducer: collects all parallel results
    markdown_content: str                    # After stitching
    selected_theme: str                      # After style retrieval (JSON string)
    document_content: str                    # Final LaTeX output
    messages: Annotated[list, add_messages]


# ============================================================
# PROMPTS
# ============================================================

markdown_agent_instruction = """
You are the **Semantic Markdown Architect**.
Your goal is to convert a CHUNK of raw text into clean, valid GitHub Flavored Markdown with LaTeX support.

### RULES
1. **Formatting:** Use # for H1, ## for H2, etc. Use standard Markdown for lists and bold text.
2. **LaTeX Math:** Wrap all mathematical formulas in $..$ for inline and $$..$$ for blocks.
3. **No HTML:** Do not use any HTML tags.
4. **Preserve Structure:** Keep headings, paragraphs, and lists as they are — do not summarize.
5. **Chunk Awareness:** This is ONE chunk of a larger document. Do not add intro or conclusion.

### EXAMPLE
Input: "Einstein's theory. Energy equals mass times light squared."
Output: "## Einstein's Theory\nEnergy is defined by the formula: $$E = mc^2$$"
"""

markdown_prompt = ChatPromptTemplate.from_messages([
    ("system", markdown_agent_instruction),
    ("human", "Convert this chunk to Markdown:\n\n{chunk}")
])

markdown_generate = markdown_prompt | llm


# ============================================================
# NODE 1: CHUNKER
# Splits raw text into sections by heading or fixed size
# ============================================================

def chunker_node(state: AgentState):
    raw_text = state["raw_text"]
    
    # Split by headings (lines starting with a number+dot or all-caps or markdown #)
    # This is a smart split — keeps sections together
    section_pattern = re.compile(
        r'(?=(?:\n|^)(?:#{1,3}\s|\d+\.\s[A-Z]|[A-Z][A-Z\s]{4,}\n))',
        re.MULTILINE
    )
    
    sections = section_pattern.split(raw_text)
    
    # Filter empty chunks, strip whitespace
    chunks = [s.strip() for s in sections if s.strip()]
    
    # Safety: if regex found nothing useful, fallback to fixed-size chunking (1500 words)
    if len(chunks) <= 1:
        words = raw_text.split()
        chunk_size = 1500
        chunks = [
            " ".join(words[i:i + chunk_size])
            for i in range(0, len(words), chunk_size)
        ]
    
    print(f"[Chunker] Split document into {len(chunks)} chunks")
    
    return {
        "chunks": chunks,
        "markdown_chunks": []  # Initialize empty for the reducer
    }


# ============================================================
# NODE 2: CHUNK ROUTER (Send API — fans out in parallel)
# ============================================================

def chunk_router(state: AgentState):
    """
    Uses LangGraph Send() to fan out each chunk 
    to markdown_format_node in PARALLEL
    """
    return [
        Send("markdown_format", {"chunk": chunk, "index": i})
        for i, chunk in enumerate(state["chunks"])
    ]


# ============================================================
# NODE 3: MARKDOWN FORMAT (runs in parallel per chunk)
# ============================================================

@traceable
async def markdown_format_node(state: ChunkState):
    chunk = state["chunk"]
    index = state["index"]
    
    print(f"[Markdown Node] Processing chunk {index + 1}...")
    
    response = await markdown_generate.ainvoke({"chunk": chunk})
    
    print(f"[Markdown Node] Chunk {index + 1} done.")
    
    # Return as list with index so reducer can sort later
    return {
        "markdown_chunks": [{"index": index, "content": response.content}]
    }


# ============================================================
# NODE 4: REDUCER — Stitches all markdown chunks in order
# ============================================================

def reducer_node(state: AgentState):
    chunks = state["markdown_chunks"]
    
    # Sort by original index to maintain document order
    sorted_chunks = sorted(chunks, key=lambda x: x["index"])
    
    # Join with double newline for clean markdown separation
    full_markdown = "\n\n".join(c["content"] for c in sorted_chunks)
    
    print(f"[Reducer] Stitched {len(sorted_chunks)} chunks into full markdown.")
    
    return {
        "markdown_content": full_markdown
    }


# ============================================================
# NODE 5: STYLE RETRIEVAL (vector search — runs ONCE)
# ============================================================

@traceable
def style_retrieval_node(state: AgentState):
    retriever = StyleRetriever()
    user_query = state["user_request"]
    
    theme_data = retriever.search_style(user_query)
    
    if theme_data:
        name = theme_data.get("name")
        distance = theme_data.get("distance")
        print(f"[Style Retrieval] Found: {name} (Distance: {distance:.4f})")
    else:
        print("[Style Retrieval] No match found, using default.")
        theme_data = {
            "id": 1,
            "name": "Academic Standard",
            "preview_class": "theme-academic",
            "tex_template_path": "default.tex",
            "export_engine": "xelatex",
            "distance": 0.0
        }

    return {
        "selected_theme": json.dumps(theme_data)
    }

import re

# ============================================================
# NODE 6: MARKDOWN → LaTeX CONVERSION (no pandoc, no system deps)
# runs ONCE, deterministic, no LLM
# ============================================================
def _convert_markdown_to_latex(markdown: str) -> str:
    lines = markdown.split("\n")
    latex_lines = []
    in_itemize = False
    in_enumerate = False
    in_verbatim = False

    for line in lines:
        # --- Handle Code Blocks (Fenced) ---
        if line.startswith("```"):
            if in_verbatim:
                latex_lines.append("\\end{verbatim}")
                in_verbatim = False
            else:
                # Close lists before starting code
                in_itemize, in_enumerate = _force_close_lists(latex_lines, in_itemize, in_enumerate)
                latex_lines.append("\\begin{verbatim}")
                in_verbatim = True
            continue
        
        # If we are inside a code block, skip all other processing
        if in_verbatim:
            latex_lines.append(line)
            continue

        # --- Headings ---
        if line.startswith("#"):
            in_itemize, in_enumerate = _force_close_lists(latex_lines, in_itemize, in_enumerate)
            if line.startswith("### "):
                content = _inline_formatting(line[4:].strip())
                latex_lines.append(f"\\subsubsection{{{content}}}")
            elif line.startswith("## "):
                content = _inline_formatting(line[3:].strip())
                latex_lines.append(f"\\subsection{{{content}}}")
            elif line.startswith("# "):
                content = _inline_formatting(line[2:].strip())
                latex_lines.append(f"\\section{{{content}}}")
            continue

        # --- Bullet list ---
        elif re.match(r'^[-*] ', line):
            if in_enumerate:
                latex_lines.append("\\end{enumerate}")
                in_enumerate = False
            if not in_itemize:
                latex_lines.append("\\begin{itemize}")
                in_itemize = True
            content = _inline_formatting(line[2:].strip())
            latex_lines.append(f"  \\item {content}")
            continue

        # --- Numbered list ---
        elif re.match(r'^\d+\. ', line):
            if in_itemize:
                latex_lines.append("\\end{itemize}")
                in_itemize = False
            if not in_enumerate:
                latex_lines.append("\\begin{enumerate}")
                in_enumerate = True
            content = re.sub(r'^\d+\. ', '', line).strip()
            content = _inline_formatting(content)
            latex_lines.append(f"  \\item {content}")
            continue

        # --- Blank line or Normal Paragraph ---
        else:
            stripped = line.strip()
            # If we hit a non-list line, close active lists
            if not stripped or (in_itemize or in_enumerate):
                in_itemize, in_enumerate = _force_close_lists(latex_lines, in_itemize, in_enumerate)
            
            if stripped:
                latex_lines.append(_inline_formatting(line))
            else:
                latex_lines.append("")

    # Final cleanup
    _force_close_lists(latex_lines, in_itemize, in_enumerate)
    if in_verbatim:
        latex_lines.append("\\end{verbatim}")

    return "\n".join(latex_lines)

def _force_close_lists(latex_lines, in_itemize, in_enumerate):
    """Helper to close lists and return their new status."""
    if in_itemize:
        latex_lines.append("\\end{itemize}")
    if in_enumerate:
        latex_lines.append("\\end{enumerate}")
    return False, False # Both are now closed

def _inline_formatting(text: str) -> str:
    """Apply inline markdown → LaTeX formatting."""
    # Bold+italic (must come before bold and italic)
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\\textbf{\\textit{\1}}', text)
    # Bold
    text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
    # Italic
    text = re.sub(r'\*(.+?)\*', r'\\textit{\1}', text)
    # Inline code
    text = re.sub(r'`(.+?)`', r'\\texttt{\1}', text)
    # Block math
    text = re.sub(r'\$\$(.+?)\$\$', r'\\[\1\\]', text, flags=re.DOTALL)
    # Inline math
    text = re.sub(r'\$(.+?)\$', r'$\1$', text)
    # Escape bare % and & (common in academic content)
    text = re.sub(r'(?<!\\)%', r'\\%', text)
    text = re.sub(r'(?<!\\)&', r'\\&', text)
    return text


def _close_lists(latex_lines: list, in_itemize: bool, in_enumerate: bool):
    if in_itemize:
        latex_lines.append("\\end{itemize}")
    if in_enumerate:
        latex_lines.append("\\end{enumerate}")


import json
import json
from pathlib import Path
# Recommendation: Move this import to the top of your file
# Adjust the path based on your specific 'sys.path'
try:
    from app.utils.helpers import sanitize_tex
except ImportError:
    # Fallback if the above path fails in your specific Docker/Local setup
    from utils.helpers import sanitize_tex

def pandoc_node(state: AgentState):
    markdown_content = state.get("markdown_content", "")
    # Ensure selected_theme is parsed correctly
    try:
        theme = json.loads(state.get("selected_theme", "{}"))
    except (json.JSONDecodeError, TypeError):
        theme = {}

    # 1. Extract metadata with sanitization
    # If state keys are missing, these defaults prevent LaTeX "Undefined Control Sequence" errors
    report_title = sanitize_tex(state.get("report_title", "Project Report"))
    author_name = sanitize_tex(state.get("author_name", "Student Name"))
    dept_name = sanitize_tex(state.get("department", "Engineering"))
    college_name = sanitize_tex(state.get("college_short_name", "ICET"))

    style_name = theme.get("name", "Academic Standard")
    template_name = theme.get("tex_template_path", "college_report_v1.tex")

    print(f"[LaTeX Converter] Converting | Style: {style_name}")

    # 2. Convert the main body using your lightweight converter
    body_latex = _convert_markdown_to_latex(markdown_content)

    # project_root should be defined globally or passed in
    templates_dir = Path("templates") 
    full_template_path = templates_dir / template_name

    if full_template_path.exists():
        template_text = full_template_path.read_text()
        
        # 3. Create the replacement map
        # Note: We prioritize {{CONTENT}}. If the LLM generates the Abstract 
        # inside the content, we keep {{ABSTRACT}} empty.
        replacements = {
            "{{TITLE}}": report_title,
            "{{AUTHOR_NAMES}}": author_name,
            "{{DEPARTMENT}}": dept_name,
            "{{COLLEGE_SHORT_NAME}}": college_name,
            "{{CONTENT}}": body_latex,
            "{{ABSTRACT}}": "",  
            "{{REFERENCES}}": ""
        }

        latex_content = template_text
        for placeholder, value in replacements.items():
            latex_content = latex_content.replace(placeholder, str(value))
            
        print(f"[LaTeX Converter] Injected into template: {full_template_path}")
    else:
        print(f"[LaTeX Converter] Template not found at {full_template_path}. Using fallback.")
        latex_content = _wrap_in_document(body_latex, style_name)

    return {"document_content": latex_content}

def _wrap_in_document(body: str, style_name: str) -> str:
    return f"""\\documentclass[12pt]{{article}}
\\usepackage{{amsmath}}
\\usepackage{{geometry}}
\\geometry{{margin=1in}}
\\usepackage{{times}}
\\usepackage{{enumitem}}
\\title{{{style_name}}}
\\begin{{document}}
\\maketitle
{body}
\\end{{document}}
"""

# ============================================================
# GRAPH WIRING
# ============================================================

builder = StateGraph(AgentState)

# Add all nodes
builder.add_node("chunker", chunker_node)
builder.add_node("markdown_format", markdown_format_node)
builder.add_node("reducer", reducer_node)
builder.add_node("style_node", style_retrieval_node)
builder.add_node("pandoc", pandoc_node)

# Wire edges
builder.add_edge(START, "chunker")

# Fan out: chunker → parallel markdown_format (via Send)
builder.add_conditional_edges("chunker", chunk_router, ["markdown_format"])

# Fan in: all parallel markdown_format → reducer
builder.add_edge("markdown_format", "reducer")

# Sequential after reduce
builder.add_edge("reducer", "style_node")
builder.add_edge("style_node", "pandoc")
builder.add_edge("pandoc", END)

memory = InMemorySaver()
app = builder.compile(checkpointer=memory)


# ============================================================
# ENTRY POINT
# ============================================================

@traceable
async def format_graph(raw_text: str, user_query: str):
    initial_inputs: AgentState = {
        "raw_text": raw_text,
        "user_request": user_query,
        "messages": [],
        "markdown_chunks": [],  # Must initialize for the Annotated reducer
    }

    from langchain_core.runnables import RunnableConfig
    config: RunnableConfig = {"configurable": {"thread_id": str(uuid.uuid4())}}

    print("🚀 Starting the Agent...")
    final_state = await app.ainvoke(initial_inputs, config=config)
    
    return {
        "latex_content": final_state["document_content"]  # Final LaTeX string
    }
    """return {
        "markdown_content": final_state["markdown_content"],
        "selected_theme": final_state["selected_theme"],
        "latex_content": final_state["document_content"]  # Final LaTeX string
    }"""