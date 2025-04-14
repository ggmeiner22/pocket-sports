import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import TeamsPage from './Teams';
import { Link } from 'react-router-dom';



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);  // State to control password visibility
  const [showModal, setShowModal] = useState(false);  // State to control modal visibility
  const navigate = useNavigate();

  const landing = () => {
    navigate('/'); // Corrected the route path
  };

  const teams = () => {
    navigate('/teams');
  }

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        console.log(result);
        const userId = result.data.userId;  // Get the userId from the backend response
        console.log('USERID::');
        console.log(userId);
        localStorage.setItem('userId', userId);

        //const { userId, firstName, lastName, email } = result.data;  // Get user details from response
        //setUserId(userId);  // Set the userId to state
        /*setUserDetails({
          firstName: firstName,
          lastName: lastName,
          email: email,
        }); */ // Dynamically set the user details to state

      console.log("User details stored:", result.data);

       

        console.log("User ID received:", userId);

       
        console.log("User ID stored:", userId);
        

        setShowModal(true);  // Show the modal on successful login

        // Clear input fields
        setEmail('');
        setPassword('');
        teams();  // Redirect to the teams page after successful login
      })
      .catch(err => {
        console.log(err);
        alert('Login failed: ' + (err.response?.data || 'Login failed. Please check your information and try again.'));
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
      <header className="landing-page-header">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>PocketSports</a>
        </div>
        <div className="button-container">
          <button className="contactButton">Contact Us</button>
        </div>
      </header>
      <video autoPlay loop muted playsInline className="background-video">
          <source src="Arrows.mp4" type="video/mp4" />
          Your browser does not support the video tag.
      </video>
      <div className="card" style={{marginTop:'10vh'}}>
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
          <button type="button" className="register-button" onClick={goToRegister}>
            Register
          </button>

          <button
              type="button"
              className="forgot-password-button"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
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
