from typing import Optional

# ─────────────────────────────────────────────
# TEMPLATE DEFINITIONS
# ─────────────────────────────────────────────

STYLE_TEMPLATES = [
    {
        "id": 1,
        "name": "Academic Standard",
        "category": "Academic",
        "description": "Standard university format. Times New Roman, 12pt, 1-inch margins.",
        "preview_class": "theme-academic",
        "tex_template_path": "academic_standard.tex",
        "export_engine": "xelatex",
    },
    {
        "id": 2,
        "name": "College Project Report",
        "category": "Educational",
        "description": "College report with cover page and table of contents. For micro projects, internship reports, lab reports.",
        "preview_class": "theme-college-report",
        "tex_template_path": "college_report_v1.tex",
        "export_engine": "xelatex",
    },
    {
        "id": 3,
        "name": "IEEE Research Paper",
        "category": "Professional",
        "description": "Two-column IEEE technical format with LaTeX math support. For research papers and conference submissions.",
        "preview_class": "theme-ieee",
        "tex_template_path": "ieee_template.tex",
        "export_engine": "pdflatex",
    },
]

# ─────────────────────────────────────────────
# KEYWORD MAP
# ─────────────────────────────────────────────

_KEYWORD_MAP = {
    1: ["academic", "university", "thesis", "research", "paper", "formal", "standard"],
    2: ["college", "project", "report", "internship", "lab", "micro", "engineering", "department"],
    3: ["ieee", "conference", "two-column", "technical", "journal", "publication", "math"],
}

# ─────────────────────────────────────────────
# STYLE RETRIEVER
# ─────────────────────────────────────────────

class StyleRetriever:
    """
    Keyword-based style matcher for V1.
    Scores each template against the user query using keyword overlap.
    Falls back to 'College Project Report' if no keywords match.
    """

    def search_style(self, user_query: str) -> dict:
        query_lower = user_query.lower()
        best_id = 2  # default: College Project Report
        best_score = -1

        for template in STYLE_TEMPLATES:
            keywords = _KEYWORD_MAP.get(template["id"], [])
            score = sum(1 for kw in keywords if kw in query_lower)

            # Boost if template name itself appears in query
            if template["name"].lower() in query_lower:
                score += 5

            if score > best_score:
                best_score = score
                best_id = template["id"]

        result = next(t for t in STYLE_TEMPLATES if t["id"] == best_id)
        distance = round(1.0 - min(best_score / 10, 1.0), 4)

        return {
            "id": result["id"],
            "name": result["name"],
            "preview_class": result["preview_class"],
            "tex_template_path": result["tex_template_path"],
            "export_engine": result["export_engine"],
            "distance": distance,
        }

    def get_by_name(self, name: str) -> Optional[dict]:
        """Direct lookup by exact template name."""
        return next(
            (t for t in STYLE_TEMPLATES if t["name"].lower() == name.lower()),
            None,
        )

    def get_all(self) -> list:
        """Return all templates — used by frontend style picker endpoint."""
        return STYLE_TEMPLATES