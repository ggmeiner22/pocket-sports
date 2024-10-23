import { useState } from 'react';
import './registration.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Regular expression to validate the password
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!passwordPattern.test(password)) {
      alert('Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return; // Prevent form submission
    }
  
    axios.post('http://localhost:3001/register', { fname, lname, email, password })
      .then(result => {
        console.log(result);
        console.log('Registration successful!');
        setFName('');
        setLName('');
        setEmail('');
        setPassword('');
        navigate('/login');
      })
      .catch(err => {
        console.log(err);
        alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };
  

  return (
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
  );
}

export default RegistrationPage;
