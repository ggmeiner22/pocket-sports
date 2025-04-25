import './Roster.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
//import { Dropdown, Form } from 'react-bootstrap';

function Roster() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]); // Array of UserOnTeam documents
  const [playerDetails, setPlayerDetails] = useState({}); // Extra info from Register (if any)
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Individual toggle states for extra info visibility (controlled by Owner)
  const [showPosition, setShowPosition] = useState(true);
  const [showHeight, setShowHeight] = useState(true);
  const [showWeight, setShowWeight] = useState(true);

  //const [filterShowPosition, setFilterShowPosition] = useState(true);
  //const [filterShowHeight, setFilterShowHeight] = useState(true);
  //const [filterShowWeight, setFilterShowWeight] = useState(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All"); // All, Coach, Player




  // Role-change modal state (for non-self role changes)
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [roleToChange, setRoleToChange] = useState("Player");
  const [newOwnerCandidate, setNewOwnerCandidate] = useState("");

  // Edit User Info modal state (available for all users)
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({
    playerPosition: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    playerStats: []
  });
  const [availableStats, setAvailableStats] = useState([]);  // list from drillStats
  const [newStat, setNewStat] = useState({ statName: "", statValue: "" });
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [viewStatsData, setViewStatsData] = useState([]);



  const navigate = useNavigate();
  const location = useLocation();

  // Header buttons
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" },
  ]);

  const currentUserId = localStorage.getItem('userId');
  const storedRole = localStorage.getItem('role');


  // Load team from localStorage and fetch roster

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole === null) {
      console.log("No role found in localStorage.");
    } else {
      console.log("the Stored role:", storedRole);  // Log if it's Owner
    }
  }, []);
  
  
  useEffect(() => {
    
    const storedTeamString = localStorage.getItem('selectedTeam');
    if (storedTeamString) {
      const team = JSON.parse(storedTeamString);
      setSelectedTeam(team);
    }
    getRoster();
  }, []);  // Add role as dependency
  

  // When selectedTeam is loaded, fetch its extra info visibility settings from the backend
  useEffect(() => {
    if (selectedTeam && selectedTeam._id) {
      loadTeamSettings();
    }
  }, [selectedTeam]);

  // Loads team settings (expects extraInfoVisibility field on team document)
  const loadTeamSettings = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/teams/${selectedTeam._id}`);
      const settings = response.data.extraInfoVisibility;
      if (settings) {
        setShowPosition(settings.showPosition);
        setShowHeight(settings.showHeight);
        setShowWeight(settings.showWeight);
      }
    } catch (error) {
      console.error("Error loading team settings:", error);
    }
  };  

  // Update team settings so that toggles persist for all users
  const updateTeamSettings = async (newSettings) => {
    try {
      const response = await axios.put(
        `http://localhost:3001/teams/${selectedTeam._id}/extraInfoVisibility`,
        { extraInfoVisibility: newSettings }
      );
      // Update local state with response from backend
      setShowPosition(response.data.extraInfoVisibility.showPosition);
      setShowHeight(response.data.extraInfoVisibility.showHeight);
      setShowWeight(response.data.extraInfoVisibility.showWeight);
    } catch (error) {
      console.error("Error updating team settings:", error);
    }
  };

  const getUserDetails = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/registers/${userId}`);
      return response.data;
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
      const storedTeamId = storedTeam ? storedTeam._id : null;
      if (!storedTeamId) {
        console.log("Team ID is missing");
        return;
      }
      const rosterRes = await axios.get('http://localhost:3001/useronteams', {
        headers: { teamId: storedTeamId },
      });
      const rosterData = rosterRes.data;
      setPlayers(rosterData);
      const me = rosterData.find((p) => p.userId === currentUserId);
      if (me) {
        setCurrentUserRole(me.role);
        if (me.role === "Owner" || me.role === "Coach") {
          setButtons((prev) => {
            if (!prev.some(b => b.path === "/drills")) {
              return [...prev, { path: "/drills", label: "Drills" }];
            }
            if (!prev.some(b => b.path === "/practiceplans")) {
              return [...prev, { path: "/practiceplans", label: "Practice Plans" }];
            }
            return prev;
          });
        }
      }
      
      const detailPromises = rosterData.map((p) => getUserDetails(p.userId));
      const details = await Promise.all(detailPromises);
      const detailsMap = details.reduce((acc, userObj, idx) => {
        const uid = rosterData[idx].userId;
        acc[uid] = userObj;
        return acc;
      }, {});
      setPlayerDetails(detailsMap);
    } catch (error) {
      console.error("Error fetching roster:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId) => {
    try {
      await axios.delete('http://localhost:3001/useronteams', {
        data: { userId: userId, teamId: selectedTeam._id }
      });
      getRoster();
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Failed to remove user. Please try again.");
    }
  };

  const openChangeRoleModal = (userId, currentRole) => {
    setUserToChangeRole(userId);
    setRoleToChange(currentRole);
    if (userId === currentUserId) {
      setNewOwnerCandidate("");
    }
    setShowChangeRoleModal(true);
  };

  const handleChangeRoleSubmit = async () => {
    try {
      if (!selectedTeam || !userToChangeRole) return;
      if (userToChangeRole === currentUserId) {
        alert("You cannot change your own role.");
        return;
      }
      if (currentUserRole === "Owner" && roleToChange === "Owner") {
        const responseNewOwner = await axios.put('http://localhost:3001/useronteams/role', {
          userId: userToChangeRole,
          teamId: selectedTeam._id,
          newRole: "Owner"
        });
        console.log("Transferred ownership to user:", responseNewOwner.data);
        const responseCurrent = await axios.put('http://localhost:3001/useronteams/role', {
          userId: currentUserId,
          teamId: selectedTeam._id,
          newRole: "Coach"
        });
        console.log("Current owner's role changed to Coach:", responseCurrent.data);
      } else {
        const response = await axios.put('http://localhost:3001/useronteams/role', {
          userId: userToChangeRole,
          teamId: selectedTeam._id,
          newRole: roleToChange
        });
        console.log("User's role updated:", response.data);
      }
      setShowChangeRoleModal(false);
      getRoster();
    } catch (err) {
      console.error("Error changing role:", err.response ? err.response.data : err.message);
      alert("Failed to change role. Please try again.");
    }
  };

  const openEditUserModal = (userId) => {
    const userData = players.find(p => p.userId === userId);
    if (userData) {
      setUserToEdit(userId);
      let heightFeet = "";
      let heightInches = "";
      if (userData.height) {
        const parts = userData.height.split("'");
        if (parts.length >= 2) {
          heightFeet = parts[0];
          heightInches = parts[1].replace(/''$/, "").trim();
        }
      }
      setEditUserData({
        playerPosition: userData.playerPosition || "",
        heightFeet: heightFeet,
        heightInches: heightInches,
        weight: userData.weight || "",
        playerStats: userData.playerStats || []
      });
      loadAvailableStats();
      setShowEditUserModal(true);
    } else {
      alert("User data not available.");
    }
  };

  const loadAvailableStats = async () => {
    if (!selectedTeam || !selectedTeam._id) return;
    try {
      const res = await axios.get(`http://localhost:3001/drillStats/team/${selectedTeam._id}`);
      setAvailableStats(res.data);  // assuming res.data is an array [{ _id, statName }]
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const viewStats = async (userId) => {
    try {
      const storedTeamString = localStorage.getItem("selectedTeam");
      const storedTeam = storedTeamString ? JSON.parse(storedTeamString) : null;
      const teamId = storedTeam ? storedTeam._id : null;
      if (!teamId) {
        alert("Team not found");
        return;
      }
      // Query the server for the user's current stats
      const res = await axios.get(`http://localhost:3001/userStats/${userId}`, {
        headers: { teamid: teamId }
      });
      // Update state with the stats from the database
      setViewStatsData(res.data.playerStats || []);
      setShowStatsModal(true);
    } catch (err) {
      console.error("Error fetching user stats from database", err);
      alert("Could not load stats from the database.");
    }
  };  

  const handleEditUserSubmit = async () => {
    try {
      if (!userToEdit) return;
      const combinedHeight = `${editUserData.heightFeet}'${editUserData.heightInches}''`;
      const updatedData = {
        playerPosition: editUserData.playerPosition,
        height: combinedHeight,
        weight: editUserData.weight,
        playerStats: editUserData.playerStats
      };
      const response = await axios.put(`http://localhost:3001/useronteams/${userToEdit}`, {
        ...updatedData,
        teamId: selectedTeam._id
      });
      console.log("User info updated:", response.data);
      setShowEditUserModal(false);
      getRoster();
    } catch (err) {
      console.error("Error updating user info:", err.response ? err.response.data : err.message);
      alert("Failed to update user info. Please try again.");
    }
  };

  const renderRosterCards = () => {
    const coaches = [];
    const playersList = [];
  
    players.forEach((player, index) => {
      if (roleFilter !== "All" && player.role !== roleFilter) return;

      const detail = playerDetails[player.userId];
      if (!detail) return;
  
      const card = (
        <Card key={index} className="card-events user-card">
          <Card.Header as="h5">{player.role}</Card.Header>
          <Card.Body>
            <div className="profile-container">
              <img 
                src={detail.profilePicture ? `http://localhost:3001${detail.profilePicture}` : '/generic.jpg'}
                alt={`${detail.fname}'s profile`}
                className="profile-picture"
              />
            </div>
            <Card.Title>
              {detail.fname} {detail.lname}
              {player.userId === currentUserId && (
                <span style={{ fontWeight: 'bold', color: 'red', marginLeft: '5px' }}>
                  (You)
                </span>
              )}
            </Card.Title>
            <Card.Text>
              Email: {detail.email}<br />
              {player.role === "Player" && (
                <>
                  {showPosition && <>Position: {player.playerPosition || "N/A"}<br /></>}
                  {showHeight && <>Height: {player.height || "N/A"}<br /></>}
                  {showWeight && <>Weight: {player.weight ? `${player.weight} lbs` : "N/A"}<br /></>}
                </>
              )}
            </Card.Text>
            {currentUserRole === "Owner" && (
              <Dropdown className="three-dots-dropdown">
                <Dropdown.Toggle variant="secondary" id={`dropdown-${index}`}>
                  ⋮
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {player.userId !== currentUserId && (
                    <>
                      <Dropdown.Item onClick={() => removeUser(player.userId)}>
                        Remove User
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => openChangeRoleModal(player.userId, player.role)}>
                        Change Role
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => viewStats(player.userId)}>
                        View Stats
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Item onClick={() => openEditUserModal(player.userId)}>
                    Edit User Info
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Card.Body>
        </Card>
      );
  
      if (["Owner", "Coach"].includes(player.role)) {
        coaches.push(card);
      } else {
        playersList.push(card);
      }
    });

    return (
      <>
        <div className="role-divider">Coaches</div>
        {coaches}
        <div className="role-divider">Players</div>
        {playersList}
      </>
    );
  };

  return (
    
    <div style={{ backgroundColor: 'whitesmoke' }} className="App">
      <header className="landing-page-header1">
        <div className="logo">
          <a href="/teams" style={{ textDecoration: 'none', color: 'black' }}>
            PocketSports
          </a>
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
        <button className="contactButton1" onClick={() => navigate('/contactpage')}>
          Contact Us
        </button>
        </div>
      </header>
      <strong className="homepage-headers">Your Team</strong>

      {(currentUserRole === "Owner" || currentUserRole === "Coach") && selectedTeam && selectedTeam.teamCode && (
        <div className="team-join-code">
          Join Code: <strong>{selectedTeam.teamCode}</strong>
        </div>
      )}

      <div className="filter-container">
        <div className="filter-popup-toggle" onClick={() => setFilterVisible(!filterVisible)}>
          ⚙️ Filters
        </div>
      </div>
        {filterVisible && (
          <div className="filter-popup">
             <div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
            <strong>Filter Roster</strong><br />
            </div>
            <label>
              Role:
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Player">Players</option>
              </select>
            </label>
            <hr />
            <label>
              <input type="checkbox" checked={showPosition}
                onChange={(e) => {
                  const newVal = e.target.checked;
                  setShowPosition(newVal);
                  updateTeamSettings({ showPosition: newVal, showHeight, showWeight });
                }} /> Show Position
            </label><br />
            <label>
              <input type="checkbox" checked={showHeight}
                onChange={(e) => {
                  const newVal = e.target.checked;
                  setShowHeight(newVal);
                  updateTeamSettings({ showPosition, showHeight: newVal, showWeight });
                }} /> Show Height
            </label><br />
            <label>
              <input type="checkbox" checked={showWeight}
                onChange={(e) => {
                  const newVal = e.target.checked;
                  setShowWeight(newVal);
                  updateTeamSettings({ showPosition, showHeight, showWeight: newVal });
                }} /> Show Weight
            </label>
          </div>
          )}
      <div style={{ backgroundColor: 'whitesmoke' }}>
        {loading ? <p>Loading roster...</p> : renderRosterCards()}
      </div>

      {/* Role Change Modal */}
      <Modal show={showChangeRoleModal} onHide={() => setShowChangeRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label htmlFor="newRole">Select New Role:</label>
          <select
            id="newRole"
            value={roleToChange}
            onChange={(e) => setRoleToChange(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            <option value="Owner">Owner</option>
            <option value="Coach">Coach</option>
            <option value="Player">Player</option>
            <option value="Parent">Parent</option>
          </select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangeRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChangeRoleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {showStatsModal && (
        <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} dialogClassName="stats-modal">
          <Modal.Header closeButton>
            <Modal.Title>User Stats</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewStatsData.length > 0 ? (
              <ul>
                {viewStatsData.map((stat, idx) => (
                  <li key={idx}>
                    {stat.statName}: {stat.statValue}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No stats available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Edit User Info Modal */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Info</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ width: '90vh', overflowY: 'auto' }} >
          <label>
            Position:
            <input
              type="text"
              value={editUserData.playerPosition}
              onChange={(e) =>
                setEditUserData({ ...editUserData, playerPosition: e.target.value })
              }
              style={{ marginLeft: '10px' }}
            />
          </label>
          <br /><br />
          <label>
            Height:
            <input
              type="number"
              placeholder="Feet"
              value={editUserData.heightFeet || ""}
              onChange={(e) =>
                setEditUserData({ ...editUserData, heightFeet: e.target.value })
              }
              style={{ marginLeft: '10px', width: '60px' }}
            />
            <input
              type="number"
              placeholder="Inches"
              value={editUserData.heightInches || ""}
              max="11"
              onChange={(e) => {
                const inputVal = Number(e.target.value);
                if (inputVal > 11) {
                  setEditUserData({ ...editUserData, heightInches: "11" });
                } else {
                  setEditUserData({ ...editUserData, heightInches: e.target.value });
                }
              }}
              style={{ marginLeft: '10px', width: '60px' }}
            />
          </label>
          <br /><br />
          <label>
            Weight (lbs):
            <input
              type="number"
              value={editUserData.weight}
              onChange={(e) =>
                setEditUserData({ ...editUserData, weight: e.target.value })
              }
              style={{ marginLeft: '10px' }}
            />
          </label>
          <br /><br />
          <div>
            <h4>Add Stat</h4>
            <label>
              Stat:
              <select
                value={newStat.statName}
                onChange={(e) =>
                  setNewStat({ ...newStat, statName: e.target.value })
                }
                style={{ marginLeft: '10px' }}
              >
                <option value="" disabled>Select a stat</option>
                {availableStats.map((s) => (
                  <option key={s._id} value={s.statName}>
                    {s.statName}
                  </option>
                ))}
              </select>
            </label>
            <br /><br />
            <label>
              Value:
              <input
                type="text"
                value={newStat.statValue}
                onChange={(e) =>
                  setNewStat({ ...newStat, statValue: e.target.value })
                }
                style={{ marginLeft: '10px' }}
              />
            </label>
            <br /><br />
            <button
              type="button"
              onClick={() => {
                // Only add if both fields are filled out.
                if (newStat.statName && newStat.statValue) {
                  const existingIndex = editUserData.playerStats.findIndex(
                    (stat) => stat.statName === newStat.statName
                  );
                  
                  if (existingIndex !== -1) {
                    // Get the current value; assume it's numeric.
                    const currentVal = Number(editUserData.playerStats[existingIndex].statValue) || 0;
                    const addedVal = Number(newStat.statValue) || 0;
                    const total = currentVal + addedVal;
                    
                    // Create an updated stats array
                    const updatedStats = [...editUserData.playerStats];
                    updatedStats[existingIndex] = { statName: newStat.statName, statValue: total.toString() };
                    
                    setEditUserData({
                      ...editUserData,
                      playerStats: updatedStats
                    });
                  } else {
                    // The stat is not present—add it.
                    setEditUserData({
                      ...editUserData,
                      playerStats: [...editUserData.playerStats, { ...newStat }]
                    });
                  }
                  // Clear the stat entry fields
                  setNewStat({ statName: "", statValue: "" });
                } else {
                  alert("Please choose a stat and enter a value");
                }                
              }}
              className="topButtons"
            >
              Add Stat
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditUserSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <footer
        className="footer1"
        style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'white', color: 'whitesmoke' }}
      >
        <div className="footer-container1">
          <div className="footer-column1">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing integrated platforms that streamline coaching and management tasks.
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

export default Roster;
