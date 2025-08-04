import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  UserCheck, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Recycle
} from 'lucide-react';
import '../styles/Register.css';

const Register = () => {
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    address: '',
    phoneNumber: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const { name, email, password, role, address, phoneNumber } = formData;

  const onChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!name.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
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
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      setSuccess('Registration successful! Redirecting...');
      setAuth({ token: res.data.token, user: parseJwt(res.data.token) });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const getRoleIcon = (roleValue) => {
    switch(roleValue) {
      case 'admin': return <UserCheck size={16} />;
      case 'garbageCollector': return <Recycle size={16} />;
      default: return <User size={16} />;
    }
  };

  const getRoleDisplayName = (roleValue) => {
    switch(roleValue) {
      case 'admin': return 'Administrator';
      case 'garbageCollector': return 'Waste Collector';
      default: return 'Resident User';
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Left Side - Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="brand-logo">
              <Recycle size={48} />
            </div>
            <h1 className="welcome-title">Join Our Community</h1>
            <p className="welcome-subtitle">
              Create your account to start managing waste collection efficiently and contribute to a cleaner environment.
            </p>
            <div className="features-list">
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Easy waste collection scheduling</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Real-time tracking & updates</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Transparent pricing system</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={20} />
                <span>Environmental impact reporting</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Fill in your details to get started</p>
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

            <form onSubmit={onSubmit} className="register-form" noValidate>
              {/* Personal Information Section */}
              <div className="form-section-title">
                <User size={16} />
                <span>Personal Information</span>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} />
                    <input 
                      id="name"
                      type="text" 
                      name="name" 
                      value={name} 
                      onChange={onChange} 
                      placeholder="Enter your full name" 
                      required 
                      className="input-field"
                      aria-describedby={error && error.includes('name') ? 'name-error' : undefined}
                    />
                  </div>
                </div>

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
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="phoneNumber">Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input 
                      id="phoneNumber"
                      type="tel" 
                      name="phoneNumber" 
                      value={phoneNumber} 
                      onChange={onChange} 
                      placeholder="Enter your phone number" 
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="address">Address</label>
                  <div className="input-wrapper">
                    <MapPin size={18} />
                    <input 
                      id="address"
                      type="text" 
                      name="address" 
                      value={address} 
                      onChange={onChange} 
                      placeholder="Enter your address" 
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="form-section-title">
                <Lock size={16} />
                <span>Security & Role</span>
              </div>

              <div className="form-row">
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
                      placeholder="Create a strong password" 
                      required 
                      className="input-field password-field"
                      aria-describedby={error && error.includes('password') ? 'password-error' : undefined}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="role">Account Type</label>
                  <div className="input-wrapper select-wrapper">
                    {getRoleIcon(role)}
                    <select 
                      id="role"
                      name="role" 
                      value={role} 
                      onChange={onChange} 
                      className="select-field"
                      aria-describedby="role-description"
                    >
                      <option value="user">Resident User</option>
                      <option value="admin">Administrator</option>
                      <option value="garbageCollector">Waste Collector</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Role Description */}
              <div className="role-description" id="role-description">
                <div className="role-info">
                  {getRoleIcon(role)}
                  <div className="role-details">
                    <span className="role-name">{getRoleDisplayName(role)}</span>
                    <span className="role-desc">
                      {role === 'admin' && 'Full system access with user and collector management capabilities'}
                      {role === 'garbageCollector' && 'Access to assigned collection routes and customer management'}
                      {role === 'user' && 'Request waste collection services and track your requests'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className={`register-button ${isLoading ? 'loading' : ''}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserCheck size={18} />
                    Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="form-footer">
                <p className="login-prompt">
                  Already have an account? 
                  <Link to="/login" className="login-link">Sign in here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
