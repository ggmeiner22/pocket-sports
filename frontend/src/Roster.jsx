import './Roster.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import axios from 'axios';

function Roster() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([]);
  const [playerDetails, setPlayerDetails] = useState({});  // Store player details
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" }
  ]);
  const [loading, setLoading] = useState(false);  // Loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedTeamString = localStorage.getItem('selectedTeam');
    const storedRole = localStorage.getItem('role');
    if (storedTeamString) {
      setSelectedTeam(JSON.parse(storedTeamString));
    }
    setTeamName(storedTeamString || '');

    if (storedRole === "Owner") {
      setButtons((prevButtons) => {
        if (!prevButtons.some(button => button.path === "/practiceplans")) {
          return [
            ...prevButtons,
            { path: "/practiceplans", label: "Practice Plans" }
          ];
        }
        return prevButtons;
      });
    }

    getRoster();  // Fetch the roster
  }, []); 

  const getUserDetails = async (playerId) => {
    try {
      const response = await axios.get(`http://localhost:3001/registers/${playerId}`);
      return response.data;  // Return user details for a specific player
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const getRoster = async () => {
    setLoading(true);
    try {
      const storedTeamString = localStorage.getItem("selectedTeam");
      const storedTeam = storedTeamString ? JSON.parse(storedTeamString) : null;
      const storedTeamId = storedTeam?._id;

      if (!storedTeamId) {
        console.log("Team ID is missing");
        return;
      }

      const response = await axios.get('http://localhost:3001/useronteams', {
        headers: {
          teamId: storedTeamId
        },
      });
      setPlayers(response.data);
      
      // Fetch player details for each player
      const playerDetailsPromises = response.data.map(player => getUserDetails(player.userId));  // Assuming `userId` is the field
      const details = await Promise.all(playerDetailsPromises);

      const playerDetailsMap = details.reduce((acc, userDetails, idx) => {
        acc[response.data[idx].userId] = userDetails;
        return acc;
      }, {});
      
      setPlayerDetails(playerDetailsMap);  // Save details in state
    } catch (error) {
      console.error("Error fetching players:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRosterCards = () => {
    return players.map((player, index) => {
      const playerDetail = playerDetails[player.userId];  // Access player details from state
      if (!playerDetail) return null;  // If no details available, skip rendering this player

      return (
        <Card key={index} className='card-events'>
          <Card.Header as='h5'>{player.role}</Card.Header>
          <Card.Body>
            <Card.Title>{playerDetail.fname} {playerDetail.lname}</Card.Title> {/* Display player details */}
            <Card.Text>Email: {playerDetail.email}</Card.Text>
            <Button
              style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'gray' }} 
              variant='primary'
              onClick={() => navigate("/calendarpage")}
            >
              Learn More
            </Button>
          </Card.Body>
        </Card>
      );
    });
  };

  return (
    <div style={{ backgroundColor: 'whitesmoke' }} className='App'>
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/teams" style={{ textDecoration: 'none', color: 'black' }}>PocketSports</a>
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
      <strong className='homepage-headers'>Your Team</strong>

      <div style={{ backgroundColor: 'whitesmoke' }}>
        {loading ? <p>Loading roster...</p> : renderRosterCards()}
      </div>

      <footer className="footer1" style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'white', color: 'whitesmoke' }}>
        <div className="footer-container1">
          <div className="footer-column1">
            <h4>About Us</h4>
            <p>We are committed to empowering emerging sports by providing integrated platforms that streamline coaching and management tasks.</p>
          </div>
        </div>
        <div className="footer-bottom1">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Roster;
