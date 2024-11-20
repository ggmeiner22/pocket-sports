import './TeamHome.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests

function HomePage() {
  // const [color, setColor] = useState('');

  // // Function to fetch team colors
  // const getTeamColors = async () => {
  //   try {
  //     // Make an HTTP GET request to fetch team details
  //     const response = await axios.get(`http://localhost:3001/teams/${team}`);
  //     const teamColors = response.data.teamColors;

  //     if (teamColors && teamColors.length > 0) {
  //       setColor(teamColors[0]); // Use the first color as the primary color
  //     } else {
  //       console.log('No colors found for the team');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching team colors:', error);
  //   }
  // };

  // // Fetch team colors when the component loads or `team` changes
  // useEffect(() => {
  //   if (team) {
  //     getTeamColors();
  //   }
  // }, [team]);

  return (
    <div className="landing-page">
      <header className="landing-page-header">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'white' }}>PocketSports</a>
        </div>
        <div className="button-container"></div>
      </header>
      <div className="App"></div>
      <div className="image-screen">
        <div className="content">
          <div><p className="img-text">Tailored Training for Peak Performance</p></div>
        </div>
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

export default HomePage;
