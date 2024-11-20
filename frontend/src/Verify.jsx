import { useState } from 'react';
import './registration.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false); 
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const email = location.state?.email;

  const handleChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value;
    setCode(newCode);
  };

  const landing = () => {
    navigate('/'); // Corrected the route path
  };

  const login = () => {
    navigate('/login');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join('');

    axios.post("http://localhost:3001/verifycode", {email: email, code: verificationCode})
        .then(result => 
            console.log("Verification email successful")
        ).catch(err => {
            console.log(err)
            alert('Verification failed: ' + (err.response?.data || 'Verification failed. Please check your information and try again.'));
        })
    alert('Verification successful!');
    navigate('/login');
  };

  const handleClose = () => {
    setShowModal(false);
    navigate('/login');  // Optionally navigate after closing the modal
  };

  return (
    <div className="registration-container">
      <header className="registration-page-header">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>PocketSports</a>
        </div>
      </header>
      <video autoPlay loop muted playsInline className="background-video">
        <source src="Arrows.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <p>Please submit the 6 digit code sent to your email.</p>
      <div id="code-container">
      {code.map((digit, index) => (
          <input
            key={index}
            className="code-input"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
          />
        ))}
        <button onClick={handleSubmit} type="submit" className="code-submit-button">Submit Verification Code</button>
      </div>
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

export default Verify;
