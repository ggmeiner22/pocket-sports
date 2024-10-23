import './landing-page.css';
import Card from 'react-bootstrap/Card';
import { BsCalendar2EventFill, BsListStars } from "react-icons/bs";
import ListGroup from 'react-bootstrap/ListGroup';
import { FaMedal } from "react-icons/fa6";
import { GiBasketballBall, GiSoccerField } from "react-icons/gi";
import { FaVolleyballBall } from "react-icons/fa";
import { FaArrowRightLong } from "react-icons/fa6";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

function LandingPage() {

  const navigate = useNavigate();

  const register = () => {
    navigate('/registration'); // Corrected the route path
  };

  const login = () => {
    navigate('/login');
  }

  const [circleSize, setCircleSize] = useState(100); // Initial size of the bottom half-circle
  const [isRectangle, setIsRectangle] = useState(false); // To trigger the rectangle state
  const LacrosseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="bounce-icon" style={{ width: '980px', height: '80px' }}  viewBox="0 0 32 32"><path fill="currentColor" d="M23.222 1.745c-2.908-1.531-6.538-.468-8.165 2.379a6.085 6.085 0 0 0-.477 5.01l.001.005a1.42 1.42 0 0 1-.112 1.173l-1.359 2.357a3.533 3.533 0 0 0 .35 4.032L7.159 27.607c-.33.59-.13 1.33.45 1.67c.58.33 1.33.13 1.67-.45l6.3-10.907a3.542 3.542 0 0 0 3.652-1.72l1.361-2.36l.001-.002c.2-.35.55-.601.968-.687a6.045 6.045 0 0 0 4.111-2.932c1.734-2.993.63-6.839-2.447-8.472zm-.534 2.011c.59.402 1.046.935 1.352 1.535l-.704 1.219l-1.68-.97zm1.626 2.216c.119.39.18.799.178 1.21l-.656-.382zm.127 1.848c-.078.48-.242.953-.5 1.398l-.004.006a4.04 4.04 0 0 1-.536.733l-1.045-.607l1.19-2.05zm-1.482 2.549a4.091 4.091 0 0 1-1.655.792l.762-1.311zm-2.451 1.024a3.482 3.482 0 0 0-.29.136l-1.522-.879l1.19-2.05l1.68.97zm-.822.486a3.383 3.383 0 0 0-.827.962v.001l-.56.972l-1.083-.624l1.19-2.05zm-1.676 2.436l-.51.885a1.538 1.538 0 0 1-1.839.682l1.265-2.192zm-2.848 1.275a1.534 1.534 0 0 1-.32-1.92l.511-.888l1.073.618zm.48-3.309l.56-.972v-.001c.216-.375.356-.782.419-1.2l1.285.742l-1.19 2.05zm1.015-2.81a3.413 3.413 0 0 0-.023-.285l1.072-1.846l1.68.97l-1.19 2.05zm-.223-1.101a4.086 4.086 0 0 1-.135-1.856l.907.526zm.004-2.444a4.16 4.16 0 0 1 .356-.81c.26-.454.596-.841.984-1.153l.908.527l-1.19 2.05zm1.868-2.325c.361-.207.751-.36 1.155-.451l-.485.84zm3.884-.137L21.156 5.25l-1.68-.97l.71-1.23a4.077 4.077 0 0 1 2.004.414M19.176 4.78l1.68.97l-1.19 2.05l-1.68-.97zm2.68 4.29l-1.68-.97l1.19-2.05l1.68.97zM17.5 26.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"/></svg>
  
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Calculate circle size based on scroll position, with a max size
      const newCircleSize = Math.min(window.innerHeight, 100 + scrollY * 1.5); // Grows as you scroll
      setCircleSize(newCircleSize);

      // If the scroll is past a certain point, switch to rectangle
      if (scrollY > window.innerHeight) {
        setIsRectangle(true);
      } else {
        setIsRectangle(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <header className="landing-page-header">
        <div className="logo">PocketSports</div>
        <div className="button-container">
          <button onClick={login} className="coachButton">Login</button>
          <button className="contactButton">Contact Us</button>
        </div>
      </header>
      <div className="App">
      
    </div>
      <div className="image-screen">
        <video autoPlay loop muted playsInline>
          <source src="Arrows.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="content">
          <div><p className="img-text">Tailored Training for Peak Performance</p></div>
          <div className="img-text2">
            <p >Ready To Elevate Your Team?</p>
            <button onClick={register} style={{fontSize: '20px'}}className="featuresButtons">Register Now! <FaArrowRightLong style={{ fontSize: '20px', marginLeft:'20px'
            }}/></button>
          </div>
        </div>
      </div>

      <div>
        <div  className={`background-shape ${isRectangle ? 'rectangle' : ''}`} 
        style={{ height: isRectangle ? '500px' : `${circleSize}px` }}>
        <p style={{ fontSize: '40px', paddingTop: '40px' }}>ALL IN ONE APP</p>
        <p className="description">
          At PocketSports, we are dedicated to empowering emerging sports by providing them with the comprehensive platforms they deserve. 
          In today's sports landscape, many existing applications focus on narrow aspects of coaching, such as practice planning or goal setting, 
          which forces teams to rely on multiple tools to manage their operations. This fragmented approach underscores a critical need for a 
          more integrated solution—one that simplifies coaching tasks, while driving innovation and efficiency within the 
          sports tech space.
        </p>
        <p className="description">
          We are committed to reducing this complexity by offering an all-in-one platform that unites multiple sports under a single, affordable system. 
          Our solution is designed to benefit not only small teams and communities, but also to fuel growth in areas where competition and opportunities 
          for expansion remain untapped. By streamlining operations, enhancing collaboration, and providing a seamless user experience, we aim to redefine 
          how emerging sports manage their teams, paving the way for future success.
        </p>
        </div>
        <p style={{ fontSize: '40px' }}>Sports included:</p>
        <div className="cardsSports">
          <Card className="cardSport">
            <LacrosseIcon/>
            <Card.Title className="cardTitles">Lacrosse</Card.Title>
          </Card>
          <Card className="cardSport">
            <FaVolleyballBall className="bounce-icon" style={{ fontSize: '80px' }} />
            <Card.Title className="cardTitles">Volleyball</Card.Title>
          </Card>
          <Card className="cardSport">
            <GiBasketballBall className="bounce-icon" style={{ fontSize: '80px' }} />
            <Card.Title className="cardTitles">Basketball</Card.Title>
          </Card>
        </div>
        <div className="coach">
        <p id="feature-section" style={{ fontSize: '40px', color:'black', paddingTop: '50px' }}> COACH FEATURES</p>
        <div className="cardsFeatureCoach">
          <Card className="cardCoach">
          <BsListStars style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Roster</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Access a detailed list of your teammates and coaches, complete with essential information and statistics</p>
                
              </ListGroup.Item>
            </Card.Body>
          </Card>
          <Card className="cardCoach">
          <BsCalendar2EventFill style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Schedule</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Stay organized by keeping track of your practices and games, while also viewing upcoming practice plans</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          <Card className="cardCoach">
          <FaMedal style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Goals</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Strive for excellence by setting high aspirations for the team, track team's progress, and earn achievements</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          <Card className="cardCoach">
          <GiSoccerField style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Practice Plans</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Tailor your training sessions by creating custom practice plans and drills specifically suited to your team's needs</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          </div>
        </div>

          <p id="feature-section" style={{ fontSize: '40px', paddingTop: '50px' }}> PLAYER FEATURES</p>
              
          <div className="cardsFeature">  
          <Card className="cardPlayer">
          <BsListStars style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Roster</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Access a detailed list of your teammates and coaches, complete with essential information and statistics</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          <Card className="cardPlayer">
          <BsCalendar2EventFill style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Schedule</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Stay organized by keeping track of your practices and games, while also viewing upcoming practice plans</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          <Card className="cardPlayer">
          <FaMedal style={{ fontSize: '80px' }} />
            <Card.Body>
              <Card.Title className="cardTitles">Goals</Card.Title>
              <ListGroup.Item className="text-icon-container">
                <p className="custom-list-item">Strive for excellence by setting high aspirations for both team and individual goals, track individual progress, and earn achievements</p>
              </ListGroup.Item>
            </Card.Body>
          </Card>
          </div>  
          
              
        <p style={{ fontSize: '40px' }}>DEMO</p>
        <img src="logo512.png" alt="img"></img>
        {/* <video autoPlay loop muted className="demo">
          <source src="/Arrows.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h4>About Us</h4>
            <p>
              We are committed to empowering emerging sports by providing
              integrated platforms that streamline coaching and management tasks.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PocketSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
