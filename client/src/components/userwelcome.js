import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserSidebar from "./usersidebar";
import { Link } from "react-router-dom";

export default function Dashboard({ userData }) {
  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 p-0">
            <UserSidebar/>
          </div>
          <div className="col-10 main-content p-0">
            {/* Dashboard Content */}
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mt-4 mb-4">
                <h2 className="mb-0">Manufacturer Dashboard</h2>
              </div>

              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card bg-white shadow-sm">
                    <div className="card-body text-center">
                      <h3 className="mb-4 text-primary">Welcome to the Drug Certification Portal</h3>
                      <p className="lead">Use the sidebar navigation to manage your drug applications and certifications.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-primary text-white text-center py-3 mb-4">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="row equal-height-cards mb-4">
                <div className="col-md-4 mb-3">
                  <div className="card bg-primary text-white quick-action-card">
                    <div className="card-body text-center">
                      <i className="bi bi-file-earmark-plus" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">New Application</h5>
                      <p>Submit a new drug certification application</p>
                      <Link to="/userHome" className="btn btn-light">Submit</Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-success text-white quick-action-card">
                    <div className="card-body text-center">
                      <i className="bi bi-list-check" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">My Applications</h5>
                      <p>View status of your submitted applications</p>
                      <Link to="/userapplicationviewstatus" className="btn btn-light">View</Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-info text-white quick-action-card">
                    <div className="card-body text-center">
                      <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">Search Drugs</h5>
                      <p>Search for approved drugs in the database</p>
                      <Link to="/publichome" className="btn btn-light">Search</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
