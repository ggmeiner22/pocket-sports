import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // State to control password visibility
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        console.log(result);
        console.log('Login successful!');

        setShowModal(true);  // Show the modal on successful login

        // Clear input fields
        setEmail('');
        setPassword('');
        goToTempPage();
      })
      .catch(err => {
        console.log(err);
        alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };

  const goToTempPage = () => {
    navigate('/temp');  // Navigate to the temp page
  };

  const goToRegister = () => {
    navigate('/registration');  // Navigate to the register page
  };

  // PUT CONNECTION TO LANDING PAGE HERE
  const handleClose = () => {
    setShowModal(false);
    navigate('/');  // Optionally navigate after closing the modal
  };

  return (
    <div className="registration-container"> 
      <video autoPlay loop muted playsInline className="background-video">
          <source src="Arrows.mp4" type="video/mp4" />
          Your browser does not support the video tag.
      </video>
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <span onClick={toggleShowPassword} className="toggle-password">
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <button type="submit" className="submit-button">
            Login
          </button>
          <button type="button" className="btn btn-light border w-100 rounded-0" onClick={goToRegister}>
            Register
          </button>
        </form>

        {/* Confirmation Modal */}
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Login Successful</Modal.Title>
          </Modal.Header>
          <Modal.Body>You are now logged in!</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
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

export default Login;
