import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import (
    SMTP_SERVER, SMTP_PORT, SMTP_USERNAME,
    SMTP_PASSWORD, SMTP_USE_TLS, EMAIL_PROVIDER
)
from utils.logger import logger

def get_smtp_settings():
    return {
        'outlook': {
            'server': 'smtp-mail.outlook.com',
            'port': 587,
            'require_tls': True
        },
        'gmail': {
            'server': 'smtp.gmail.com',
            'port': 587,
            'require_tls': True
        }
        # Add more providers as needed
    }.get(EMAIL_PROVIDER, {})

def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Email sent successfully to {to_email} using {EMAIL_PROVIDER}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email via {EMAIL_PROVIDER}: {str(e)}")
        raise Exception(f"Email service error: {str(e)}")

def send_otp(email, otp):
    subject = "Your OTP Code"
    body = f"Your OTP code is: {otp}. Valid for 10 minutes."
    send_email(email, subject, body)

def send_reset_link(email, token):
    subject = "Password Reset Request"
    body = f"Click this link to reset your password: YOUR_FRONTEND_URL/reset-password?token={token}"
    send_email(email, subject, body)
