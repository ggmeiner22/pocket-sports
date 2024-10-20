import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    axios.post('http://localhost:3001/register', { name, email, password })
      .then(result => {
        console.log(result);
        console.log('Registration successful!');
        setName('');
        setEmail('');
        setPassword('');
      })
      .catch(err => {
        console.log(err);
        setErrorMessage(err.response?.data?.error || 'Registration failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100"> 
      <div className="bg-white p-4 rounded w-75 m-3">
        <h2 className="text-center">Register</h2>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"> 
            <label htmlFor="name">
              <strong>Name</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              autoComplete="off"
              name="name"
              className="form-control rounded-0"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="password"
              className="form-control rounded-0"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="text-center mt-2">Already Have an Account?</p>
          <button type="button" className="btn btn-light border w-100 rounded-0">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
