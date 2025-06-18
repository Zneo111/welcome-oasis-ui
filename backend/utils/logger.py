import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger():
    if not os.path.exists('logs'):
        os.makedirs('logs')

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    file_handler = RotatingFileHandler(
        'logs/app.log', 
        maxBytes=1024 * 1024,
        backupCount=5
    )
    file_handler.setFormatter(formatter)

    logger = logging.getLogger('app')
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    
    return logger

logger = setup_logger()
