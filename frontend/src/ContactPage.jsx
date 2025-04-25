import React, { useState, useEffect } from 'react';
import './contact.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function ContactPage() {
  const [buttons, setButtons] = useState([
        { path: "/homepage", label: "Home" },
        { path: "/roster", label: "Roster" },
        { path: "/calendarpage", label: "Calendar" },
        { path: "/goalspage", label: "Goals" }
      ]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  useEffect(() => {
          const storedTeam = localStorage.getItem('selectedTeam');
          if (storedTeam) {
              setSelectedTeam(JSON.parse(storedTeam));
          }
      }, []);
  
      
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const storedTeamString = localStorage.getItem("selectedTeam");
  const storedUserId = localStorage.getItem('userId');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      console.error("Error fetching contact:", error.response || error.message);
    } 
  };

  useEffect(() => {
      
      // Call getDrillTab to update header buttons based on the user's role
      getDrillTab();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });  // Reset form after submission
    } catch (err) {
      setErrorMessage('Submission failed. Please try again.');
    }
  };

  return (
    <div className="contactApp">
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
    <div className="contact-page">
      <div className="contact-box">
        <div className="left-half">
          <h2>Get in touch</h2>
          {submitted ? (
            <p className="success-message">Thanks for reaching out! We'll get back to you shortly.</p>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                aria-label="Your Name"
              />
              
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                aria-label="Your Email"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
                aria-label="Your Message"
              />

              <button type="submit">Submit</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          )}
        </div>
        <div className="right-half"></div>
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

export default ContactPage;
