import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./sidebar";

export default function AdminHome() {

  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 bg-white sidebar">
            <Sidebar/>
          </div>
          <div className="col-10 main-content p-0">


            {/* Dashboard Content */}
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mb-4">
                <h2 className="mb-0">Admin Home</h2>
              </div>

              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card bg-white shadow-sm">
                    <div className="card-body text-center">
                      <h3 className="mb-4 text-primary">Welcome to the FDA Admin Portal</h3>
                      <p className="lead">Use the sidebar navigation to manage drug applications and certifications.</p>
                      <div className="mt-4">
                        <a href="/admetrics" className="btn btn-primary me-3">
                          <i className="bi bi-graph-up me-2"></i>View Dashboard Metrics
                        </a>
                        <a href="/adview" className="btn btn-success">
                          <i className="bi bi-list-check me-2"></i>View Applications
                        </a>
                      </div>
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
                      <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">Search Applications</h5>
                      <p>Search for drug applications by name or manufacturer</p>
                      <a href="/adview" className="btn btn-light">Search</a>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-success text-white quick-action-card">
                    <div className="card-body text-center">
                      <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">Approve Applications</h5>
                      <p>Review and approve pending drug applications</p>
                      <a href="/adview" className="btn btn-light">Review</a>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card bg-info text-white quick-action-card">
                    <div className="card-body text-center">
                      <i className="bi bi-graph-up" style={{ fontSize: '2rem' }}></i>
                      <h5 className="mt-3">View Analytics</h5>
                      <p>View detailed metrics and analytics dashboard</p>
                      <a href="/admetrics" className="btn btn-light">Analytics</a>
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
