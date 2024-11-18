import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Teams.css';
import axios from 'axios';

function TeamsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [teamColors, setTeamColors] = useState('');
  const [teams, setTeams] = useState([]);
  const [userId, setUserId] = useState(null);  // userId state

  const [selectedSport, setSelectedSport] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [userDetails, setUserDetails] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  });

  const navigate = useNavigate();

  // Handle logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId'); // Ensure userId is removed when logging out
    navigate('/login', { replace: true });
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

  // Fetch teams created by the logged-in user
  const getTeams = async () => {

    try {
      const userId = localStorage.getItem('userId');  // Retrieve userId from localStorage
      console.log("T: User ID received:", userId);  // Check if userId is being fetched correctly

    if (!userId) {
      console.log("User ID is missing");
      return;  // Exit early if userId is missing
    }
 
      const response = await axios.get('http://localhost:3001/teams', {
          headers: { 
            userId: userId 
          }
      });

      console.log(response.data);  // Log the response from the server
      setTeams(response.data);

    } catch (error) {
      console.error("Error fetching teams:", error);
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
    };

    axios.post('http://localhost:3001/teams', newTeam)
      .then(() => {
        getTeams();  // Fetch updated list of teams
        setShowPopup(false);  // Close the popup
        setTeamName('');
        setOrganizationName('');
        setTeamColors('');
        setSelectedSport('');
      })
      .catch((err) => {
        console.log(err);
        alert('Error creating team');
      });
  };

  // Show popup to create a new team
  const handleCreateTeam = () => {
    setShowPopup(true);
  };

  // Close the team creation popup
  const handleClosePopup = () => {
    setShowPopup(false);
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
        <button className="topButtons">Join Team +</button>
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
                  <input
                    type="text"
                    id="teamColors"
                    value={teamColors}
                    onChange={(e) => setTeamColors(e.target.value)}
                    placeholder="e.g., Blue, Red"
                    required
                  />
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

        <h2>Teams List</h2>
        <ul className="teamsList">
          {teams.map((team, index) => (
            <li key={index}>
              <div>
                <div className="teamName"><strong>{team.teamName}</strong></div>
                <div className="organizationName">{team.organizationName}</div>
              </div>
              <button className="topButtons">Select Team +</button>
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
