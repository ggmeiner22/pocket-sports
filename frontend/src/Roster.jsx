import './Roster.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';

function Roster() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]); // Array of UserOnTeam documents
  const [playerDetails, setPlayerDetails] = useState({}); // Optional extra info from Register
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Role-change modal state (for non-self role changes)
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [roleToChange, setRoleToChange] = useState("Player");
  const [newOwnerCandidate, setNewOwnerCandidate] = useState(""); // For when the owner is changing his own role

  // Edit User Info modal state (available for all users)
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editUserData, setEditUserData] = useState({
    playerPosition: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    playerStats: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  // For header buttons
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" }
  ]);

  // Current user ID from localStorage
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const storedTeamString = localStorage.getItem('selectedTeam');
    if (storedTeamString) {
      setSelectedTeam(JSON.parse(storedTeamString));
    }
    getRoster();
  }, []);

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

      // Determine current user's DB role from roster data
      const me = rosterData.find((p) => p.userId === currentUserId);
      if (me) {
        setCurrentUserRole(me.role);
        if (me.role === "Owner") {
          setButtons((prev) => {
            if (!prev.some(b => b.path === "/drills")) {
              return [...prev, { path: "/drills", label: "Drills" }];
            }
            return prev;
          });
        }
      }

      // Optionally fetch additional user details from Register
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
      console.error('Error removing user:', error);
      alert('Failed to remove user. Please try again.');
    }
  };

  const openChangeRoleModal = (userId, currentRole) => {
    setUserToChangeRole(userId);
    setRoleToChange(currentRole); // Initialize with current role
    // If the owner is changing his own role, reset newOwnerCandidate
    if (userId === currentUserId) {
      setNewOwnerCandidate("");
    }
    setShowChangeRoleModal(true);
  };

  const handleChangeRoleSubmit = async () => {
    try {
      if (!selectedTeam || !userToChangeRole) return;
  
      // Disallow self role change
      if (userToChangeRole === currentUserId) {
        alert("You cannot change your own role.");
        return;
      }
  
      // If current user is Owner and changing someone else's role to Owner,
      // transfer ownership: update target to Owner and current owner to Coach.
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
        // For any other case, simply update the target user's role
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

  // Open Edit User Info modal (available for all users)
  const openEditUserModal = (userId) => {
    // Find the user's info from the players array (UserOnTeam document)
    const userData = players.find(p => p.userId === userId);
    if (userData) {
      setUserToEdit(userId);
      // Parse height (expected format: "5'11''")
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
        playerStats: userData.playerStats ? JSON.stringify(userData.playerStats) : ""
      });
      setShowEditUserModal(true);
    } else {
      alert("User data not available.");
    }
  };

  const handleEditUserSubmit = async () => {
    try {
      if (!userToEdit) return;
      // Combine feet and inches into a height string
      const combinedHeight = `${editUserData.heightFeet}'${editUserData.heightInches}''`;
      const updatedData = {
        playerPosition: editUserData.playerPosition,
        height: combinedHeight,
        weight: editUserData.weight,
        playerStats: editUserData.playerStats ? JSON.parse(editUserData.playerStats) : []
      };
      // Update the user info in the UserOnTeam document
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
    return players.map((player, index) => {
      const detail = playerDetails[player.userId];
      if (!detail) return null;

      return (
        <Card key={index} className="card-events">
          <Card.Header as="h5">{player.role}</Card.Header>
          <Card.Body>
            <Card.Title>
              {detail.fname} {detail.lname}
              {player.userId === currentUserId && (
                <span style={{ fontWeight: 'bold', color: 'red', marginLeft: '5px' }}>
                  (You)
                </span>
              )}
            </Card.Title>
            <Card.Text>
              Email: {detail.email}<br/>
              Position: {player.playerPosition || "N/A"}<br/>
              Height: {player.height || "N/A"}<br/>
              Weight: {player.weight ? `${player.weight} lbs` : "N/A"}
            </Card.Text>
            <Button
              style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'gray' }}
              variant="primary"
              onClick={() => navigate("/calendarpage")}
            >
              Learn More
            </Button>
            {currentUserRole === "Owner" && (
              <Dropdown style={{ display: 'inline-block', marginLeft: '10px' }}>
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
    });
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
          <button className="contactButton1">Contact Us</button>
        </div>
      </header>
      <strong className="homepage-headers">Your Team</strong>
      <div style={{ backgroundColor: 'whitesmoke' }}>
        {loading ? <p>Loading roster...</p> : renderRosterCards()}
      </div>

      {/* Role Change Modal for other users */}
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

      {/* Edit User Info Modal */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              onChange={(e) =>
                setEditUserData({ ...editUserData, heightInches: e.target.value })
              }
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
          <label>
            Stats (JSON format):
            <textarea
              value={editUserData.playerStats}
              onChange={(e) =>
                setEditUserData({ ...editUserData, playerStats: e.target.value })
              }
              style={{ marginLeft: '10px', width: '100%' }}
            />
          </label>
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
