import React, { useState } from "react";
import { toast } from 'react-toastify';

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (email === "admin" && password === "admin") {
      toast.success("Login successful");
      localStorage.setItem("token", "admin-token"); // Simulating authentication token
      localStorage.setItem("loggedIn", true);

      // Use setTimeout to allow the toast to be visible before redirecting
      setTimeout(() => {
        window.location.href = "./adwelcome"; // Redirect after login
      }, 1000);
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  }

  return (
    <div className="auth-wrapper bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header bg-primary text-white text-center py-3">
                <h3 className="mb-0">Admin Login</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Admin Username</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Admin Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-lock"></i></span>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary py-2">
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3 bg-light">
                <div className="small text-muted">
                  FDA Administration Portal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
