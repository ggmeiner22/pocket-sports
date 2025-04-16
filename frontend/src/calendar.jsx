import './calendar.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarPage() {
  const [events, setEvents] = useState({}); // Stores events per date
  const [selectedDate, setSelectedDate] = useState(new Date()); // Selected date state
  const [showPopup, setShowPopup] = useState(false); // Popup state for event creation
  const [showEditPopup, setShowEditPopup] = useState(false); // Popup state for event creation
  const [eventName, setEventName] = useState('');
  const [eventUpdatedName, setEventUpdatedName] = useState('');
  const [feedbackResponse, setFeedbackResponse] = useState('');
    const [loading, setLoading] = useState(false);  // Loading state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPracticePlan, setSelectedPracticePlan] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [players, setPlayers] = useState([]);
  const [feedback, setFeedback] = useState(''); // To store user feedback text
  const [eventLocation, setEventLocation] = useState('');
  const [eventUpdateLocation, setEventUpdateLocation] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(''); // Rename this state to better reflect its purpose, such as `selectedPlayerId`.
  const [drills, setDrills] = useState([]); // initialize drills as an empty array
  const [time, setTime] = useState('');
  const [updatedtime, setUpdatedTime] = useState('');
  const [playerDetails, setPlayerDetails] = useState({});
  const [practicePlans, setPracticePlans] = useState([]);
  const [practicePlansDetails, setPracticePlansDetails] = useState({});
  const [updatepracticePlans, setUpdatePracticePlans] = useState({});
  const [userId, setUserId] = useState(''); // userId state
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const storedRole = localStorage.getItem('role');
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [buttons, setButtons] = useState([
        { path: "/homepage", label: "Home" },
        { path: "/roster", label: "Roster" },
        { path: "/calendarpage", label: "Calendar" },
        { path: "/goalspage", label: "Goals" },
      ]);

  const storedUserId = localStorage.getItem('userId');
  const storedTeam = localStorage.getItem('selectedTeam');
  
  // getDrillTab: checks the user's role and, if Owner, adds the "Drills" button.
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
      // Use storedUserId here instead of undefined currentUserId
      const me = rosterData.find((p) => p.userId === storedUserId);
      if (me) {
        setCurrentUserRole(me.role);
        //alert(`Your role is: ${me.role}`);  // for debugging only
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
    } catch (error) {
      console.error("Error fetching roster:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storedTeam) {
      setTeamName(storedTeam);
    }
    getEvents(selectedDate); // Fetch events for the selected date
    getRoster();
    getDrillTab();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      getEvents(selectedDate); // Fetch events for the selected date whenever it changes
    }
  }, [selectedDate]); // Dependency on selectedDate to re-fetch events when it changes

  const getUserDetails = async (playerId) => {
    try {
      const response = await axios.get(`http://localhost:3001/registers/${playerId}`);
      return response.data;  // Return user details for a specific player
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const getDrills = async (practicePlanId) => {
    try {
      const response = await axios.get(`http://localhost:3001/practiceplans/${practicePlanId}`);
      setDrills(response.data.drills); // not setDrills(response.data)
      console.log(drills); // <- Log the correct value, not outdated state
    } catch (error) {
      console.error('Error fetching drills:', error);
      return null;
    }
  };
  const getPlanDetails = async (teamId) => {
    try {
      const response = await axios.get(`http://localhost:3001/practiceplans?teamId=${teamId}`);
      console.log("Practice plans", response.data)
      setPracticePlans(response.data)
      const planDetails = await Promise.all(practicePlanPromises);
      const planDetailsMap = planDetails.reduce((acc, practiceDetails, idx) => {
        acc[response.data[idx].teamId] = practiceDetails;
        return acc;
      }, {});
      
      setPracticePlansDetails(planDetailsMap);  // Save details in state
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const updateEvent = async () => {
  
    try {
        await axios.put(`http://localhost:3001/events/${selectedEvent._id}`, {
            category: updatedCategory,
            eventName: eventUpdatedName,
            eventLocation: eventUpdateLocation,
            practicePlan: updatepracticePlans,
            time: updatedtime

        });
  
        setEvents(prevEvents => {
            return prevEvents.map(event => {
                if (event._id === selectedEvent._id) {
                    const updatedEvent = { ...event, category: updatedCategory,
                      eventName: eventUpdatedName,
                      eventLocation: eventUpdateLocation,
                      practicePlan: updatepracticePlans,
                      time: updatedtime };
          
                    return updatedEvent;
                }
                return event;
            });
        });
  
        setShowEditPopup(false);
    } catch (error) {
        console.error("Error updating event progress:", error);
    }
  };

  const getRoster = async () => {
    setLoading(true);
    try {
      const storedTeamString = localStorage.getItem("selectedTeam");
      const storedTeam = storedTeamString ? JSON.parse(storedTeamString) : null;
      const storedTeamId = storedTeam ? storedTeam._id : null; // Access _id on the parsed object
      console.log(storedTeamId);
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

      const practicePlanPromises = response.data.map(plan => getPlanDetails(plan.teamId));  // Assuming `userId` is the field


      
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

   useEffect(() => {
      const storedTeam = localStorage.getItem("selectedTeam");
      if (storedTeam) {
          setSelectedTeam(JSON.parse(storedTeam));
      }
    }, []);

    const handleFeedbackSubmit = async (playerId, feedbackText) => {
        const userId = localStorage.getItem('userId');

        if (!userId || !selectedTeam?._id || !selectedEvent?._id || !playerId || !feedbackText.trim()) {
          alert('Missing required information to submit feedback.');
          return;
        }
        const newFeedback = {
          teamId: selectedTeam?._id, // Ensure this is included
          eventId: selectedEvent?._id, 
          playerId: playerId,
          comment: feedbackText,
        };
    
        axios.post('http://localhost:3001/feedback', newFeedback)
          .then(() => {
            setFeedback('');            
          })
          .catch((err) => {
            console.log(err);
            alert('Error creating feedback');
          });
    };
    
    
  // Fetch events for the selected date
  const getEvents = async (date) => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedTeamString = localStorage.getItem("selectedTeam");
      const storedTeam = storedTeamString ? JSON.parse(storedTeamString) : null;
      const storedTeamId = storedTeam ? storedTeam._id : null; // Access _id on the parsed object
      console.log(storedTeamId);
      if (!storedUserId) {
        console.log("User ID is missing");
        return;
      }
  
      const formattedDate = date.toDateString();  // Get the string representation of the date
  
      // Check if storedTeam and storedTeam._id are valid before making the request
      if (!storedTeamId) {
        console.log("Team ID is missing");
        return;  // Exit early if the team ID is missing
      }
  
      const response = await axios.get('http://localhost:3001/events', {
        headers: {
          teamid: storedTeamId,  // Ensure the team ID is passed correctly
        },
      });

      console.log('API Response:', response.data);  // Log the full response data

  
      // Filter events that match the selected date
      const eventsForDate = response.data.filter(event => {
        console.log(new Date(event.date)); // This will print out the Date object for each event
        return new Date(event.date).toDateString() === formattedDate &&
               event.teamId === storedTeamId;  // Ensure it matches the team
      });
      console.log(formattedDate);
      console.log("events for date:", eventsForDate);  // Log the events for the selected date
      // Update state with events for the selected date
      setEvents({
        ...events,
        [formattedDate]: eventsForDate,
      });
    } catch (error) {
      console.error("Error fetching events:", error.response || error.message);
      alert("Failed to fetch events. Please try again later.");
    }
  };

  const getFeedback = async (playerId, eventId) => {
    try {
        const response = await axios.get(`http://localhost:3001/feedback/${playerId}/${eventId}`);
        console.log("Feedback:", response.data.feedbacks);
        return response.data.feedbacks; 
    } catch (error) {
        console.error("Error fetching feedback:", error.response?.data?.message || error.message);
        return [];
    }
};

// Example usage inside a button click or effect:
const handleFetchFeedback = async (userId, event) => {
  console.log("feedback:", userId);
  console.log("feedback event", event);
  
  if (!event) {
      console.log("Missing event or player selection.");
      return;
  }

  const feedbacks = await getFeedback(userId, event);

  // Ensure that feedbacks exist and there's at least one item
  if (feedbacks.length > 0) {
      setFeedbackResponse(feedbacks[0].comment);  // Assuming the first feedback has the comment
      console.log("Fetched feedback:", feedbackResponse);
  } else {
      console.log("No feedback available.");
  }
};
  
  // Handle date change on calendar
  const handleDateChange = (date) => {
    setSelectedDate(date); // Update selected date
  };

  // Add new event popup
  const addEvent = () => {
    setShowPopup(true);
  };

  const editEvent = () => {
    setShowEditPopup(true);
  };

  const handleEventClick = (event) => {
    const userId = localStorage.getItem('userId');
    setSelectedEvent((prevSelectedEvent) =>
      prevSelectedEvent && prevSelectedEvent._id === event._id ? null : event
    );
      handleFetchFeedback(userId, event._id);
    
  };

  // Handle form submission to create event
  const handleSubmit = (e) => {
    console.log(selectedPracticePlan)
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const newEvent = {
      teamId: selectedTeam?._id, // Ensure this is included
      teamName,
      selectedCategory,
      eventName,
      date: selectedDate,
      eventLocation,
      selectedPracticePlan,
      time,
      feedback: {},
      createdBy: userId,
    };

    axios.post('http://localhost:3001/events', newEvent)
      .then(() => {
        setShowPopup(false);
        setShowEditPopup(false);
        setSelectedCategory('');
        setEventName('');
        setEventLocation('');
        setPracticePlans({});
        setTime('');
        setFeedback('');

        // Update the events state for the selected date
        const formattedDate = selectedDate.toDateString();
        setEvents((prevEvents) => ({
          ...prevEvents,
          [formattedDate]: [...(prevEvents[formattedDate] || []), newEvent], // Add the new event
        }));
      })
      .catch((err) => {
        console.log(err);
        alert('Error creating event');
      });
  };

  const removeEvent = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this event?");
    if (!confirmDelete) return;
  
    try {
      const formattedDate = selectedDate.toDateString();
      const updatedEvents = [...events[formattedDate]];
      const eventToRemove = updatedEvents[index];
      
      const eventId = eventToRemove._id;  // Get the event _id
  
      updatedEvents.splice(index, 1);  // Remove the event from the local state
      setEvents(prevEvents => ({
        ...prevEvents,
        [formattedDate]: updatedEvents.length ? updatedEvents : undefined,
      }));
  
      // Ensure you are using DELETE method correctly here
      const response = await axios.delete(`http://localhost:3001/events/${eventId}`);  // DELETE request with the eventId
  
      if (response.status === 200) {
        console.log('Event removed successfully');
      } else {
        alert('Failed to remove event from the database.');
      }
    } catch (error) {
      console.error("Error removing event:", error);
      alert("Failed to remove event. Please try again later.");
    }
  };

  useEffect(() => {
    if (selectedEvent && selectedEvent.selectedPracticePlan) {
      getDrills(selectedEvent.selectedPracticePlan);
    }
  }, [selectedEvent]);
  
  

  return (
    <div className="App">
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
        <button className="contactButton1" onClick={() => navigate('/contactpage')}>
          Contact Us
        </button>

        </div>
      </header>

      {/* Add Event Button */}
      {localStorage.getItem('role') === 'Owner' && (
          <>
            <div className="event-button-container">
                <button className="eventButton" onClick={addEvent}>Add Event</button>
            </div>
          </>
        )}
      

      {/* Calendar and Events */}
      <div className='main-class' style={{ backgroundColor: 'whitesmoke', padding: '20px' }}>
        <div className="calendar-container">
          <div className="calendar-half">
            <Calendar onChange={handleDateChange} value={selectedDate} className="custom-calendar" />
          </div>

          {/* Event Input */}
          {showPopup && (
            <div className="popupEvent-top">
              <div className="popupEvent-content">
                <h2 style={{color: 'black'}}>Create a New Event</h2>
                <form onSubmit={handleSubmit}>
                <label style={{color: 'black'}}>
                  Category: 
                  <select style={{backgroundColor: 'whitesmoke', color: 'black', borderColor:'black'}}value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                    <option value="" disabled>Select a category</option>
                    <option>Practice</option>
                    <option>Game</option>
                  </select>
                  </label>
                  <label style={{color: 'black'}}>Event Name:
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      required
                    />
                  </label>
                  <label style={{color: 'black'}}>Location:
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      required
                    />
                  </label>
                  <label style={{ color: 'black' }}>
                Practice Plans:
                <select style={{backgroundColor: 'whitesmoke', color: 'black', borderColor:'black'}} value={selectedPracticePlan} onChange={(e) => setSelectedPracticePlan(e.target.value)}>
                <option value="" disabled>Select a practice plan</option>
                  {practicePlans.map((plan) => (
                    
                    <option key={plan._id} value={plan._id}>
                      {plan.planName}
                    </option>
                  ))}
                  </select>
                </label>
                  <label style={{color: 'black'}}>Time:
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </label>
                  <button type="button" style={{backgroundColor: 'black', color: 'white', marginRight:'20px'}} onClick={() => setShowPopup(false)}>Cancel</button>
                  <button style={{backgroundColor: 'black', color: 'white'}} type="submit">Create</button>
                </form>
              </div>
            </div>
          )}

    {showEditPopup && (
      <div className="popupEvent-top">
        <div className="popupEvent-content">
          <h2 style={{ color: 'black' }}>Edit Event</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ color: 'black' }}>
              Category:
              <select
                style={{ backgroundColor: 'whitesmoke', color: 'black', borderColor: 'black' }}
                value={updatedCategory}
                onChange={(e) => setSelectedUpdatedCategory(e.target.value)}
                required
              >
                <option value={selectedEvent.category} disabled>Select a category</option>
                <option>Practice</option>
                <option>Game</option>
              </select>
            </label>

            <label style={{ color: 'black' }}>
              Event Name:
              <input
                type="text"
                value={eventUpdatedName}
                onChange={(e) => setEventUpdatedName(e.target.value)}
                required
              />
            </label>

            <label style={{ color: 'black' }}>
              Location:
              <input
                type="text"
                value={eventUpdateLocation}
                onChange={(e) => setEventUpdateLocation(e.target.value)}
                required
              />
            </label>

            <label style={{ color: 'black' }}>
                Practice Plans:
                <select style={{backgroundColor: 'whitesmoke', color: 'black', borderColor:'black'}} value={selectedPracticePlan} onChange={(e) => setSelectedPracticePlan(e.target.value)}>
                <option value="" disabled>Select a practice plan</option>
                  {practicePlans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName}
                    </option>
                  ))}
                  </select>
                </label>

            <label style={{ color: 'black' }}>
              Time:
              <input
                type="time"
                value={updatedtime}
                onChange={(e) => setUpdatedTime(e.target.value)}
                required
              />
            </label>

            <button type="button" style={{backgroundColor: 'black', color: 'white', marginRight:'20px'}} onClick={() => setShowEditPopup(false)}>Cancel</button>

            <button onClick={updateEvent} style={{ backgroundColor: 'black', color: 'white' }} type="submit">
              Update Event
            </button>
          </form>
        </div>
      </div>
    )}
          

          {/* Display Events for the Selected Date */}
          <div className="event-input-half">
            <h3 style={{color: 'black'}}>Events for {selectedDate.toDateString()}</h3>
            <div className="event-cards-container">
            <ul className="event-cards">
            {(events[selectedDate.toDateString()] || []).map((event, index) => (
                <li key={index} className="event-box" onClick={() => handleEventClick(event)}>
                <p style={{color:'black'}}>{event.eventName}</p>
                <button className="remove-btn" onClick={() => removeEvent(index)}>❌</button>
                </li>
            ))}
            </ul>
            </div>
          </div>
        </div>
        
        {selectedEvent && (
          <div className="event-buttons-container">
          {localStorage.getItem('role') === 'Owner' && (
              <div className="event-button-container">
                  <button className="eventButton" onClick={editEvent}>Edit Event</button>
              </div>
          )}
          <div className="event-details">
              <div className="event-details-card">
                  <h3>Event Details</h3>
                  <p><strong>Event Name:</strong> {selectedEvent.eventName}</p>
                  <p><strong>Location:</strong> {selectedEvent.eventLocation}</p>
                  <p><strong>Time:</strong> {selectedEvent.time}</p>
              </div>
              <div className="drills-container">
                  <h2 style={{color: 'black'}}>Drills</h2>
                  <ul className="drills">
                      {drills && drills.length > 0 ? (
                          drills.map((drill, index) => (
                              <li key={index} className="event-box">
                                  <p style={{ color: 'black' }}>{drill.drillName}</p>
                              </li>
                          ))
                      ) : (
                          <p>No drills available</p>
                      )}
                  </ul>
              </div>
          </div>
      </div>
        )}

