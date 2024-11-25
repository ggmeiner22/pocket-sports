import './TeamHome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Use Axios for HTTP requests

function HomePage() {
 
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [rosterPopup, showRosterPopup] = useState(false);
  const [roster, setRoster] = useState([]);

  const getRoster = async () => {
    const team = localStorage.getItem('selectedTeam');
    try {
      const response = await axios.get('http://localhost:3001/roster', {
        params: {team: team}
      });
      console.log(response.data);
      setRoster(response.data);
    } catch(err) {
      console.error(err);
    }
  }

  const home = () => {
    navigate('/teams');
  }

  const handleCloseRosterPopup = () => {
    showRosterPopup(false);
  }

  const handleRosterPopup = async () => {
    await getRoster();
    showRosterPopup(true);
  }


  // Fetch team colors when the component loads or `team` changes
  useEffect(() => {
    const storedTeam = localStorage.getItem('selectedTeam');
    if (storedTeam) {
      setSelectedTeam(JSON.parse(storedTeam));
    }
  }, []);

  return (
    <div className="App">
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'black' }}>PocketSports</a>
          <button onClick={home} className="coachButton">Teams</button>
        </div>
        <div className="button-container"></div>
      </header>
      <div style={{backgroundColor: selectedTeam?.teamColors?.[0] || 'white'}}>
        <div className="content">
          <div><p className="img-text">Tailored Training for Peak Performance</p></div>
          <button className="coachButton" onClick={handleRosterPopup}>View Roster</button>
        </div>
      </div>
      {rosterPopup && (
          <div className="popup-top">
          <div className="popup-content">
            <div>
              <label>
                  Roster
              </label>
              <button className="topButtons" type="button" onClick={handleCloseRosterPopup}>Close</button>
              <div className="roster-list">
              {roster.length > 0 ? (
                roster.map((player, index) => (
                  <div key={index} className="roster-item">
                    <p><strong>First Name:</strong> {player.fname}</p>
                    <p><strong>Last Name:</strong> {player.lname}</p>
                    <p><strong>Role:</strong> {player.role}</p>
                  </div>
                ))
              ) : (
                <p>No players found in the roster.</p>
              )}
            </div>
            </div>
          </div>
          </div>
        )}
      <footer className="footer1">
        <div className="container1">
          <div className="footer-column1">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing
              integrated platforms that streamline coaching and management tasks.
            </p>
          </div>
        </div>
        <div className="bottom1">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
