import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  CheckCircle,
  Recycle,
  ArrowRight
} from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { email, password } = formData;

  const onChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!email.trim()) return 'Email is required';
    if (!password.trim()) return 'Password is required';
    return null;
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      setSuccess('Login successful! Redirecting...');
      setAuth({ token: res.data.token, user: parseJwt(res.data.token) });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch(err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Welcome Back Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="brand-logo">
              <Recycle size={48} />
            </div>
            <h1 className="welcome-title">Welcome Back!</h1>
            <p className="welcome-subtitle">
              Sign in to your account to continue managing your waste collection services and track your environmental impact.
            </p>
            <div className="features-list">
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Manage your waste requests</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Track collection status</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>View payment history</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Monitor environmental impact</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Sign In</h2>
              <p className="form-subtitle">Enter your credentials to access your account</p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="alert alert-error" role="alert" aria-live="polite">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success" role="alert" aria-live="polite">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="login-form" noValidate>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} />
                  <input 
                    id="email"
                    type="email" 
                    name="email" 
                    value={email} 
                    onChange={onChange} 
                    placeholder="Enter your email" 
                    required 
                    className="input-field"
                    aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">Password</label>
                <div className="input-wrapper password-wrapper">
                  <Lock size={18} />
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={password} 
                    onChange={onChange} 
                    placeholder="Enter your password" 
                    required 
                    className="input-field password-field"
                    aria-describedby={error && error.includes('password') ? 'password-error' : undefined}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" className="checkbox" />
                  <label htmlFor="remember" className="checkbox-label">Remember me</label>
                </div>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                className={`login-button ${isLoading ? 'loading' : ''}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="form-footer">
                <p className="register-prompt">
                  Don't have an account? 
                  <Link to="/register" className="register-link">Create one here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
