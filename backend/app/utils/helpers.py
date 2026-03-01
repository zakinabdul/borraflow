"""Helper functions"""


def format_response(data, message: str = None, success: bool = True):
    """Format API response"""
    return {
        "success": success,
        "data": data,
        "message": message
    }
