import React, { useState } from "react";
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cname, setCname] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    console.log(cname, email, password);
    fetch("http://localhost:5008/login-user", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        cname,
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userRegister");
        if (data.status === "ok") {
          toast.success("Login successful");
          window.localStorage.setItem("token", data.data);
          window.localStorage.setItem("loggedIn", true);

          // Use setTimeout to allow the toast to be visible before redirecting
          setTimeout(() => {
            window.location.href = "./userDetails";
          }, 1000);
        } else {
          toast.error("Invalid credentials. Please try again.");
        }
      });
  }

  return (
    <div className="auth-wrapper bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm border-0 rounded-lg">
              <div className="card-header bg-primary text-white text-center py-3">
                <h3 className="mb-0">Manufacturer Login</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Manufacturer Name</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-building"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Name"
                        onChange={(e) => setCname(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter Email"
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
                <div className="small">
                  Don't have an account? <a href="/sign-up" className="text-primary">Sign up now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
