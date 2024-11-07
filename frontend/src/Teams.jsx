import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import './Teams.css'
import axios from 'axios';


function TeamsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [teamColors, setTeamColors] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedSport, setselectedSport] = useState('');

  const navigate = useNavigate();

  const landing = () => {
    navigate('/');
  };

  const login = () => {
    navigate('/login');
  };

  const handleCreateTeam = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false); 
  };

  const handleTeamChange = (e) => {
    setselectedSport(e.target.value); // Update the selected team
  };

  const getTeams = async () => {
    try {
      const response = await axios.get('http://localhost:3001/teams');
      setTeams(response.data); 
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating team:', { teamName, organizationName, teamColors, selectedSport });
    // Handle team creation logic here (e.g., API call)
    setShowPopup(false);
    axios.post('http://localhost:3001/teams', { teamName, organizationName, teamColors, selectedSport })
      .then(result => {
        console.log('Team Creation successful!');
        setTeamName('');
        setOrganizationName('');
        setTeamColors('');
        setselectedSport('');
        getTeams();
      })
      .catch(err => {
        console.log(err);
        alert('Team Creation failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };

  return (
    <div className='teams-container'>
      <header className="landing-page-header">
        <div className="logo">PocketSports</div>
        <div className="button-container">
          <button onClick={landing} className="coachButton">Home</button>
          <button onClick={login} className="contactButton">Login</button>
        </div>
      </header>
      
      <div className = "createButtons">
      <button className="topButtons"onClick={handleCreateTeam}>Create Team + </button>
      <button className = "topButtons">Join Team + </button>
      </div>
      <div className="body">
        {showPopup && (
          <div className="popup-top">
            <div className="popup-content">
              <h2>Create a New Team</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Team Name:
                  <input
                    type={"text"}
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Organization Name:
                  <input
                    type={"text"}
                    id="organizationName"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                  />
                </label>
                <br />
                <label>
                  Team Colors:
                  <input
                    type={"text"}
                    id="teamColors"
                    value={teamColors}
                    onChange={(e) => setTeamColors(e.target.value)}
                    placeholder="e.g., Blue, Red"
                    required
                  />
                </label>
                <label>
                    Intended Sport:
                    <select value={selectedSport} onChange={handleTeamChange}>
                    <option value="" disabled>Select a team</option>
                    <option>Lacrosse</option>
                    <option>Basketball</option>
                    <option>Volleyball</option>
                </select>
                </label>
                <br />
                <div className="popup-buttons">
                  <button className= "topButtons" type="button" onClick={handleClosePopup}>Cancel</button>
                  <button  className= "topButtons"  type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <h2>Teams List</h2>
        <ul className="teamsList">
          {teams.map((team, index) => (
            <li key={index}>
            <div>
            <div className="teamName"><strong>{team.teamName}</strong></div>
            <div className="organizationName">{team.organizationName}</div>
            </div>
            <button className= 'topButtons'>Select Team + </button>
          </li>
          ))}
        </ul>

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

export default TeamsPage;
