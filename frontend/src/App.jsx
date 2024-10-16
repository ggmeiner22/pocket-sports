import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    axios.post('http://localhost:3001/register', {name, email, password})
      .then(result => {
        console.log(result);
        console.log('Registration successful!');

        console.log('Before clearing:', { name, email, password });
        setName('');
        setEmail('');
        setPassword('');
        console.log('After clearing:', { name, email, password }); // Log cleared values


      })
    .catch(err => {
      console.log(err)
      alert('Registration failed: ' + (err.response?.data?.error || 'Unknown error'));
    })


  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-primary vh-100"> 
      <div className="bg-white p-4 rounded w-75 m-3"> {/* Wider and added margin */}
        <h2 className="text-center">Register</h2>
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

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Register
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