{selectedEvent && storedRole === "Owner" && (
  <div className="event-details" style={{ marginTop: "4vh" }}>
    <div className="event-details-card">
      <h4>Give Feedback on Game/Practice</h4>
      <label style={{ color: 'black', marginTop: '2vh' }}>
        <select
          style={{ backgroundColor: 'whitesmoke', color: 'black' }}
          value={selectedPlayer} 
          onChange={(e) => setSelectedPlayer(e.target.value)} 
          required
        >
          <option value="" disabled>Select a player</option>
          {players.map((player) => {
            const playerInfo = playerDetails[player.userId]; 
            return playerInfo ? (
              <option key={player.userId} value={player.userId}>
                {playerInfo.fname} {playerInfo.lname}
              </option>
            ) : (
              <option key={player.userId} disabled>No details available</option>
            );
          })}
        </select>
      </label>

      {/* Feedback Input */}
      <textarea
        style={{ width: "100%", height: "80px", marginTop: "10px" }}
        placeholder="Enter feedback here..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      ></textarea>

      {/* Submit Button */}
      <button 
        style={{ marginTop: "10px", backgroundColor: "black", color: "white" }}
        onClick={() => handleFeedbackSubmit(selectedPlayer, feedback)}
      >
        Submit Feedback
      </button>
    </div>
  </div>
)}
{selectedEvent && storedRole === "Player" && (
  <div className="event-details" style={{ marginTop: "4vh" }}>
    <div className="event-details-card">
      <h4>Feedback on Game/Practice</h4>
      <p>{feedbackResponse}</p> {/* Display feedback */}
    </div>
  </div>
)}
      </div>
  

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

export default CalendarPage;
