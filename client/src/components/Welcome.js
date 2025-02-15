import React, { useState } from 'react';
import '../stylesheets/Welcome.css';
import axios from 'axios';

function Welcome({ navigate, userChange }) {
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match.');
    } else {
      try {
        const response = await axios.post('http://localhost:8000/users', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          displayName: formData.displayName,
          password: formData.password,
        });
        console.log('User data saved:', response.data.savedUser);
        setShowSignupForm(false);
        setPasswordError('');
        
        // navigate back to welcome page
        userChange(null); // probably redundant
        navigate('welcome');
      } catch (error) {
        console.error('Error creating user:', error);
        setPasswordError(error.response?.data?.message || 'An error occurred.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginData.email === '' || loginData.password === '') {
      setLoginError('Please enter both email and password.');
    } else {
      try {
        const response = await axios.post('http://localhost:8000/login', {
          email: loginData.email,
          password: loginData.password,
        });
        console.log('Login successful:', response.data);
        // Get user info and store token in it, this will be shared to navigate
        let user = response.data.user
        user.token = response.data.token
        setLoginError('');

        // navigate to home page of logged in user.
        userChange(user);
        navigate('home');
      } catch (error) {
        console.error('Login error:', error);
        setLoginError(error.response?.data?.message || 'An error occurred.');
      }
    }
  };

  const guestUser = {
    displayName: 'Guest',
    isGuest: true
  }

  return (
    <div className="welcome-page">
      {!showSignupForm && !showLoginForm ? (
        <>
          <h1>Welcome to Phreddit!</h1>
          <p>Choose an option:</p>
          <button onClick={() => setShowSignupForm(true)}>Register as a New User</button>
          <button onClick={() => setShowLoginForm(true)}>Login as an Existing User</button>
          <button onClick={() => { userChange(guestUser); navigate('home') }}>Continue as a Guest</button>
        </>
      ) : showSignupForm ? (
        <div className="signup-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email (Account Name)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            {passwordError && <p className="error">{passwordError}</p>}
            <button type="submit">Sign Up</button>
            <button type="button" onClick={() => setShowSignupForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      ) : showLoginForm ? (
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                required
              />
            </div>
            {loginError && <p className="error">{loginError}</p>}
            <button type="submit">Login</button>
            <button type="button" onClick={() => setShowLoginForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default Welcome;
