import './goals-page.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests
import { useNavigate, useLocation } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import Progress from 'react-circle-progress-bar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal } from "@fortawesome/free-solid-svg-icons";


function GoalsPage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTargetNumber, setEditedTargetNumber] = useState(1);
  const [editedProgress, setEditedProgress] = useState(0);  // Track progress
  const [completedGoals, setCompletedGoals] = useState(new Set());
  //const [isGoalCompleted, setIsGoalCompleted] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [newGoal, setNewGoal] = useState({ 
        title: "", 
        description: "",
        targetNumber: 1,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" },
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve stored values from localStorage
  const storedUserId = localStorage.getItem("userId");

  // getDrillTab: Check the roster for the current user’s role.
  // If the user is an Owner, add the "Drills" button to the header.
  const getDrillTab = async () => {
    try {
      const storedTeamString = localStorage.getItem("selectedTeam");
      const storedTeamObj = storedTeamString ? JSON.parse(storedTeamString) : null;
      const storedTeamId = storedTeamObj ? storedTeamObj._id : null;
      if (!storedTeamId) {
        console.log("Team ID is missing");
        return;
      }
      const rosterRes = await axios.get('http://localhost:3001/useronteams', {
        headers: { teamId: storedTeamId },
      });
      const rosterData = rosterRes.data;
      // Use storedUserId from localStorage
      const me = rosterData.find((p) => p.userId === storedUserId);
      if (me) {
        setCurrentUserRole(me.role);
        if (me.role === "Owner" || me.role === "Coach") {
          setButtons((prev) => {
            if (!prev.some(b => b.path === "/drills")) {
              return [...prev, { path: "/drills", label: "Drills" }];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching roster:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount, retrieve the selected team and call getDrillTab
  useEffect(() => {
    const storedTeam = localStorage.getItem('selectedTeam');
    if (storedTeam) {
      setSelectedTeam(JSON.parse(storedTeam));
    }
    getDrillTab();
  }, []);

  useEffect(() => {
      if (selectedTeam && selectedTeam._id) {
          fetchGoals();
      }
  }, [selectedTeam]); // Fetch goals when selectedTeam changes

  useEffect(() => {
    console.log("Goals state updated:", goals.map(goal => goal.title));
  }, [goals]); // Runs every time `goals` state updates


  const fetchGoals = async () => {
    if (!selectedTeam || !selectedTeam._id) {
        console.warn("fetchGoals: No selected team found, skipping fetch.");
        return;
    }

    try {
        console.log("Fetching goals for team:", selectedTeam._id); // Debugging
        const res = await axios.get("http://localhost:3001/goals", {
            params: { teamId: selectedTeam._id },
        });

        console.log("Goals fetched:", res.data); // Debugging
        //if (res.data.length > 0) {
          //console.log("First goal:", res.data[0]);
        //}

        setGoals(() => [...res.data]);
        console.log("Goals after update:", res.data[4]);

    } catch (error) {
        console.error("Error fetching goals:", error);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title.trim()) {
        alert("Title is required!");
        return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId || !selectedTeam?._id) {
        alert("User ID or Team ID missing!");
        return;
    }

    console.log("Creating goal:", newGoal);

    try {
        await axios.post("http://localhost:3001/goals", {
            title: newGoal.title,
            description: newGoal.description,
            createdBy: userId,
            teamId: selectedTeam._id,
            targetNumber: newGoal.targetNumber ?? 1,
        });

        
        setNewGoal({ title: "", description: "",  targetNumber: 1 }); // Clear input fields
        fetchGoals(); // Fetch updated goal list from the database
        setShowPopup(false);
    } catch (error) {
        console.error("Error creating goal:", error);
    }
};

const deleteGoal = async (goalId) => {
  try {
      await axios.delete(`http://localhost:3001/goals/${goalId}`);
      fetchGoals(); // Fetch updated goal list
  } catch (error) {
      console.error("Error deleting goal:", error);
  }
};
const handleGoalClick = (goal) => {
  setEditingGoalId(goal._id);
  setEditedTitle(goal.title);
  setEditedDescription(goal.description);
  setEditedTargetNumber(goal.targetNumber || 1);
  setEditedProgress(goal.progress || 0);
};

const handleSaveClick = (goalId) => {
  if (editedTitle.trim() && editedDescription.trim()) {
    updateGoal(goalId, editedTitle, editedDescription, editedTargetNumber, editedProgress);
    setEditingGoalId(null); // Stop editing
  } else {
    alert("Title and description cannot be empty");
  }
};


const updateGoalProgress = async () => {
  if (!editingGoal) return;

  try {
      await axios.put(`http://localhost:3001/goals/${editingGoal._id}`, {
          progress: editedProgress,
      });

      setGoals(prevGoals => {
          return prevGoals.map(goal => {
              if (goal._id === editingGoal._id) {
                  const updatedGoal = { ...goal, progress: editedProgress };
                  
                  if (editedProgress >= goal.targetNumber) {
                      setCompletedGoals(prev => new Set([...prev, goal._id]));
                  }

                  return updatedGoal;
              }
              return goal;
          });
      });

      fetchGoals();  // Ensure latest updates are fetched
      setShowEditPopup(false);
  } catch (error) {
      console.error("Error updating goal progress:", error);
  }
};


    return (
        <div className='App' style={{ backgroundColor: 'whitesmoke' }}>
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

            <div className="goals-container">
                <div className="progress-medal-container">
                <Progress 
  style={{ '--progress-color': selectedTeam?.teamColors?.[0], width: '30%' }}  
  progress={(goals.filter(goal => goal.progress >= goal.targetNumber).length / goals.length) * 100 || 0}
/>
                
                   <div className="completed-goals-container">
              <h3>Completed Goals</h3>
              <div className="medal-grid">
                  {goals
                      .filter(goal => goal.progress >= goal.targetNumber) // Filter completed goals
                      .slice(-6) // Get at most the last 6 completed goals
                      .map((goal, index) => (
                          <div key={goal._id} className="medal-item">
                              <FontAwesomeIcon
                                  icon={faMedal}
                                  style={{ fontSize: '6vw', color: selectedTeam?.teamColors?.[0] }}
                              />
                              <p>{goal.title}</p>
                          </div>
                      ))}
              </div>
          </div>

              </div>
                <button className="add-goal-button" onClick={() => setShowPopup(true)}>Add Goal</button>


          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h2 style={{color:'black'}}>Create a New Goal</h2>
                <label>Title:
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </label>
                <label>Description:
                  <input
                    type="text"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </label>

                <label>Target Number:</label>
                  <select
                    value={newGoal.targetNumber}
                    onChange={(e) => setNewGoal({ ...newGoal, targetNumber: Number(e.target.value) })}
                  >
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>

                <div className="button-container-2">
                  <button onClick={createGoal} style={{backgroundColor: selectedTeam?.teamColors?.[0], color: 'white'}} >Save Goal</button>
                  <button onClick={() => setShowPopup(false)} style={{backgroundColor: selectedTeam?.teamColors?.[0], color: 'white'}} >Cancel</button>
                </div>
              </div>
            </div>
          )}
       

                {goals.length > 0 ? (
                    goals.map((goal) => (
                      
                        <Card key={goal._id} className='card-events'>
                            <Card.Header as='h5'>{goal.title}</Card.Header>
                            <Card.Body>
                                <Card.Text>Description: {goal.description}</Card.Text>
                                <Card.Text>Goal: {goal.targetNumber}</Card.Text>
                                <Card.Text>Progress: {goal.progress}</Card.Text>
                                <ProgressBar  style={{color: selectedTeam?.teamColors?.[0]}} now={(goal.progress / goal.targetNumber) * 100} />
                                
                                <Button variant='primary' style={{marginTop:'20px', backgroundColor: selectedTeam?.teamColors?.[0]}} onClick={() => {
                                    setEditingGoal(goal);
                                    setEditedProgress(goal.progress);
                                    setShowEditPopup(true);
                                    
                                }}>Update Progress</Button>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <h1 style={{margin: '10vw'}}>No goals found</h1>
                )}
            </div>
            {showEditPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2 style={{ color: 'black' }}>Update Progress</h2>
                        <label>Progress:</label>
                        <input
                            type="number"
                            value={editedProgress}
                            onChange={(e) => setEditedProgress(Number(e.target.value))}
                        />
                        <div className="button-container-2">
                            <button onClick={updateGoalProgress} style={{backgroundColor: selectedTeam?.teamColors?.[0], color: 'white'}}>Save</button>
                            <button onClick={() => setShowEditPopup(false)} style={{backgroundColor: selectedTeam?.teamColors?.[0], color: 'white'}}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <footer className="footer1" style={{backgroundColor: selectedTeam?.teamColors?.[0] || 'white', color: 'whitesmoke'}}>
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
