import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

function AfterLoginTemp() {
  const navigate = useNavigate();
  
  const goToRegister = () => {
    navigate('/registration');  // Navigate to the register page
  };

  return (
    <div className="registration-container"> 
        <video autoPlay loop muted playsInline className="background-video">
            <source src="Arrows.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <button type="button" className="submit-button" onClick={goToRegister}>
            Back to Registration
        </button>
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

export default AfterLoginTemp;
