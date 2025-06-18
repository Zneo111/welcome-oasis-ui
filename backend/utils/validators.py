import re
from email_validator import validate_email, EmailNotValidError

def validate_password(password):
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"

def validate_email_address(email):
    try:
        validate_email(email)
        return True, "Email is valid"
    except EmailNotValidError as e:
        return False, str(e)
