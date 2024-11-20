import './TeamHome.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests

function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    // Retrieve the selected team from localStorage
    const storedTeam = localStorage.getItem('selectedTeam');
    if (storedTeam) {
      setSelectedTeam(JSON.parse(storedTeam));
    }
  }, []);

  return (
    <div className='App'>
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'black'}}>PocketSports</a>
        </div>
        <div className="button-container"></div>
      </header>
      <div style={{backgroundColor: selectedTeam?.teamColors?.[0] || 'white'}}>
        <div className="content">
          <div><p className="img-text">Tailored Training for Peak Performance</p></div>
        </div>
      </div>
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

export default HomePage;
