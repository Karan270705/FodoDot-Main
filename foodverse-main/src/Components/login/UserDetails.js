import React from 'react';
import user_icon from "../Assets/person.png"
import email_icon from "../Assets/email.png"
import "../login/userStyle.css";

const UserDetails = ({ user, onClose }) => {
  const handleLogout = () => {
    window.localStorage.clear();
    window.location.href = "/login";
  };

  if (!user) {
    return null;
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <div className="text">Welcome, {user.name}!</div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="underline"></div>
        <div className="popup-content">
          <div className="inputs">
            <div className="input">
              <img src={user_icon} alt="" />
              <input 
                type="text" 
                value={user.name} 
                readOnly 
                placeholder="Username"
              />
            </div>
            <div className="input">
              <img src={email_icon} alt="" />
              <input 
                type="email" 
                value={user.email} 
                readOnly 
                placeholder="Email"
              />
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
