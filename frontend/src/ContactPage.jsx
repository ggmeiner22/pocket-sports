import React, { useState } from 'react';
import './contact.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const navigate = useNavigate();


  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Replace with your backend endpoint
    try {
      await axios.post('http://localhost:3001/contact', formData);
      setSubmitted(true);
    } catch (err) {
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => navigate('/homepage')}
        className="return-button"
      >
        ← Return to Team Home
      </button>
  
      <div className="contact-page">
        <h2>Contact Us</h2>
        {submitted ? (
          <p className="success-message">Thanks for reaching out! We'll get back to you shortly.</p>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <label>
              Name:
              <input name="name" type="text" value={formData.name} onChange={handleChange} required />
            </label>
  
            <label>
              Email:
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </label>
  
            <label>
              Message:
              <textarea name="message" value={formData.message} onChange={handleChange} required />
            </label>
  
            <button type="submit">Send Message</button>
          </form>
        )}
      </div>
    </>
  );
  
}

export default ContactPage;
