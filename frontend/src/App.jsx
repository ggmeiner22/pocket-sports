import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './registration';
import Login from './Login'
import LandingPage from './landing-page';
import AfterLoginTemp from './AfterLoginTemp';
import React from 'react';
import TeamsPage from './Teams';

function App() {
  return (
    <Routes>  {/* No BrowserRouter here */}
      <Route path="/" element={<LandingPage />} />  {/* Define the home route */}
      <Route path="/registration" element={<RegistrationPage />} />  {/* Define the registration route */}
      <Route path="/login" element={<Login />} />
      <Route path="/temp" element={<AfterLoginTemp />} />
      <Route path="/teams" element={<TeamsPage />} />
    </Routes>
  );
}
export default App;
