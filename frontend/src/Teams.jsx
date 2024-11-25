import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Teams.css';
import axios from 'axios';

function TeamsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [teamColors, setTeamColors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userId, setUserId] = useState('');  // userId state
  const [joinCode, setJoinCode] = useState('')

  const [selectedSport, setSelectedSport] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [userDetails, setUserDetails] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  });

  const navigate = useNavigate();
  const colors = ['#8b0000', '#006400', '#191970', '#ff8c00', '#daa520', '#663399'];
  const landing = () => {
    navigate('/');
  };

  const login = () => {
    navigate('/login');
  };

  const goToTeamPage = (team) => {
    localStorage.setItem('selectedTeam', JSON.stringify(team));
    navigate('/home');
  };


  // Handle profile modal visibility
  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  // Close the profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  // Handle file upload for the profile picture
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); // Ensure userId is removed when logging out
    navigate('/login', { replace: true });
  };

  const handleTeamChange = (e) => {
    setselectedSport(e.target.value);
  };

  const handleColorClick = (color) => {
    if (teamColors.includes(color)) {
      setTeamColors(teamColors.filter((c) => c !== color));
    } else {
      setTeamColors([...teamColors, color]);
    }
  };

  const getTeams = async () => {

    try {
      const storedUserId = localStorage.getItem('userId');  // Retrieve userId from localStorage
      console.log("Fetching teams for userId:", storedUserId);  // Check if userId is being fetched correctly

    if (!storedUserId) {
      console.log("User ID is missing");
      return;  // Exit early if userId is missing
    }
 
      const response = await axios.get('http://localhost:3001/teams', {
          headers: { 
            userId: storedUserId 
          }
      });

      console.log("Teams fetched:", response.data); // Inspect server response
      setTeams(response.data);

    } catch (error) {
      console.error("Error fetching teams:", error.response || error.message);
      alert("Failed to fetch teams. Please try again later.");
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); // Fetch userId from localStorage
    if (storedUserId) {
      setUserId(storedUserId); // Set userId state from localStorage
      getTeams(); // Fetch teams if userId exists
    } else {
      console.log('User ID not available');
    }
  }, [userId]);

  // Handle the "Create Team" form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');  // Retrieve userId from localStorage
    const newTeam = {
      teamName,
      organizationName,
      teamColors,
      selectedSport,
      createdBy: userId,  // Pass userId to associate the team with the logged-in user
      joinCode
    };

    const getUserDetails = () => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        console.log('User ID is missing');
        return;
      }
      axios.get(`http://localhost:3001/registers/${storedUserId}`)
        .then((response) => response.json())
        .then((data) => {
          setUserDetails({
            firstName: data.fname,
            lastName: data.lname,
            email: data.email,
          });
        })
        .catch((err) => {
          console.error('Error fetching user details:', err);
          alert('Failed to load user details. Please try again later.');
        });
    };

    axios.post('http://localhost:3001/teams', newTeam)
      .then(() => {
        getTeams();  // Fetch updated list of teams
        setShowPopup(false);  // Close the popup
        setTeamName('');
        setOrganizationName('');
        setTeamColors('');
        setSelectedSport('');
        setJoinCode('');
      })
      .catch((err) => {
        console.log(err);
        alert(err + 'Error creating team');
      });
  };


  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    
    const storedUserId = localStorage.getItem('userId');  // Get userId
    // Make a POST request to join the team
    try {
      const response = await axios.post('http://localhost:3001/joinTeam', {
        teamCode: joinCode,
        userId: storedUserId
      });
      console.log(response.data);
      alert("Successfully joined the team!");
      // Refresh teams list
      handleCloseJoinPopup();
      getTeams();
      getUserDetails();
    } catch (error) {
      console.error("Error joining team:", error);
      alert("Failed to join the team. Please try again.");
    }
  };


  // Show popup to create a new team
  const handleCreateTeam = () => {
    setShowPopup(true);
  };

  // Close the team creation popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleJoinTeam = () => {
    setShowJoinPopup(true);
  }

  const handleTeamCode = () => {
    code = teamCode
  }

  const handleCloseJoinPopup = () => {
    setShowJoinPopup(false);
  };

  return (
    <div className="teams-container">
      <header className="landing-page-header">
        <div className="logo">PocketSports</div>
        <div className="button-container">
          <button onClick={logout} className="coachButton">Logout</button>
          <button onClick={handleProfileClick} className="contactButton">Profile</button>
        </div>
      </header>
      
      <div className="createButtons">
        <button className="topButtons" onClick={handleCreateTeam}>Create Team +</button>
        <button className="topButtons" onClick={handleJoinTeam}>Join Team +</button>
      </div>
      
      <div className="body">
        {showPopup && (
          <div className="popup-top">
            <div className="popup-content">
              <h2>Create a New Team</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Team Name:
                  <input
                    type="text"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Organization Name:
                  <input
                    type="text"
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Team Colors:
                  <div style={{ display: 'flex', gap: '10px' }}>
                {colors.map((color) => (
                  <div
                    key={color}
                    onClick={() => handleColorClick(color)}
                    style={{
                      backgroundColor: color,
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: teamColors.includes(color) ? '3px solid white' : '1px solid black',
                      transition: 'transform 0.2s ease',
                    }}
                  ></div>
                ))}
              </div>
                </label>
                <label>
                  Intended Sport:
                  <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} required>
                    <option value="" disabled>Select a sport</option>
                    <option>Lacrosse</option>
                    <option>Basketball</option>
                    <option>Volleyball</option>
                  </select>
                </label>
                <br />
                <div className="popup-buttons">
                  <button className="topButtons" type="button" onClick={handleClosePopup}>Cancel</button>
                  <button className="topButtons" type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinPopup && (
          <div className="popup-top">
          <div className="popup-content">
            <form onSubmit={handleJoinSubmit}>
              <label>
                  Enter the 4-digit Team Code:
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                  />
              </label>
              <button className="topButtons" type='submit'>Submit Team Code</button>
              <button className="topButtons" type="button" onClick={handleCloseJoinPopup}>Cancel</button>
            </form>
          </div>
          </div>
        )}

        <h2>Teams List</h2>
        <ul className="teamsList">
          {teams.map((team, index) => (
            <li key={index}>
            <div>
            <div className="teamName"><strong>{team.teamName}</strong></div>
            <div className="organizationName">{team.organizationName}</div>
            <p>Code: <strong>{team.teamCode}</strong></p>
            </div>
            <button className= 'topButtons' onClick={() => goToTeamPage(team)}>View Team</button>
          </li>
          ))}
        </ul>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal">
          <div className="profile-modal-content">
            <h2>Profile</h2>
            <div className="profile-info">
              <div className="profile-picture">
                <img
                  src={profilePicture || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="profile-img"
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="file-input"
                />
              </div>
              <div className="profile-details">
                <p><strong>First Name:</strong> {userDetails.firstName}</p>
                <p><strong>Last Name:</strong> {userDetails.lastName}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
              </div>
            </div>
            <button onClick={closeProfileModal} className="close-btn">Close</button>
          </div>
        </div>
      )}

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

export default TeamsPage;
