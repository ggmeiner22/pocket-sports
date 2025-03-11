import './TeamHome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Progress from 'react-circle-progress-bar';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import axios from 'axios';


function HomePage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [events, setEvents] = useState({});
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" }
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const [userDetails, setUserDetails] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  });

  const getUserDetails = () => {
    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      console.log('User ID is missing');
      return;
    }

    fetch(`http://localhost:3001/registers/${storedUserId}`)
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

  useEffect(() => {
    // Retrieve the selected team and role from localStorage
    const storedTeam = localStorage.getItem('selectedTeam');
    const storedRole = localStorage.getItem('role');
    if (storedTeam) {
      setTeamName(storedTeam);
    }
    getUserDetails();
    getEvents(); 

    
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

  const renderGoalCards = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className='teamHome' style={{ width: '18rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem',  }}>
          <Progress style={{ '--progress-color': selectedTeam?.teamColors?.[0] }}  progress={75} />
        </div>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>Example text describing the goal.</Card.Text>
          <Button
            style={{ backgroundColor: selectedTeam?.teamColors?.[0] }}
            variant='primary'
          >
            Go somewhere
          </Button>
        </Card.Body>
      </Card>
    ))
  );

  const getEvents = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        console.log("User ID is missing");
        return;
      }
  
      const response = await axios.get('http://localhost:3001/events', {
        headers: {
          userId: storedUserId,
          teamName: teamName,
        },
      });
  
      if (!response.data || response.data.length === 0) {
        console.log("No events found.");
        setEvents({ upcoming: [] }); // Set empty array if no events are found
        return;
      }
  
      // Sort events by date (ascending)
      const sortedEvents = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Get the current date at midnight (UTC) to compare only the date part (not time)
      const currentDateUTC = new Date();
      currentDateUTC.setUTCHours(0, 0, 0, 0);  // Normalize to midnight UTC
  
      // Get the next 3 nearest events from today
      const upcomingEvents = sortedEvents.filter(event => {
        const eventDateUTC = new Date(event.date);
        eventDateUTC.setUTCHours(0, 0, 0, 0); // Normalize event date to midnight UTC for comparison
        return eventDateUTC >= currentDateUTC; // Compare normalized dates in UTC
      }).slice(0, 3);
  
      console.log(upcomingEvents);  // Check the fetched and sorted events
  
      setEvents({
        ...events,
        upcoming: upcomingEvents,  // Store the upcoming events in the state
      });
    } catch (error) {
      console.error("Error fetching events:", error.response || error.message);
      alert("Failed to fetch events. Please try again later.");
      setEvents({ upcoming: [] }); // Set empty array if there’s an error fetching events
    }
  };

  const renderEventCards = () => {
    const upcomingEvents = events.upcoming || [];
  
    if (upcomingEvents.length === 0) {
      return <p style={{color: 'black', alignSelf:'center', width: '100%', fontSize: '5vw', margin: '40px'}}>No upcoming events!</p>; // Display a message when no events are available
    }
  
    return upcomingEvents.map((event, index) => (
      <Card key={index} className='card-events'>
        <Card.Header as='h5'>{event.selectedCategory}</Card.Header>
        <Card.Body>
          <Card.Title>{event.eventName}</Card.Title>
          <Card.Text>Location: {event.eventLocation}</Card.Text>
          <Card.Text>Date: {new Date(event.date).toDateString()}</Card.Text>
          <Card.Text>Start Time: {event.time}</Card.Text> 
          <Button
            style={{ backgroundColor: selectedTeam?.teamColors?.[0] || 'gray' }} 
            variant='primary'
            onClick={() => navigate("/calendarpage")}
          >
            Learn More
          </Button>
        </Card.Body>
      </Card>
    ));
  };

  const renderPracticePlanCards = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card className='teamHome' style={{ width: '18rem' }}>
        <Card.Img variant="top" src="src\basketball_court.jpg" />
        <Card.Body>
        <Button
            style={{ backgroundColor: selectedTeam?.teamColors?.[0], width: '100%' }}
            variant='primary'
          >
            Go to practice plan
          </Button>
        </Card.Body>
      </Card>
    ))
  );

  const renderRosterCards = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <Card key={index} className='card-events'>
        <Card.Header as='h5'>Featured</Card.Header>
        <Card.Body>
          <Card.Title>Event Title</Card.Title>
          <Card.Text>Event details go here.</Card.Text>
          <Button
            style={{ backgroundColor: selectedTeam?.teamColors?.[0] }}
            variant='primary'
          >
            Learn More
          </Button>
        </Card.Body>
      </Card>
    ))
  );

  console.log("Current location:", location.pathname); // Debugging location
  console.log("Updated buttons:", buttons); // Check updated buttons array

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
      <div style={{backgroundColor: selectedTeam?.teamColors?.[0] || 'white'}}>
        <div className="content">
          <div className="homepage-text"><p style={{ fontSize: '10vh' }}>Welcome {userDetails.firstName}!</p>
          <p style={{ fontSize: '4vh' }}>Track your personal goals and perform at your best!</p></div>
        </div>
      </div>
      <div className="home-cards">
      <div className='home-cards'>
        {localStorage.getItem('role') === 'Player' && (
          <>
            <strong className='homepage-headers'>Top Goals</strong>
            {renderGoalCards()}
          </>
        )}
        <strong className='homepage-headers'>Upcoming Events</strong>
        {renderEventCards()}
        {localStorage.getItem('role') === 'Owner' && (
          <>
            <strong className='homepage-headers'>Your Practice Plans</strong>
            {renderPracticePlanCards()}
            <strong className='homepage-headers'>Your Top Performers</strong>
            {renderRosterCards()}
          </>
        )}
        
      </div>
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

export default HomePage;
