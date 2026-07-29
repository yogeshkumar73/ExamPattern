"""
Structured logging utility for Battle Service.
"""

import logging
import sys
from typing import Optional


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Create a structured logger with consistent formatting.

    Args:
        name: Logger name (typically __name__ of the calling module).

    Returns:
        Configured Logger instance.
    """
    logger = logging.getLogger(name or "battle-service")

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.DEBUG)
        logger.propagate = False

    return logger
