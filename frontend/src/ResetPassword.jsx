import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/reset-password/${token}`, { password });
      setMessage('Password reset successful. You can now log in.');
    } catch (err) {
      setMessage('Failed to reset password.');
    }
  };

  return (
    <div className="reset-password">
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <label>New Password:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
