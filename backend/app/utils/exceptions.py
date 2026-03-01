"""Custom exceptions"""


class BorraflowException(Exception):
    """Base exception for Borraflow"""
    pass


class UserNotFoundError(BorraflowException):
    """User not found error"""
    pass


class AuthenticationError(BorraflowException):
    """Authentication error"""
    pass


class AgentNotFoundError(BorraflowException):
    """Agent not found error"""
    pass
