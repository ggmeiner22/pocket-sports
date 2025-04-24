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
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });  // Reset form after submission
    } catch (err) {
      setErrorMessage('Submission failed. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-box">
        <div className="left-half">
          <h2>Get in touch</h2>
          {submitted ? (
            <p className="success-message">Thanks for reaching out! We'll get back to you shortly.</p>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                aria-label="Your Name"
              />
              
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                required
                aria-label="Your Email"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
                aria-label="Your Message"
              />

              <button type="submit">Submit</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          )}
        </div>
        <div className="right-half"></div>
      </div>

    </div>
  );
}

export default ContactPage;
