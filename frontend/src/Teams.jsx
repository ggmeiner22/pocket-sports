import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Teams.css';
import axios from 'axios';
import { useRef } from 'react';

function TeamsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [teamColors, setTeamColors] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [showInviteToTeamPopup, setInviteToTeamPopup] = useState(false);
  const [userId, setUserId] = useState('');  // userId state
  const [inviteEmail, setEmailInvite] = useState(''); // State for email invite
  const [joinCode, setJoinCode] = useState('')

  const [selectedSport, setSelectedSport] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  
  const [userDetails, setUserDetails] = useState(null);


  const navigate = useNavigate();
  const colors = ['#8b0000', '#006400', '#191970', '#ff8c00', '#daa520', '#663399',];
  const landing = () => {
    navigate('/');
  };

  const fileInputRef = useRef();

  const handleFileChange = async (e) => {
    console.log("📂 File input triggered");
    const file = e.target.files[0];
    if (!file) return;
    console.log("📁 File chosen:", file.name);
  
    const formData = new FormData();
    formData.append('profilePicture', file);
  
    const storedUserId = localStorage.getItem('userId');
  
    try {
      const response = await fetch(`http://localhost:3001/upload-profile/${storedUserId}`, {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
  
      if (response.ok && data.profilePicture) {
        const fullPath = `http://localhost:3001${data.profilePicture}`;
        // ✅ Update userDetails directly
        setUserDetails((prev) => ({
          ...prev,
          profilePicture: fullPath
        }));
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };


  const seedDefaultDrills = async (teamId) => {
    let defaultDrill;

    if (selectedSport === 'Lacrosse') {
      defaultDrill = { drillName: 'Shuttle Drill', pdfPath: '/uploads/Shuttle Drill.pdf', teamId: teamId };
    } else if (selectedSport === 'Basketball') {
      defaultDrill = { drillName: 'Layup Drill', pdfPath: '/uploads/Layup Drill.pdf', teamId: teamId };
    } else if (selectedSport === 'Volleyball') {
      defaultDrill = { drillName: 'Net Dig Drill', pdfPath: '/uploads/Net Dig Drill.pdf', teamId: teamId };
    }
  
    try {
       
      const response = await fetch(`http://localhost:3001${defaultDrill.pdfPath}`);
      const blob = await response.blob();

      // Convert the Blob to a Base64 string
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Extract Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    
      const drill = base64String;
      const params = {
        teamId: teamId,
        drillName: defaultDrill.drillName,
        pdfB64: base64String
      }

      console.log(params);
      await axios.post('http://localhost:3001/drillbank', params);
  
      // Send the drills with Base64 strings to the backend
      // await axios.post('http://localhost:3001/drills', drillsWithBase64);
      console.log('Default drills seeded successfully.');
    } catch (error) {
      console.error('Error seeding default drills:', error);
    }
  };
  

  // Handle profile modal visibility
  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  // Close the profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  const handleInviteClosePopup = () => {
    setInviteToTeamPopup(false);
  }
  

  const login = () => {
    navigate('/login');
  };

  const goToTeamPage = (team) => {
    // Store the selected team data in localStorage
    localStorage.setItem('selectedTeam', JSON.stringify(team));
    if (localStorage.getItem('role') === 'Owner') {
      localStorage.setItem('role', 'Player'); // Update role to Player
    } else {
      localStorage.setItem('role', 'Owner'); // Update role to Owner (you can change this logic as needed)
    }
    navigate('/homepage');
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

  const getUserDetails = () => {
    const storedUserId = localStorage.getItem('userId');
  
    if (!storedUserId) {
      console.log('User ID is missing');
      return;
    }
  
    fetch(`http://localhost:3001/registers/${storedUserId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => {
        const fullProfilePath = data.profilePicture
          ? `http://localhost:3001${data.profilePicture}`
          : null;
  
        setUserDetails({
          firstName: data.fname,
          lastName: data.lname,
          email: data.email,
          profilePicture: fullProfilePath
        });
  
        // If you’re still using a separate `profilePicture` state
        if (fullProfilePath) {
          setProfilePicture(fullProfilePath);
        }
      })
      .catch((err) => {
        console.error('Error fetching user details:', err);
        alert('Failed to load user details. Please try again later.');
      });
  };
  


  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); // Fetch userId from localStorage
    if (storedUserId) {
      setUserId(storedUserId); // Set userId state from localStorage
      getTeams(); // Fetch teams if userId exists
      getUserDetails(); // Updates user profile data
    } else {
      console.log('User ID not available');
    }
  }, [userId]);

  // Handle the "Create Team" form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    const newTeam = {
      teamName,
      organizationName,
      teamColors,
      selectedSport,
      createdBy: userId, // Pass userId to associate the team with the logged-in user
      joinCode,
    };
  
    try {
      const response = await axios.post('http://localhost:3001/teams', newTeam);
      console.log("Response from /teams endpoint:", response); // Log the full response
      const newTeamId = response.data; // Access the teamId from the response

      // Fetch updated list of teams
      getTeams();
      setShowPopup(false); // Close the popup
      setTeamName('');
      setOrganizationName('');
      setTeamColors('');
      setSelectedSport('');
      setJoinCode('');
  
      // Optionally seed default drills for the new team
      console.log("Seeding default drills for team ID:", newTeamId);
      seedDefaultDrills(newTeamId);
    } catch (err) {
      console.error("Error creating team:", err);
      alert("Error creating team. Please try again.");
    }
  };
    

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    console.log('made it to handler');
    
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
    } catch (error) {
      console.error("Error joining team:", error);
      alert("Failed to join the team. Please try again.");
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    console.log('made it to handler');
    
    const storedUserId = localStorage.getItem('userId');  // Get userId
    
    // Make a POST request to leave the team
    try {
      const response = await axios.post('http://localhost:3001/leaveTeam', {
        teamId: teamId,
        userId: storedUserId
      });
      console.log(response.data);
      // Refresh teams list
      getTeams();
    } catch (error) {
      console.error("Error leaving team:", error);
      alert("Failed to leave the team. Please try again.");
    }
  }

  const handleInviteToTeamSubmit = async (e) => {
    // Prevent default form submission
    e.preventDefault();
    console.log("📧 Invite email:", inviteEmail);

    // Make a POST request to invite to the team
    try {
      const response = await axios.post('http://localhost:3001/invite-to-team', {
        email: inviteEmail,
        teamId: teamId,
      });
      console.log(response.data);
      alert("Successfully invited to the team!");
      // Refresh teams list
      handleInviteClosePopup();
      getTeams();
    } catch (error) {
      console.error("Error inviting to team:", error);
      alert("Failed to invite to the team. Please try again.");
    }
  }


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

  
  const handleDeleteTeam = async (teamId, ownerId) => {
    const currentUserId = localStorage.getItem('userId');
  
    if (currentUserId !== ownerId) {
      alert("You do not have permission to delete this team.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this team?")) return;
  
    try {
      await axios.delete(`http://localhost:3001/teams/${teamId}`, {
        headers: {
          userId: currentUserId
        }
      });
      getTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Error deleting team. Try again.");
    }
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
      
      <div className="bodyHome">
        {showPopup && (
          <div className="popup-top">
            <div className="popup-content" style={{border: "2px solid white", backgroundColor: 'black', color:'white'}}>
              <h2>Create a New Team</h2>
              <form onSubmit={handleSubmit}>
                <label style={{ color:'white'}}>
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
                <label style={{ color:'white'}}>
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
                <label style={{ color:'white'}}>
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
                <label style={{ color:'white'}}>
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
          <div className="popup-content" style={{border: "2px solid white", backgroundColor: 'black', color:'white'}}>
            <form onSubmit={handleJoinSubmit}>
              <label style={{color: 'white'}}>
                  Enter the 4-digit Team Code:
                  <input
                    type="text"
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    />
              </label>
              <button className="topButtons" type="button" onClick={handleCloseJoinPopup}>Cancel</button>
              <button className="topButtons" type='submit' onClick={handleJoinSubmit}>Submit Team Code</button>
            </form>
          </div>
          </div>
        )}

        {showInviteToTeamPopup && (
          <div className="popup-top">
            <div className="popup-content" style={{border: "2px solid white", backgroundColor: 'black', color:'white'}}>
              <h2>Invite to Team</h2>
              <form onSubmit={handleInviteToTeamSubmit}>
                <label style={{ color:'white'}}>
                  Invite Code:
                  <input
                    type="text"
                    id="email"
                    placeholder='Enter the email of the person you want to invite'
                    onChange={(e) => setEmailInvite(e.target.value)}
                    required
                  />
                </label>
                <br />
                <div className="popup-buttons">
                  <button className="topButtons" type="button" onClick={handleInviteClosePopup}>Cancel</button>
                  <button className="topButtons" type="submit"onClick={handleInviteToTeamSubmit}>Send Invite</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ul className="teamsList">
          {teams.map((team, index) => (
            <li key={index} onClick={() => goToTeamPage(team)} className="team-card">
              <div className="team-info">
                <div className="teamName"><strong>{team.teamName}</strong></div>
                <div className="organizationName">{team.organizationName}</div>
                <div className="selectedSport">
                  Sport: <strong>{team.selectedSport}</strong>
                </div>
              </div>
              <div className="team-actions">
              {team.createdBy !== userId && (
                <button
                  className="topButtons"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTeamId(team._id);
                    handleLeaveSubmit(e);
                  }}
                  >
                  Leave Team -
                </button>
                )}
                {team.createdBy === userId && (
                  <button
                    className="topButtons"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeamId(team._id);
                      setInviteToTeamPopup(true);
                    }}
                  >
                    Invite to Team +
                  </button>
                )}
                <button
                  className="topButtons"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToTeamPage(team);
                  }}
                  >
                  Select Team +
                </button>
                <button
                  className="delete-team-x"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTeam(team._id, team.createdBy);
                  }}
                  title="Delete team"
                  >
                  ❌
                </button>
              </div>
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
                  src={userDetails?.profilePicture || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="profile-img"
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  ref={fileInputRef}
                  className="file-input"
                />
              </div>
              <div className="profile-details">
                <p><strong>First Name:</strong> {userDetails.firstName}</p>
                <p><strong>Last Name:</strong> {userDetails.lastName}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
              </div>
            </div>
            <button onClick={closeProfileModal} className="close-btn">Save</button>
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
