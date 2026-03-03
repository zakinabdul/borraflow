"""Helper functions"""


def format_response(data, message: str = None, success: bool = True):
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