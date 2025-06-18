import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import "./Login.css";

const API_URL = '/api';

const roles = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Super Admin" },
];

const handleAxiosError = (err: any) => {
  console.error('API Error:', err);
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return 'An unexpected error occurred';
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [canResendOTP, setCanResendOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("All fields are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = isSignUp ? `${API_URL}/register` : `${API_URL}/login`;
      const response = await axios.post(endpoint, {
        email,
        password,
        role,
      });

      // Handle OTP verification flow
      if (response.data.message?.includes("verify OTP")) {
        setVerificationEmail(email);
        setShowOtpInput(true);
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      if (role === "student") {
        navigate("/dashboard/student");
      } else if (role === "teacher") {
        navigate("/dashboard/teacher");
      } else if (role === "admin") {
        navigate("/dashboard/admin");
      }
    } catch (err) {
      setError(handleAxiosError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_URL}/verify-otp`, {
        email: verificationEmail,
        otp: otpCode
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", role);
        navigate(`/dashboard/${role}`);
      }
    } catch (err) {
      setError(handleAxiosError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email) {
      setError("Please enter your email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { 
        email,
        role // Include role in the request
      });
      
      if (response.data.message) {
        // Show success message
        const successMessage = "If this email exists in our system, you will receive a reset link shortly.";
        alert(successMessage);
        setShowForgotPassword(false);
      }
    } catch (err) {
      console.error('Forgot Password Error:', err.response?.data || err.message);
      // Show generic message for security
      setError("Unable to process request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResendOTP) return;
    
    try {
      await axios.post(`${API_URL}/resend-otp`, {
        email: verificationEmail
      });
      setCanResendOTP(false);
      setResendTimer(30);
      startResendTimer();
    } catch (err) {
      setError(handleAxiosError(err));
    }
  };

  const startResendTimer = () => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResendOTP(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (showOtpInput) {
    return (
      <div className="login-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="login-card">
          <div className="card-header">
            <h2>Verify OTP</h2>
            <p>Enter the code sent to {verificationEmail}</p>
          </div>
          <form onSubmit={handleOtpVerification} className="login-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input otp-input"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            <p className="otp-info">
              {canResendOTP ? (
                <button type="button" onClick={handleResendOTP} className="resend-otp">
                  Resend OTP
                </button>
              ) : (
                `Resend OTP in ${resendTimer}s`
              )}
            </p>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="login-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        <div className="login-card">
          <div className="card-header">
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            {error && <div className="error-message">{error}</div>}
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="link-btn"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="login-card">
        <div className="card-header">
          <h2>Welcome Back!</h2>
          <p>{isSignUp ? "Create your account" : "Sign in to continue"}</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="input-group">
            <User className="input-icon" size={20} />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight size={20} />
              </>
            )}
          </button>
          {error && <div className="error-message">{error}</div>}
          <div className="form-footer">
            {!isSignUp && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-btn"
              >
                Forgot Password?
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="link-btn primary"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
