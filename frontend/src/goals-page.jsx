import './goals-page.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use Axios for HTTP requests
import { useNavigate, useLocation } from 'react-router-dom';


function GoalsPage() {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState({ 
          title: "", 
          description: "",
          targetNumber: 1,
    });
    const [showPopup, setShowPopup] = useState(false);
    const [buttons, setButtons] = useState([
      { path: "/homepage", label: "Home" },
      { path: "/roster", label: "Roster" },
      { path: "/calendarpage", label: "Calendar" },
      { path: "/goalspage", label: "Goals" },
    ]);
    const navigate = useNavigate();
    const location = useLocation();

    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [editedTargetNumber, setEditedTargetNumber] = useState(1);
    const [editedProgress, setEditedProgress] = useState(0);  // Track progress
    const [isGoalCompleted, setIsGoalCompleted] = useState(false);
    const [notification, setNotification] = useState("");
  
    useEffect(() => {
      // Retrieve the selected team and role from localStorage
      const storedTeam = localStorage.getItem('selectedTeam');
      const storedRole = localStorage.getItem('role');
  
      console.log("Stored role:", storedRole); // Check role in localStorage
  
      if (storedTeam) {
        setSelectedTeam(JSON.parse(storedTeam)); // Update selected team if available
      }
  
      if (storedRole === "Owner") {
        setButtons((prevButtons) => {
          // Prevent adding the button twice
          if (!prevButtons.some(button => button.path === "/drills")) {
            return [
              ...prevButtons,
              { path: "/drills", label: "Drills" }
            ];
          }
          return prevButtons;
        });
      }
  
    }, []);

    useEffect(() => {
      const storedTeam = localStorage.getItem("selectedTeam");
      if (storedTeam) {
          setSelectedTeam(JSON.parse(storedTeam));
      }
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
  


  const updateGoal = async (goalId, newTitle, newDescription, newTargetNumber, newProgress) => {

    console.log("Updating goal:", goalId);
    console.log("New values:", newTitle, newDescription, newTargetNumber, newProgress);

    try {
      const response = await axios.put(`http://localhost:3001/goals/${goalId}`, {
        title: newTitle,
        description: newDescription,
        targetNumber: newTargetNumber,
        progress: newProgress,
      });
        console.log("Backend response:", response.data);

        if (response.data.completed) {
          alert("Goal successfully completed!");
          setIsGoalCompleted(true);
          setNotification("Goal successfully completed!");
          console.log("Goal completed, deleting goal...");

          await axios.delete(`http://localhost:3001/goals/${goalId}`);
        }

        fetchGoals(); // Refresh goal list
    } catch (error) {
        console.error("Error updating goal:", error);
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

  return (
    <div className='App'>
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
      <body>

      
      <div className="goals-container">
          <strong>Team Goals</strong>
          <button className="add-goal-button" onClick={() => setShowPopup(true)}>Add Goal</button>


          {showPopup && (
            <div className="popup">
              <div className="popup-content">
                <h2>Create a New Goal</h2>
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
                  <button onClick={createGoal}>Save Goal</button>
                  <button onClick={() => setShowPopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
       

        <ul className="goal-list">
          {goals.length > 0 ? (
            goals.map((goal, index) => (
              <li key={goal._id || index} className="goal-item">
                <div onClick={() => handleGoalClick(goal)}>
                  <b>Title:</b> 
                  {editingGoalId === goal._id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                    />
                  ) : (
                    goal.title
                  )}
                  <br />
                  <b>Description:</b> 
                  {editingGoalId === goal._id ? (
                    <input
                      type="text"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                    />
                  ) : (
                    goal.description
                  )}
                  <br />
                  <b>Target Number:</b> 
                  {editingGoalId === goal._id ? (
                    <select
                      value={editedTargetNumber}
                      onChange={(e) => setEditedTargetNumber(Number(e.target.value))}
                    >
                      {[...Array(11).keys()].slice(1).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  ) : (
                    goal.targetNumber || "N/A"
                  )}
                  <br />

                  <b>Progress:</b> 
                  {editingGoalId === goal._id ? (
                    <select
                      value={editedProgress}
                      onChange={(e) => setEditedProgress(Number(e.target.value))}
                    >
                      {[...Array(11).keys()].slice(1).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  ) : (
                    goal.progress || "0"
                  )}
                  <br />

                </div>
                {editingGoalId === goal._id ? (
                  <button onClick={() => handleSaveClick(goal._id)}>Save</button>
                ) : (
                  <button className="remove-btn" onClick={() => deleteGoal(goal._id)}>❌</button>

                 
                )}
              </li>
            ))
          ) : (
            <p>No goals found for this team.</p>
          )}
        </ul>

      </div>

      </body>
      
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

export default GoalsPage;
