"""Local extensions package to ensure local imports are used.

This file ensures `import extensions` resolves to the project package
instead of the unrelated third-party `extensions` distribution that
expects Python 2 modules like `ConfigParser`.
"""

from .mongo import mongo
from .jwt import jwt

__all__ = ["mongo", "jwt"]
