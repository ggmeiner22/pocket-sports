import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'
import { Modal, Button } from 'react-bootstrap';

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault()
    axios.post('http://localhost:3001/register', {name, email, password})
      .then(result => {
        console.log(result);
        console.log('Registration successful!');
        setShowModal(true)

        console.log('Before clearing:', { name, email, password });
        setName('');
        setEmail('');
        setPassword('');
        console.log('After clearing:', { name, email, password }); // Log cleared values


      })
    .catch(err => {
      console.log(err)
      alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error'));
    })
  }

  const goToLogin = () => {
    navigate('/login'); // Navigate to the login page
  };

  const handleClose = () => {
    
    setShowModal(false);
    navigate('/');  // Optionally navigate after closing the modal
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100"> 
      <div className="bg-white p-4 rounded w-75 m-3"> {/* Wider and added margin */}
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3"> 
            <label htmlFor="name">
              <strong>Name</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
              className="form-control rounded-0"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
          </button>
          <p className="text-center mt-2">Already Have an Account?</p>
          <button type="button" className="btn btn-light border w-100 rounded-0" onClick={goToLogin}>
            Login
          </button>
        </form>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Registration Successful</Modal.Title>
          </Modal.Header>
          <Modal.Body>You are now registered!</Modal.Body>
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

export default Register;
