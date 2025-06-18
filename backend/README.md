# Welcome Oasis Backend Setup

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- virtualenv (recommended)

## Installation Steps

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Endpoints
- `GET /` - API documentation
- `GET /api/health` - Health check
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-otp` - OTP verification
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password

## Frontend Integration

1. The backend supports CORS, so your frontend can connect from any origin during development.

2. Configure your frontend API calls to use the backend URL:
   - Development: `http://localhost:5000`
   - Production: Your deployed backend URL

3. All API requests should use JSON format for request/response bodies.

4. Authentication is handled via Bearer tokens:
```javascript
headers: {
  'Authorization': 'Bearer <your-token>',
  'Content-Type': 'application/json'
}
```

## Project Structure
```
backend/
├── app.py           # Main application file
├── config.py        # Configuration settings
├── database.py      # Database setup
├── init_db.py       # Database initialization
├── requirements.txt # Dependencies
├── models/         # Database models
├── utils/          # Utility functions
└── logs/          # Application logs (created automatically)
```

## Troubleshooting

1. If database errors occur:
   - Delete the `instance/app.db` file
   - Run `python init_db.py` again

2. If email sending fails:
   - Verify your email provider settings
   - Check if your app password is correct
   - Ensure less secure app access is enabled (if using Gmail)

3. For logging issues:
   - Check the `logs/app.log` file
   - Ensure the `logs` directory exists and is writable

4. If id doesnt work run these in order:
```bash 
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py
python app.py
```
Afterwards the server should start on port 5000 and you can access the API at `http://localhost:5000`.