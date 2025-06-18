
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import "./Login.css";

const roles = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Super Admin" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = isSignUp ? "/api/register" : "/api/login";
      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, {
        email,
        password,
        role,
      });

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
      setError(err.response?.data?.message || `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`);
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
      await axios.post("http://127.0.0.1:5000/api/forgot-password", { email });
      setError(""); // Clear any previous errors
      alert("Password reset link sent to your email!");
      setShowForgotPassword(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
