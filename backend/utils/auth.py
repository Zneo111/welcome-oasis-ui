import random
import string
from datetime import datetime, timedelta
import jwt
from config import SECRET_KEY

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_reset_token(user_id):
    return jwt.encode(
        {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(hours=24)},
        SECRET_KEY,
        algorithm='HS256'
    )

def verify_reset_token(token):
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return data['user_id']
    except:
        return None

def verify_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except:
        return None
