from flask import Flask, jsonify, request, render_template_string
from werkzeug.exceptions import HTTPException, NotFound
from flask_cors import CORS
from models.user import User
from utils.auth import generate_otp, generate_reset_token, verify_reset_token, verify_token
from utils.email_service import send_otp, send_reset_link
from utils.validators import validate_password, validate_email_address
from utils.logger import logger
from database import db_session, engine
from sqlalchemy import text
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def check_database():
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

# Run the check when creating the app
check_database()

# Add health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.errorhandler(Exception)
def handle_exception(error):
    code = 500
    if isinstance(error, HTTPException):
        code = error.code
    logger.error(f"Error: {str(error)}")
    return jsonify({"error": str(error)}), code

# Add 404 handler
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "error": "404 Not Found",
        "message": "The requested URL was not found on the server",
        "path": request.path
    }), 404

@app.route('/', methods=['GET'])
def root():
    routes = [
        {'path': '/', 'method': 'GET', 'description': 'API Documentation'},
        {'path': '/api/health', 'method': 'GET', 'description': 'Health Check'},
        {'path': '/api/register', 'method': 'POST', 'description': 'User Registration'},
        {'path': '/api/login', 'method': 'POST', 'description': 'User Login'},
        {'path': '/api/verify-otp', 'method': 'POST', 'description': 'OTP Verification'},
        {'path': '/api/forgot-password', 'method': 'POST', 'description': 'Password Reset Request'},
        {'path': '/api/reset-password', 'method': 'POST', 'description': 'Password Reset'}
    ]
    
    return jsonify({
        "message": "Welcome to the API",
        "version": "1.0",
        "available_routes": routes
    })

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Validate email
        is_valid_email, email_message = validate_email_address(data['email'])
        if not is_valid_email:
            return jsonify({"error": email_message}), 400

        # Validate password
        is_valid_password, password_message = validate_password(data['password'])
        if not is_valid_password:
            return jsonify({"error": password_message}), 400

        user = User.query.filter_by(email=data['email']).first()
        if user:
            return jsonify({"error": "Email already registered"}), 400
        
        user = User(email=data['email'])
        user.set_password(data['password'])
        user.otp = generate_otp()
        user.otp_valid_until = datetime.utcnow() + timedelta(minutes=10)
        
        db_session.add(user)
        db_session.commit()
        
        send_otp(user.email, user.otp)
        logger.info(f"User registered successfully: {data['email']}")
        return jsonify({"message": "Registration successful. Please verify OTP."})

    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.json
        if not data or 'email' not in data or 'otp' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        user = User.query.filter_by(email=data['email']).first()
        
        if not user or user.otp != data['otp'] or datetime.utcnow() > user.otp_valid_until:
            return jsonify({"error": "Invalid OTP"}), 400
        
        user.is_verified = True
        user.otp = None
        db_session.commit()
        logger.info(f"OTP verified for user: {data['email']}")

        return jsonify({"message": "Email verified successfully"})

    except Exception as e:
        logger.error(f"OTP verification failed: {str(e)}")
        raise

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.is_verified:
        return jsonify({"error": "Email not verified"}), 401
    
    # Generate new OTP for 2FA
    user.otp = generate_otp()
    user.otp_valid_until = datetime.utcnow() + timedelta(minutes=10)
    db_session.commit()
    
    send_otp(user.email, user.otp)
    return jsonify({"message": "Please verify OTP to complete login"})

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        if not data or 'email' not in data:
            return jsonify({
                "error": "Email is required"
            }), 400

        user = User.query.filter_by(email=data['email']).first()
        
        # For security, don't reveal if user exists
        if user:
            reset_token = generate_reset_token(user.id)
            user.reset_token = reset_token
            db_session.commit()
            
            try:
                send_reset_link(user.email, reset_token)
                logger.info(f"Password reset email sent to {user.email}")
            except Exception as e:
                logger.error(f"Failed to send reset email: {str(e)}")
                db_session.rollback()
                return jsonify({
                    "error": "Email service temporarily unavailable"
                }), 500

        # Always return success to prevent email enumeration
        return jsonify({
            "message": "If the email exists, a reset link has been sent"
        }), 200

    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return jsonify({
            "error": "Unable to process request"
        }), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    user_id = verify_reset_token(data['token'])
    
    if not user_id:
        return jsonify({"error": "Invalid or expired token"}), 400
    
    user = User.query.get(user_id)
    user.set_password(data['new_password'])
    user.reset_token = None
    db_session.commit()
    
    return jsonify({"message": "Password reset successful"})

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend is working!"})

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json
    return jsonify({
        "status": "success",
        "received_data": data
    })

@app.route('/api/user/delete', methods=['DELETE'])
def delete_user():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "No authorization token provided"}), 401

        token = auth_header.split(' ')[1]
        user_data = verify_token(token)
        if not user_data:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = User.query.get(user_data['user_id'])
        if not user:
            return jsonify({"error": "User not found"}), 404

        db_session.delete(user)
        db_session.commit()

        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        logger.error(f"Account deletion failed: {str(e)}")
        db_session.rollback()
        return jsonify({"error": "Failed to delete account"}), 500

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == '__main__':
    app.run(debug=True)
