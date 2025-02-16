import './TeamHome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [events, setEvents] = useState({}); // Stores events per date
  const [newEvent, setNewEvent] = useState(""); // Event input field
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/goalspage", label: "Goals" },
    { path: "/practiceplans", label: "Practice" }
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(new Date());


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
        if (!prevButtons.some(button => button.path === "/practiceplans")) {
          return [
            ...prevButtons,
            { path: "/practiceplans", label: "Practice Plans" }
          ];
        }
        return prevButtons;
      });
    }

  }, []); 

  console.log("Current location:", location.pathname); // Debugging location
  console.log("Updated buttons:", buttons); // Check updated buttons array

  // ✅ Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  // ✅ Load events from localStorage on page load
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('events'));
    if (storedEvents) setEvents(storedEvents);
  }, []);


  // Function to add an event
  const addEvent = () => {
    if (!newEvent.trim()) return;
    const formattedDate = date.toDateString();
    setEvents(prevEvents => ({
      ...prevEvents,
      [formattedDate]: [...(prevEvents[formattedDate] || []), newEvent]
    }));
    setNewEvent("");
  };

  // Function to remove an event
  const removeEvent = (index) => {
    const formattedDate = date.toDateString();
    const updatedEvents = [...events[formattedDate]];
    updatedEvents.splice(index, 1);
    setEvents(prevEvents => ({
      ...prevEvents,
      [formattedDate]: updatedEvents.length ? updatedEvents : undefined // Remove key if empty
    }));
  };

  return (
    <div className='App'>
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
        <div style={{ backgroundColor: selectedTeam?.teamColors?.[0] || '#e0e0e0', padding: '20px' }}>
          <div className="calendar-container">
            <Calendar onChange={setDate} value={date} className="custom-calendar" />
          </div>

          {/* Event Input */}
          <div className="event-input">
            <h3>Events for {date.toDateString()}</h3>
            <input
              type="text"
              placeholder="Add an event"
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
            />
            <button onClick={addEvent}>Add Event</button>
          </div>

          {/* Display Events */}
          <ul className="event-cards">
            {(events[date.toDateString()] || []).map((event, index) => (
              <li key={index} className="event-box">
                <p>{event}</p>
                <button className="remove-btn" onClick={() => removeEvent(index)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
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

export default HomePage;
