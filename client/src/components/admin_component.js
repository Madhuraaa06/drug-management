import React, { useState } from "react";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (email === "admin" && password === "admin") {
      alert("Login successful");
      localStorage.setItem("token", "admin-token"); // Simulating authentication token
      localStorage.setItem("loggedIn", true);
      window.location.href = "./adwelcome"; // Redirect after login
    } else {
      alert("Invalid Credentials");
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-inner">
        <form onSubmit={handleSubmit}>
          <h3>Admin Sign In</h3>

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
