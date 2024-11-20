import './TeamHome.css';
import React, { useState, useEffect } from 'react';

function HomePage() {

  
  return (
    <div className="landing-page">
      <header className="landing-page-header">
        <div className="logo">
          <a href="/" style={{ textDecoration: 'none', color: 'white' }}>PocketSports</a>
        </div>
        <div className="button-container">
        </div>
      </header>
      <div className="App">
      
    </div>
      <div className="image-screen">
        <div className="content">
          <div><p className="img-text">Tailored Training for Peak Performance</p></div>
          
        </div>
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

export default HomePage;
