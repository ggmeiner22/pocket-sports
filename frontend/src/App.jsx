import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './registration';
import LandingPage from './landing-page';
import React from 'react';

function App() {
  return (
    <Routes>  {/* No BrowserRouter here */}
      <Route path="/" element={<LandingPage />} />  {/* Define the home route */}
      <Route path="/registration" element={<RegistrationPage />} />  {/* Define the registration route */}
    </Routes>
  );
}

export default App;
