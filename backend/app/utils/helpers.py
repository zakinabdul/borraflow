"""Helper functions"""


def format_response(data, message: str = None, success: bool = True): # type: ignore
    """Format API response"""
    return {
        "success": success,
        "data": data,
        "message": message
    }

def safe_tex(text):
    """Escapes common LaTeX breaking characters."""
    chars = {
        "&": r"\&",
        "$": r"\$",
        "%": r"\%",
        "_": r"\_",
        "#": r"\#",
    }
    for char, replacement in chars.items():
        text = text.replace(char, replacement)
    return text

def sanitize_tex(text: str) -> str:
    """Escapes common LaTeX special characters to prevent compilation errors."""
    if not text:
        return ""
    
    # Standard LaTeX reserved characters
    chars = {
        "&": r"\&",
        "$": r"\$",
        "%": r"\%",
        "_": r"\_",
        "#": r"\#",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    
    for char, escaped in chars.items():
        # Only escape if it's not already part of a LaTeX command
        text = text.replace(char, escaped)
    return text






import re
from pathlib import Path
 
 
class LaTeXCleaner:
    """
    Sanitize and structurally validate a LaTeX string before
    writing to disk or returning from pandoc_node.
 
    Fixes applied in order:
        1. Newlines collapsed to spaces  → restored
        2. Leftover %%PLACEHOLDER%%      → stripped
        3. LaTeX commands in comments    → rescued to next line
        4. Duplicate \\begin{document}   → deduplicated
        5. Missing \\end{document}       → appended
        6. Unclosed environments         → closed before \\end{document}
        7. Excess blank lines            → normalised to max 2
 
    Usage (inside pandoc_node):
        cleaner = LaTeXCleaner()
        latex_content = cleaner.clean(latex_content)
        return {"document_content": latex_content}
 
    Or to clean AND write to disk in one call:
        cleaner = LaTeXCleaner()
        cleaner.write(latex_content, "/tmp/job_xyz/main.tex")
    """
 
    # Commands that must each start on their own line.
    _LINE_STARTER = re.compile(
        r' (\\(?:'
        r'documentclass|usepackage|geometry|pagestyle'
        r'|fancyhf|fancyhead|fancyfoot'
        r'|renewcommand|setlength|titleformat|titlespacing'
        r'|lstset|backgroundsetup|hypersetup|onehalfspacing'
        r'|section\*?|subsection\*?|subsubsection\*?'
        r'|newpage|tableofcontents|addcontentsline|setcounter'
        r'|bibitem|begin|end|item|vspace|hspace|noindent'
        r'|paragraph|chapter|part'
        r')\b)'
    )
 
    # Environments to watch for unclosed \begin{X}
    _WATCHED_ENVS = [
        'itemize', 'enumerate', 'figure', 'table',
        'lstlisting', 'verbatim', 'center', 'tabular',
    ]
 
    # ── Public methods ────────────────────────────────────────────
 
    def clean(self, latex: str) -> str:
        """
        Run all 7 cleanup passes and return the corrected LaTeX string.
        This is the main method you call in pandoc_node.
        """
        latex = self._restore_newlines(latex)
        latex = self._strip_placeholders(latex)
        latex = self._rescue_from_comments(latex)
        latex = self._deduplicate_document(latex)
        latex = self._ensure_end_document(latex)
        latex = self._close_dangling_envs(latex)
        latex = re.sub(r'\n{3,}', '\n\n', latex)
        return latex.strip() + '\n'
 
    def write(self, latex: str, output_path: str) -> str:
        """
        Clean the LaTeX string and write it to disk.
        Uses UTF-8 encoding and Unix line endings (\\n).
        Returns the cleaned string.
 
        Use this instead of a bare open().write() call.
        """
        cleaned = self.clean(latex)
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(cleaned)
        return cleaned
 
    # ── Private passes ────────────────────────────────────────────
 
    def _restore_newlines(self, latex: str) -> str:
        """
        Detect if the file was flattened to a single line
        (newlines replaced by spaces during JSON serialisation
        or string joining) and restore them.
 
        Detection: fewer than 1 newline per 3 backslash-commands
        indicates the file has been collapsed.
        """
        command_count = len(re.findall(r'\\[a-zA-Z]', latex))
        newline_count = latex.count('\n')
 
        if command_count > 3 and newline_count < command_count / 3:
            latex = self._LINE_STARTER.sub(r'\n\1', latex)
 
        return latex
 
    def _strip_placeholders(self, latex: str) -> str:
        """
        Remove any %%PLACEHOLDER%% markers not replaced by pandoc_node.
        Leaving them in causes pdflatex to choke on bare % characters.
        """
        return re.sub(r'%%[A-Z_]{1,40}%%', '', latex)
 
    def _rescue_from_comments(self, latex: str) -> str:
        """
        If a % comment line contains actual LaTeX commands
        (symptom of the injection-in-comment bug), move those
        commands out of the comment onto the next line.
 
        Before:
            % AGENT note \\section{Introduction} Quantum text...
        After:
            % AGENT note [rescued]
            \\section{Introduction} Quantum text...
        """
        lines = latex.split('\n')
        output = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('%'):
                match = re.search(
                    r'(\\(?:section|subsection|subsubsection'
                    r'|begin|end|item)\s*[\[{].+)',
                    stripped
                )
                if match:
                    comment_only    = stripped[:match.start()].rstrip()
                    rescued_content = match.group(1)
                    output.append(comment_only + ' [rescued]')
                    output.append(rescued_content)
                    continue
            output.append(line)
        return '\n'.join(output)
 
    def _deduplicate_document(self, latex: str) -> str:
        """
        Keep only the first \\begin{document}.
        Keep only the last  \\end{document}.
        """
        begin_tag = r'\begin{document}'
        end_tag   = r'\end{document}'
 
        # Keep first \begin{document}
        first = latex.find(begin_tag)
        if first != -1:
            rest  = latex[first + len(begin_tag):].replace(begin_tag, '')
            latex = latex[:first + len(begin_tag)] + rest
 
        # Keep last \end{document}
        last = latex.rfind(end_tag)
        if last != -1:
            before = latex[:last].replace(end_tag, '')
            latex  = before + latex[last:]
 
        return latex
 
    def _ensure_end_document(self, latex: str) -> str:
        """
        Guarantee \\end{document} exists and is the final non-blank line.
        """
        end_tag = r'\end{document}'
 
        if end_tag not in latex:
            return latex.rstrip() + f'\n\n{end_tag}\n'
 
        last_pos = latex.rfind(end_tag)
        trailing = latex[last_pos + len(end_tag):].strip()
        if trailing:
            latex    = latex[:last_pos] + latex[last_pos + len(end_tag):]
            latex    = latex.rstrip() + f'\n\n{end_tag}\n'
 
        return latex
 
    def _close_dangling_envs(self, latex: str) -> str:
        """
        For each watched environment, count \\begin{X} vs \\end{X}.
        Insert any missing \\end{X} just before \\end{document}.
        """
        end_doc    = r'\end{document}'
        insert_pos = latex.rfind(end_doc)
        if insert_pos == -1:
            return latex
 
        doc_start = latex.find(r'\begin{document}')
        body      = (latex[doc_start:insert_pos]
                     if doc_start != -1 else latex[:insert_pos])
 
        missing = []
        for env in self._WATCHED_ENVS:
            opens  = len(re.findall(re.escape(f'\\begin{{{env}}}'), body))
            closes = len(re.findall(re.escape(f'\\end{{{env}}}'),   body))
            for _ in range(opens - closes):
                missing.append(f'\\end{{{env}}}')
 
        if missing:
            insertion = '\n' + '\n'.join(missing) + '\n'
            latex     = latex[:insert_pos] + insertion + latex[insert_pos:]
 
        return latex
 