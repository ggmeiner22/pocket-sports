import './goals-page.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests
import { useNavigate, useLocation } from 'react-router-dom';


function GoalsPage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
    const [buttons, setButtons] = useState([
      { path: "/homepage", label: "Home" },
      { path: "/roster", label: "Roster" },
      { path: "/calendarpage", label: "Calendar" },
      { path: "/goalspage", label: "Goals" },
    ]);
    const navigate = useNavigate();
    const location = useLocation();
  
    useEffect(() => {
      // Retrieve the selected team and role from localStorage
      const storedTeam = localStorage.getItem('selectedTeam');
      const storedRole = localStorage.getItem('role');
  
      console.log("Stored role:", storedRole); // Check role in localStorage
  
      if (storedTeam) {
        setSelectedTeam(JSON.parse(storedTeam)); // Update selected team if available
      }
  
      if (storedRole === "Owner") {
        setButtons((prevButtons) => {
          // Prevent adding the button twice
          if (!prevButtons.some(button => button.path === "/practiceplans")) {
            return [
              ...prevButtons,
              { path: "/practiceplans", label: "Practice Plans" }
            ];
          }
          return prevButtons;
        });
      }
  
    }, []);

  return (
    <div className='App'>
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/teams" style={{ textDecoration: 'none', color: 'black'}}>PocketSports</a>
        </div>
        <div className="headerButton-container">
        {buttons.map((button) => (
                <button
                    key={button.path}
                    className={`headerButton ${location.pathname === button.path ? "active" : ""}`}
                    onClick={() => navigate(button.path)}
                >
                    {button.label}
                </button>
            ))}
        </div>
        <div className="button-container">
          <button className="contactButton1">Contact Us</button>
        </div>
      </header>
      <body></body>
      <footer className="footer1">
        <div className="footer-container1">
          <div className="footer-column1">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing
              integrated platforms that streamline coaching and management tasks.
            </p>
          </div>
        </div>
        <div className="footer-bottom1">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default GoalsPage;
