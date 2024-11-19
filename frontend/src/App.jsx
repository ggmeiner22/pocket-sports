import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './registration';
import Login from './Login'
import LandingPage from './landing-page';
import AfterLoginTemp from './AfterLoginTemp';
import React from 'react';
import TeamsPage from './Teams';
import HomePage from './TeamHome';

function App() {
  return (
    <Routes> 
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/registration" element={<RegistrationPage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/temp" element={<AfterLoginTemp />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/home" element={<HomePage/>}/>
    </Routes>
  );
}
export default App;
