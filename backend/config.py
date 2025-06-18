import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, 'instance')
SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(DB_DIR, "app.db")}'

# JWT
SECRET_KEY = 'your-secret-key-here'  # Change this to a secure random key

# Email Configuration
EMAIL_PROVIDER = os.getenv('EMAIL_PROVIDER', 'outlook')  # 'gmail' or 'outlook'

# Gmail Settings
GMAIL_SMTP = {
    'server': 'smtp.gmail.com',
    'port': 587,
    'use_tls': True
}

# Outlook Settings
OUTLOOK_SMTP = {
    'server': 'smtp-mail.outlook.com',
    'port': 587,
    'use_tls': True
}

# Use these settings based on provider
SMTP_CONFIG = OUTLOOK_SMTP if EMAIL_PROVIDER == 'outlook' else GMAIL_SMTP
SMTP_SERVER = SMTP_CONFIG['server']
SMTP_PORT = SMTP_CONFIG['port']
SMTP_USE_TLS = SMTP_CONFIG['use_tls']

# Your email credentials
SMTP_USERNAME = 'your-email@outlook.com'  # Replace with your email
SMTP_PASSWORD = 'your-app-password'       # Replace with your app password

# To get an App Password for Gmail:
# 1. Go to Google Account Settings
# 2. Security
# 3. 2-Step Verification (enable it)
# 4. App passwords
# 5. Generate new app password for 'Mail'

# For Outlook, use the app password generated in your Microsoft account security settings
