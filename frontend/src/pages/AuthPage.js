import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const formsContainerRef = useRef(null);
  const loginFormRef = useRef(null);
  const signupFormRef = useRef(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});

  // Update container height on form switch
  useEffect(() => {
    const updateHeight = () => {
      const container = formsContainerRef.current;
      const activeForm = isSignUp ? signupFormRef.current : loginFormRef.current;
      
      if (container && activeForm) {
        const height = activeForm.offsetHeight;
        container.style.height = `${height}px`;
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(updateHeight, 50);
    
    // Update on window resize
    window.addEventListener('resize', updateHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, [isSignUp, errors]);

  const handleToggle = (toSignUp) => {
    setIsSignUp(toSignUp);
    setErrors({});
    navigate(toSignUp ? '/signup' : '/login', { replace: true });
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    } else if (loginData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!signupData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!signupData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    return newErrors;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateLogin();
    if (Object.keys(newErrors).length === 0) {
      // TODO: API integration - send loginData to backend
      navigate('/');
    } else {
      setErrors(newErrors);
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateSignup();
    if (Object.keys(newErrors).length === 0) {
      // TODO: API integration - send signupData to backend
      navigate('/');
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image-section">
          <div className="auth-overlay">
            <h2>{isSignUp ? 'Join Our Family' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Create an account and discover timeless elegance' : 'Sign in to continue your journey with timeless elegance'}</p>
          </div>
        </div>
        
        <div className="auth-form-section">
          <div className="auth-form-container">
            <Link to="/" className="auth-logo">
              <img src="/logo.svg" alt="Tanishq" />
            </Link>
            
            <div className="auth-toggle">
              <button 
                className={!isSignUp ? 'active' : ''} 
                onClick={() => handleToggle(false)}
              >
                Sign In
              </button>
              <button 
                className={isSignUp ? 'active' : ''} 
                onClick={() => handleToggle(true)}
              >
                Sign Up
              </button>
            </div>

            <div className="forms-container" ref={formsContainerRef}>
              {/* Login Form */}
              <div className={`auth-form-wrapper ${!isSignUp ? 'active' : ''}`} ref={loginFormRef}>
                <h1>Sign In</h1>
                <p className="auth-subtitle">Welcome back! Please enter your details</p>
                
                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Enter your email"
                      className={errors.email && !isSignUp ? 'error' : ''}
                    />
                    {errors.email && !isSignUp && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter your password"
                      className={errors.password && !isSignUp ? 'error' : ''}
                    />
                    {errors.password && !isSignUp && <span className="error-message">{errors.password}</span>}
                  </div>
                  
                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={handleLoginChange}
                      />
                      <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>
                  
                  <button type="submit" className="auth-submit-btn">
                    Sign In
                  </button>
                  
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>
                  
                  <div className="social-login">
                    <button type="button" className="social-btn">
                      <i className="fab fa-google"></i>
                      Google
                    </button>
                    <button type="button" className="social-btn">
                      <i className="fab fa-facebook-f"></i>
                      Facebook
                    </button>
                  </div>
                </form>
              </div>

              {/* Signup Form */}
              <div className={`auth-form-wrapper ${isSignUp ? 'active' : ''}`} ref={signupFormRef}>
                <h1>Create Account</h1>
                <p className="auth-subtitle">Start your journey with us today</p>
                
                <form onSubmit={handleSignupSubmit} className="auth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={signupData.firstName}
                        onChange={handleSignupChange}
                        placeholder="Enter first name"
                        className={errors.firstName && isSignUp ? 'error' : ''}
                      />
                      {errors.firstName && isSignUp && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={signupData.lastName}
                        onChange={handleSignupChange}
                        placeholder="Enter last name"
                        className={errors.lastName && isSignUp ? 'error' : ''}
                      />
                      {errors.lastName && isSignUp && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="signup-email">Email Address</label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Enter your email"
                      className={errors.email && isSignUp ? 'error' : ''}
                    />
                    {errors.email && isSignUp && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Create a password"
                      className={errors.password && isSignUp ? 'error' : ''}
                    />
                    {errors.password && isSignUp && <span className="error-message">{errors.password}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      placeholder="Confirm your password"
                      className={errors.confirmPassword && isSignUp ? 'error' : ''}
                    />
                    {errors.confirmPassword && isSignUp && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={signupData.agreeToTerms}
                        onChange={handleSignupChange}
                      />
                      <span>
                        I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                      </span>
                    </label>
                    {errors.agreeToTerms && isSignUp && <span className="error-message">{errors.agreeToTerms}</span>}
                  </div>
                  
                  <button type="submit" className="auth-submit-btn">
                    Create Account
                  </button>
                  
                  <div className="auth-divider">
                    <span>or sign up with</span>
                  </div>
                  
                  <div className="social-login">
                    <button type="button" className="social-btn">
                      <i className="fab fa-google"></i>
                      Google
                    </button>
                    <button type="button" className="social-btn">
                      <i className="fab fa-facebook-f"></i>
                      Facebook
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
