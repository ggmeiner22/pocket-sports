import { useState } from 'react';
import './Verify.css';
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
    const value = e.target.value;
  
    // Only allow digits
    if (!/^[0-9]?$/.test(value)) return;
  
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  
    // Move to next input if value is not empty and it's not the last box
    if (value && index < code.length - 1) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  
    // Backspace logic (optional)
    if (!value && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
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
     
      <div className="codeContainer" id="code-container">
      <p className='text'>Please submit the 6 digit code sent to your email.</p>
      <div>
      {code.map((digit, index) => (
          <input
            key={index}
            id={`code-${index}`}
            className="code-input"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
          />
        ))}
        </div>
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
