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
import Verify from './Verify';
import Roster from './Roster';
import PracticePlans from './practice-plans';
import GoalsPage from './goals-page';
import CalendarPage from './calendar';

function App() {
  return (
    <Routes> 
      <Route path="/" element={<LandingPage />} /> 
      <Route path="/registration" element={<RegistrationPage />} /> 
      <Route path="/login" element={<Login />} />
      <Route path="/temp" element={<AfterLoginTemp />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/home" element={<HomePage/>}/>
      <Route path="/verifycode" element={<Verify/>}/>
      <Route path="/roster" element={<Roster/>}/>
      <Route path="/practiceplans" element={<PracticePlans/>}/>
      <Route path="/goalspage" element={<GoalsPage/>}/>
      <Route path="/homepage" element={<HomePage/>}/>
      <Route path="/calendarpage" element={<CalendarPage/>}/>
    </Routes>
  );
}
export default App;
