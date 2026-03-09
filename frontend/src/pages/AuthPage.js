import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react';
import './AuthPage.css';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');
  const formsContainerRef = useRef(null);
  const loginFormRef = useRef(null);
  const signupFormRef = useRef(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
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
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

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

    const timer = setTimeout(updateHeight, 50);
    window.addEventListener('resize', updateHeight);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, [isSignUp, errors, verifying]);

  const handleToggle = (toSignUp) => {
    setIsSignUp(toSignUp);
    setErrors({});
    setVerifying(false);
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
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    let label = '';
    let color = '';
    if (password.length === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Weak';
      color = '#dc3545';
    } else if (score <= 4) {
      label = 'Medium';
      color = '#ffc107';
    } else {
      label = 'Strong';
      color = '#28a745';
    }
    setPasswordStrength({ score, label, color });
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
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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

  // Handle Sign In with Clerk
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateLogin();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!signInLoaded) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await signIn.create({
        identifier: loginData.email,
        password: loginData.password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid email or password';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up with Clerk
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateSignup();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!signUpLoaded) return;

    setLoading(true);
    setErrors({});

    try {
      await signUp.create({
        emailAddress: signupData.email,
        password: signupData.password,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err) {
      console.error('Sign up error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to create account';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleVerification = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setSignUpActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid verification code';
      setErrors({ verification: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth (Google/Facebook)
  const handleOAuth = async (provider) => {
    if (!signInLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: `oauth_${provider}`,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err) {
      console.error('OAuth error:', err);
      setErrors({ general: 'Failed to connect with ' + provider });
    }
  };

  // Verification form for email code
  if (verifying) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-image-section">
            <div className="auth-overlay">
              <h2>Verify Your Email</h2>
              <p>We've sent a verification code to your email</p>
            </div>
          </div>
          
          <div className="auth-form-section">
            <div className="auth-form-container">
              <Link to="/" className="auth-logo">
                <img src="/logo.svg" alt="Tanishq" />
              </Link>
              
              <div className="auth-form-wrapper active" style={{ position: 'relative' }}>
                <h1>Check Your Email</h1>
                <p className="auth-subtitle">Enter the verification code sent to {signupData.email}</p>
                
                <form onSubmit={handleVerification} className="auth-form">
                  {errors.verification && <div className="error-banner">{errors.verification}</div>}
                  
                  <div className="form-group">
                    <label htmlFor="code">Verification Code</label>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={errors.verification ? 'error' : ''}
                      autoFocus
                    />
                  </div>
                  
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : 'Verify Email'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => setVerifying(false)}
                  >
                    <i className="fas fa-arrow-left"></i> Back to Sign Up
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                
                {errors.general && <div className="error-banner">{errors.general}</div>}
                
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
                      disabled={loading}
                    />
                    {errors.email && !isSignUp && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        id="login-password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        className={errors.password && !isSignUp ? 'error' : ''}
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
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
                  
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Signing In...</> : 'Sign In'}
                  </button>
                  
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>
                  
                  <div className="social-login">
                    <button type="button" className="social-btn" onClick={() => handleOAuth('google')}>
                      <i className="fab fa-google"></i>
                      Google
                    </button>
                    <button type="button" className="social-btn" onClick={() => handleOAuth('facebook')}>
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
                
                {errors.general && <div className="error-banner">{errors.general}</div>}
                
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
                        disabled={loading}
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
                        disabled={loading}
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
                      disabled={loading}
                    />
                    {errors.email && isSignUp && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        id="signup-password"
                        name="password"
                        value={signupData.password}
                        onChange={handleSignupChange}
                        placeholder="Create a password"
                        className={errors.password && isSignUp ? 'error' : ''}
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {signupData.password && (
                      <div className="password-strength">
                        <div className="strength-bars">
                          {[1, 2, 3, 4, 5, 6].map((bar) => (
                            <div 
                              key={bar} 
                              className={`strength-bar ${bar <= passwordStrength.score ? 'active' : ''}`}
                              style={{ backgroundColor: bar <= passwordStrength.score ? passwordStrength.color : '#e0e0e0' }}
                            ></div>
                          ))}
                        </div>
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                    <div className="password-requirements">
                      <span className={signupData.password.length >= 8 ? 'met' : ''}>
                        <i className={`fas ${signupData.password.length >= 8 ? 'fa-check' : 'fa-times'}`}></i> 8+ characters
                      </span>
                      <span className={/[A-Z]/.test(signupData.password) ? 'met' : ''}>
                        <i className={`fas ${/[A-Z]/.test(signupData.password) ? 'fa-check' : 'fa-times'}`}></i> Uppercase
                      </span>
                      <span className={/[a-z]/.test(signupData.password) ? 'met' : ''}>
                        <i className={`fas ${/[a-z]/.test(signupData.password) ? 'fa-check' : 'fa-times'}`}></i> Lowercase
                      </span>
                      <span className={/[0-9]/.test(signupData.password) ? 'met' : ''}>
                        <i className={`fas ${/[0-9]/.test(signupData.password) ? 'fa-check' : 'fa-times'}`}></i> Number
                      </span>
                      <span className={/[^a-zA-Z0-9]/.test(signupData.password) ? 'met' : ''}>
                        <i className={`fas ${/[^a-zA-Z0-9]/.test(signupData.password) ? 'fa-check' : 'fa-times'}`}></i> Special char
                      </span>
                    </div>
                    {errors.password && isSignUp && <span className="error-message">{errors.password}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={signupData.confirmPassword}
                        onChange={handleSignupChange}
                        placeholder="Confirm your password"
                        className={errors.confirmPassword && isSignUp ? 'error' : ''}
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
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
                  
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating Account...</> : 'Create Account'}
                  </button>
                  
                  <div className="auth-divider">
                    <span>or sign up with</span>
                  </div>
                  
                  <div className="social-login">
                    <button type="button" className="social-btn" onClick={() => handleOAuth('google')}>
                      <i className="fab fa-google"></i>
                      Google
                    </button>
                    <button type="button" className="social-btn" onClick={() => handleOAuth('facebook')}>
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
