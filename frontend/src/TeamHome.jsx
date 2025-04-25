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
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState({});
  const [practicePlans, setPracticePlans] = useState([]);
  const [buttons, setButtons] = useState([
    { path: "/homepage", label: "Home" },
    { path: "/roster", label: "Roster" },
    { path: "/calendarpage", label: "Calendar" },
    { path: "/goalspage", label: "Goals" }
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [storedRole, setStoredRole] = useState(""); // State for storing the role


  // Retrieve stored values from localStorage
  const storedUserId = localStorage.getItem('userId');
  const storedTeamString = localStorage.getItem('selectedTeam');

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

  // getDrillTab checks the user's role from the roster
  const getDrillTab = async () => {
    try {
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
        //alert(`Your role is: ${me.role}`);  // For debugging
        if (me.role === "Owner" || me.role === "Coach") {
          setStoredRole("Owner"); // Update storedRole to "Owner"
          setButtons((prev) => {
            if (!prev.some(b => b.path === "/drills")) {
              return [...prev, { path: "/drills", label: "Drills" }];
            }
            if (!prev.some(b => b.path === "/practiceplans")) {
              return [...prev, { path: "/practiceplans", label: "Practice Plans" }];
            }
            return prev;
          });
        } else {
          setStoredRole("Player"); 
        }
      }
    } catch (error) {
      console.error("Error fetching roster:", error.response || error.message);
    } finally {
      setLoading(false);
    }
  };

  // On mount, load team info, user details, events, and update header buttons using getDrillTab
  useEffect(() => {
    if (storedTeamString) {
      setTeamName(storedTeamString);
      setSelectedTeam(JSON.parse(storedTeamString));
    }
    getUserDetails();
    getEvents();
    // Call getDrillTab to update header buttons based on the user's role
    getDrillTab();
  }, []);

  const [goals, setGoals] = useState([]);
  useEffect(() => {
    const storedTeam = localStorage.getItem("selectedTeam");
    if (storedTeam) {
        setSelectedTeam(JSON.parse(storedTeam));
    }
  }, []);

  useEffect(() => {
      if (selectedTeam && selectedTeam._id) {
          fetchGoals();
          getPracticePlans();
          

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
        const response = await axios.get("http://localhost:3001/goals", {
            params: { teamId: selectedTeam._id },
        });

        console.log("Goals fetched:", response.data); // Debugging
        //if (res.data.length > 0) {
          //console.log("First goal:", res.data[0]);
        //}

        if (response.data && response.data.length > 0) {
          // Sort by lastUpdated or createdAt in descending order (most recent first)
          const sortedGoals = response.data.sort((a, b) => new Date(b.createdAt));
    
          // Take only the top 3 most recent goals
          setGoals(sortedGoals.slice(0, 3));
        }
        console.log("Goals after update:", response.data[4]);

    } catch (error) {
        console.error("Error fetching goals:", error);
    }
  };

useEffect(() => {
  if (selectedTeam) fetchGoals();
}, [selectedTeam]);


const renderGoalCards = () => {
  if (goals.length === 0) {
    return <p style={{ color: 'black', alignSelf: 'center', width: '100%', fontSize: '5vw', margin: '40px' }}>No recent goals!</p>;
  }

  return goals.map((goal, index) => (
    <Card key={index} className='teamHome' style={{ width: '18rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
      <Progress  style={{color: selectedTeam?.teamColors?.[0]}} progress={(goal.progress / goal.targetNumber) * 100} />
      </div>
      <Card.Body>
        <Card.Title>{goal.title || "Goal Title"}</Card.Title>
        <Card.Text>{goal.description || "Goal details here."}</Card.Text>
        <Button
          style={{ backgroundColor: selectedTeam?.teamColors?.[0] }}
          variant='primary'
          onClick={() => navigate(`/goalspage`)}
        >
          View Goal
        </Button>
      </Card.Body>
    </Card>
  ));
};
  const getEvents = async () => {
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
  
      const response = await axios.get('http://localhost:3001/events', {
        headers: {
          teamid: storedTeamId,  // Ensure the team ID is passed correctly
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

  const getPracticePlans = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedTeamString = localStorage.getItem('selectedTeam');
      const storedTeam = storedTeamString ? JSON.parse(storedTeamString) : null;
      const storedTeamId = storedTeam ? storedTeam._id : null;

      if (!storedUserId || !storedTeamId) {
        console.log("User ID or Team ID is missing");
        return;
      }
      console.log("stores team id", storedTeamId)
      const response = await axios.get(`http://localhost:3001/practiceplans?teamId=${storedTeamId}`);


      console.log("Practice plans response:", response.data);  // Debugging


      if (!response.data || response.data.length === 0) {
        console.log("No practice plans found.");
        setPracticePlans([]);  // Set empty array if no practice plans
        return;
      }

      // Sort practice plans by createdAt in descending order (most recent first)
      const sortedPlans = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Take only the top 3 most recent practice plans
      setPracticePlans(sortedPlans.slice(0, 3));  // Update the state with the most recent practice plans
    } catch (error) {
      console.error("Error fetching practice plans:", error.response || error.message);
      alert("Failed to fetch practice plans. Please try again later.");
      setPracticePlans([]);  // Set empty array if there's an error
    }
  };

  useEffect(() => {
    getPracticePlans();  // This will call the function when the component mounts
}, [])

  // Render practice plan cards
  const renderPracticePlanCards = () => {
    if (practicePlans.length === 0) {
      return (
        <p style={{ color: 'black', alignSelf: 'center', width: '100%', fontSize: '5vw', margin: '40px' }}>
          No current practice plans!
        </p>
      );
    }
  
    return practicePlans.map((plan, index) => (
      <Card className='teamHome' style={{ width: '20rem', height: '20rem' }} key={index}>
        <Card.Img variant="top" src="/Basketball.jpg" />
        <Card.Body>
          <Card.Title>{plan.planName}</Card.Title>
          <Button
            style={{ backgroundColor: selectedTeam?.teamColors?.[0], width: '100%' }}
            variant='primary'
            onClick={() => navigate("/practiceplans")}
          >
            Go to practice plan
          </Button>
        </Card.Body>
      </Card>
    ));
  };
  

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
        <button className="contactButton1" onClick={() => navigate('/contactpage')}>
          Contact Us
        </button>
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
        {storedRole === 'Player' && (
          <>
            <strong className='homepage-headers'>Top Goals</strong>
            {renderGoalCards()}
          </>
        )}
        <strong className='homepage-headers'>Upcoming Events</strong>
        {renderEventCards()}
        {storedRole === 'Owner' && (
          <>
            <strong className='homepage-headers'>Your Practice Plans</strong>
            {renderPracticePlanCards()}
            {/* <strong className='homepage-headers'>Your Top Performers</strong>
            {renderRosterCards()} */}
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
