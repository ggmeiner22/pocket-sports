import { useState } from 'react';
import './registration.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Login from './Login';


function RegistrationPage() {
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, retypePassword] = useState('');
  const navigate = useNavigate();

  const landing = () => {
    navigate('/'); // Corrected the route path
  };

  const login = () => {
    navigate('/login');
  }
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?#&]{8,}$/;
  
    if (!passwordPattern.test(password)) {
      alert('Password must meet requirments.');
      return;
    }
  
    axios.post('http://localhost:3001/register', { fname, lname, email, password, password2 })
      .then(result => {
        console.log(result);
        console.log('Registration successful!');
        setFName('');
        setLName('');
        setEmail('');
        setPassword('');
        retypePassword('');
        navigate('/login');
      })
      .catch(err => {
        console.log(err);
        alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };
  

  return (
    <div>
    <header className="landing-page-header">
        <div className="logo">PocketSports</div>
        <div className="button-container">
        <button onClick={landing} className="coachButton">Home</button>
          <button onClick={login} className="contactButton">Login</button>
        </div>
      </header>
    <div className="registration-container">
      
        <video autoPlay loop muted playsInline className="background-video">
          <source src="Arrows.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      <div className="card">
      <h2>Registration</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="fname">First Name:</label>
            <input
              type="text"
              id="fname"
              value={fname}
              onChange={(e) => setFName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lname">Last Name:</label>
            <input
              type="text"
              id="lname"
              value={lname}
              onChange={(e) => setLName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="password-standards">
            <ul>
              Password requires to have at least: 
              <li className={password.length >= 8 ? 'valid' : 'invalid'}>
                <span className="status-mark">{password.length >= 8 ? '✓' : '✗'}</span> 8 Characters
              </li>
              <li className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                <span className="status-mark">{/[A-Z]/.test(password) ? '✓' : '✗'}</span> 1 Uppercase Letter
              </li>
              <li className={/[0-9]/.test(password) ? 'valid' : 'invalid'}>
                <span className="status-mark">{/[0-9]/.test(password) ? '✓' : '✗'}</span> 1 Number
              </li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : 'invalid'}>
                <span className="status-mark">{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '✗'}</span> 1 Special Character
              </li>
            </ul>
          </div>
          <div className="form-group">
            <label htmlFor="password2">Retype Password:</label>
            <input
              type="password"
              id="password2"
              value={password2}
              onChange={(e) => retypePassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Register</button>
        </form>
      </div>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing
              integrated platforms that streamline coaching and management tasks.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </div>
  );
}

export default RegistrationPage;
