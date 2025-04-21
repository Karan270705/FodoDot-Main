import { useState } from "react";
import React from "react";
import "./loginStyle.css";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import UserDetails from "./UserDetails";
import { useEffect } from "react";
// import axios from 'axios';
export const Login = () => {
  const [action, setAction] = useState("Sign Up");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [uname, setUname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPopup, setShowPopup] = useState(true);

  // const handleActionChange = (newAction) => {
  //   setAction(newAction);
  //   // Clear input fields when switching actions
  //   setUname("");
  //   setEmail("");
  //   setPassword("");
  // };

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      // Fetch user data if token exists
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/user/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === "ok") {
        setUserData(data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      window.localStorage.removeItem("token");
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    window.location.href = "/"; // Redirect to home page
  };

  const handleSubmit = async () => {
    setMessage({ text: "", type: "" });

    // Validate fields
    if (action === "Sign Up" && (!uname || !email || !password)) {
      setMessage({ text: "Please fill in all fields!", type: "error" });
      return;
    }

    if (action === "Login" && (!email || !password)) {
      setMessage({ text: "Please fill in all fields!", type: "error" });
      return;
    }

    try {
      const endpoint = action === "Sign Up" ? "/register" : "/login";
      const body = action === "Sign Up" 
        ? { name: uname, email: email.toLowerCase(), password }
        : { email: email.toLowerCase(), password };

      console.log("Sending request to:", endpoint);
      console.log("Request body:", body);

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.status === "ok") {
        window.localStorage.setItem("token", data.data);
        setUserData(data.user);
        setIsLoggedIn(true);
        setMessage({ text: `${action} Successful! Welcome, ${data.user.name}!`, type: "success" });
        
        // Clear form fields
        setUname("");
        setEmail("");
        setPassword("");
      } else {
        setMessage({ text: data.detail || `${action} Failed`, type: "error" });
        console.error("Login/Signup failed:", data.detail);
      }
    } catch (error) {
      console.error(`Error during ${action.toLowerCase()}:`, error);
      setMessage({ text: `An error occurred during ${action.toLowerCase()}`, type: "error" });
    }
  };

  // const boundHandleSubmit = handleSubmit.bind(this);

  return (
    <div className="container">
      <div className="sub-container">
        {isLoggedIn && userData && showPopup ? (
          <UserDetails user={userData} onClose={handleClosePopup} />
        ) : (
          <div>
            <div className="header">
              <div className="text">{action}</div>
              <div className="underline"></div>
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="inputs">
                {action === "Login" ? <div></div> : (
                  <div className="input">
                    <img src={user_icon} alt="" />
                    <input 
                      type="text" 
                      placeholder="Username" 
                      value={uname}
                      onChange={e => setUname(e.target.value)}
                    />
                  </div>
                )}

                <div className="input">
                  <img src={email_icon} alt="" />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                  />
                </div>

                <div className="input">
                  <img src={password_icon} alt="" />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {action === "Sign Up" ? <div></div> : (
              <div className="forgot-password">
                For resetting password exchange login by reset in the URL
                <span></span>
              </div>
            )}
            <div className="submit-container">
              <div 
                className={action === "Login" ? "submit gray" : "submit"}
                onClick={() => {
                  if (action === "Login") {
                    // Switch to Sign Up mode
                    setAction("Sign Up");
                    setMessage({ text: "", type: "" });
                    setUname("");
                    setEmail("");
                    setPassword("");
                  } else {
                    // Handle Sign Up submission
                    handleSubmit();
                  }
                }}
              >
                Sign Up
              </div>
              <div 
                className={action === "Sign Up" ? "submit gray" : "submit"}
                onClick={() => {
                  if (action === "Sign Up") {
                    // Switch to Login mode
                    setAction("Login");
                    setMessage({ text: "", type: "" });
                    setUname("");
                    setEmail("");
                    setPassword("");
                  } else {
                    // Handle Login submission
                    handleSubmit();
                  }
                }}
              >
                Login
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
