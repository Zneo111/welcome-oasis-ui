from passlib.hash import pbkdf2_sha256

def hash_password(password):
    """Hash a password using PBKDF2-SHA256."""
    return pbkdf2_sha256.hash(password)

def verify_password(password, hash):
    """Verify a password against its hash."""
    return pbkdf2_sha256.verify(password, hash)
