from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
from passlib.hash import pbkdf2_sha256

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    otp = Column(String(6), nullable=True)
    otp_valid_until = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=False)
    reset_token = Column(String(100), nullable=True)
    
    def set_password(self, password):
        self.password_hash = pbkdf2_sha256.hash(password)
    
    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.password_hash)
