import React,{Component} from 'react';
import { useState } from 'react';
import "./resetStyle.css";


export const Reset = () => {

    const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email); // Log the email to the console
    fetch("http://localhost:5000/forgot-password", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        email
      })
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data); // Log the response data to the console
      alert(data.status); // Show alert with the status received from the server
    });
  };



  return (
    <div className='sub-container'>

<form onSubmit={handleSubmit}>
  <div class="row mb-3">
    <label for="inputEmail3" class="col-sm-2 col-form-label">Email</label>
    <div class="col-sm-10">
      <input type="email" class="form-control" id="inputEmail3"  onChange={(e) => setEmail(e.target.value)}/>
    </div>
  </div>
  
  <button type="submit" class="btn btn-primary">Submit</button>
</form>

    </div>
  )
}
export default Reset;