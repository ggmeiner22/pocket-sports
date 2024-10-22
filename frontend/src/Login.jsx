import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const navigate = useNavigate();

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
      })
      .catch(err => {
        console.log(err);
        alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };

  const goToRegister = () => {
    navigate('/register');  // Navigate to the register page
  };

  const handleClose = () => {

    // PUT CONNECTION TO LANDING PAGE HERE
    setShowModal(false);
    navigate('/');  // Optionally navigate after closing the modal
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100"> 
      <div className="bg-white p-4 rounded w-75 m-3">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 rounded-0">
            Login
          </button>
          <p className="text-center mt-2">Need to register?</p>
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
    </div>
  );
}

export default Login;
