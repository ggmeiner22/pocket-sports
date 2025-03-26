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
  const [eventName, setEventName] = useState('');
    const [loading, setLoading] = useState(false);  // Loading state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [players, setPlayers] = useState([]);
  const [feedback, setFeedback] = useState(''); // To store user feedback text
  const [eventLocation, setEventLocation] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(''); // Rename this state to better reflect its purpose, such as `selectedPlayerId`.
  const [drills, setDrills] = useState([]); // initialize drills as an empty array
  const [time, setTime] = useState('');
  const [playerDetails, setPlayerDetails] = useState({});
  const [userId, setUserId] = useState(''); // userId state
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const storedRole = localStorage.getItem('role');
  const [buttons, setButtons] = useState([
        { path: "/homepage", label: "Home" },
        { path: "/roster", label: "Roster" },
        { path: "/calendarpage", label: "Calendar" },
        { path: "/goalspage", label: "Goals" },
        { path: "/drills", label: "Drills" },
        { path: "/practiceplans", label: "Practice Plans" },
      ]);

  const storedUserId = localStorage.getItem('userId');
  const storedTeam = localStorage.getItem('selectedTeam');


  const handleDrillChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setDrills(selectedOptions); 
  };

  useEffect(() => {
    if (storedTeam) {
      setTeamName(storedTeam);
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
    getEvents(selectedDate); // Fetch events for the selected date
    getRoster();
  }, [selectedDate]);

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

   useEffect(() => {
      const storedTeam = localStorage.getItem("selectedTeam");
      if (storedTeam) {
          setSelectedTeam(JSON.parse(storedTeam));
      }
    }, []);

  // Fetch events for the selected date
  const getEvents = async (date) => {
    try {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        console.log("User ID is missing");
        return;
      }

      const formattedDate = date.toDateString(); // Get the string representation of the date
      const response = await axios.get('http://localhost:3001/events', {
        headers: {
          userId: storedUserId,
          teamName: teamName,
        },
      });

      const eventsForDate = response.data.filter((event) => new Date(event.date).toDateString() === formattedDate);
      console.log(eventsForDate);
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

  // Handle date change on calendar
  const handleDateChange = (date) => {
    setSelectedDate(date); // Update selected date
  };

  // Add new event popup
  const addEvent = () => {
    setShowPopup(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);  // Set the clicked event's details
  };

  // Handle form submission to create event
  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const newEvent = {
      teamName,
      selectedCategory,
      eventName,
      date: selectedDate,
      eventLocation,
      drills,
      time,
      createdBy: userId,
    };

    axios.post('http://localhost:3001/events', newEvent)
      .then(() => {
        setShowPopup(false);
        setSelectedCategory('');
        setEventName('');
        setEventLocation('');
        setDrills('');
        setTime('');

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
          <button className="contactButton1">Contact Us</button>
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
                  <select style={{backgroundColor: 'whitesmoke', color: 'black'}}value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
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
                Drills:
                <select style={{backgroundColor: 'whitesmoke', color: 'black'}}value={drills} onChange={(e) => setDrills(e.target.value)} required>
                    <option value="" disabled>Select a category</option>
                    <option>Sprints</option>
                    <option>Other Drill</option>
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
                {Array.isArray(selectedEvent.drills) && selectedEvent.drills.length > 0 ? (
                selectedEvent.drills.map((drill, index) => (
                    <li key={index} className="event-box">
                    <p style={{ color: 'black' }}>{drill}</p>
                    </li>
                ))
                ) : (
                <p>No drills available</p>
                )}
                </ul>
            </div>
        </div>
        
        )}

{selectedEvent && storedRole == "Owner" && (
    <div className = "event-details" style={{marginTop:"4vh"}}>
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
              const playerInfo = playerDetails[player.userId]; // Access player details using userId
              // Check if playerInfo exists before rendering the option
              return playerInfo ? (
                <option key={player.userId} value={player.userId}>
                  {playerInfo.fname} {playerInfo.lname}
                </option>
              ) : (
                <option key={player.userId} disabled>No details available</option> // Optional fallback if playerInfo is not available
              );
            })}
          </select>
        </label>
      </div>

      <div className = "drills-container">
        <input 
          type="text" 
          id="feedbackTextBox" 
          placeholder="Enter your feedback here" 
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)} 
        />
        <button 
          onClick={() => handleFeedbackSubmit(selectedPlayer, feedback)} 
          style={{ backgroundColor: 'black', color: 'white', marginTop: '4vh' }}
        >
          Submit Feedback
        </button>
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
