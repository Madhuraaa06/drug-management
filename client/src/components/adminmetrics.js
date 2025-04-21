import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./sidebar";
import { toast } from 'react-toastify';

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationMetrics();
    fetchRecentApplications();
  }, []);

  const fetchApplicationMetrics = async () => {
    try {
      const response = await fetch("http://localhost:5008/getApplication");
      const data = await response.json();

      if (data.status === "ok" && data.data) {
        const applications = data.data;
        const total = applications.length;
        const pending = applications.filter(app => app.status !== 'approved' && app.status !== 'rejected').length;
        const approved = applications.filter(app => app.status === 'approved').length;
        const rejected = applications.filter(app => app.status === 'rejected').length;

        setMetrics({
          total,
          pending,
          approved,
          rejected
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Failed to load application metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await fetch("http://localhost:5008/getApplication");
      const data = await response.json();

      if (data.status === "ok" && data.data) {
        // Get the 5 most recent applications
        const sortedApplications = [...data.data].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);

        setRecentApplications(sortedApplications);
      }
    } catch (error) {
      console.error("Error fetching recent applications:", error);
    }
  };

  // Calculate percentage for progress bars
  const getPercentage = (value) => {
    return metrics.total > 0 ? Math.round((value / metrics.total) * 100) : 0;
  };

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
                <h2 className="mb-0">Dashboard Metrics</h2>
              </div>

              {/* Metrics Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <h1 className="display-4">{metrics.total}</h1>
                      <p className="lead">Total Applications</p>
                      <i className="bi bi-file-earmark-text" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <h1 className="display-4">{metrics.pending}</h1>
                      <p className="lead">Pending Review</p>
                      <i className="bi bi-hourglass-split" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <h1 className="display-4">{metrics.approved}</h1>
                      <p className="lead">Approved</p>
                      <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger text-white h-100">
                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                      <h1 className="display-4">{metrics.rejected}</h1>
                      <p className="lead">Rejected</p>
                      <i className="bi bi-x-circle" style={{ fontSize: '2rem' }}></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card bg-white shadow-sm">
                    <div className="card-header bg-light">
                      <h5 className="mb-0 text-primary">Application Status Distribution</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Pending ({metrics.pending})</span>
                          <span>{getPercentage(metrics.pending)}%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${getPercentage(metrics.pending)}%` }}
                            aria-valuenow={getPercentage(metrics.pending)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Approved ({metrics.approved})</span>
                          <span>{getPercentage(metrics.approved)}%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${getPercentage(metrics.approved)}%` }}
                            aria-valuenow={getPercentage(metrics.approved)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>Rejected ({metrics.rejected})</span>
                          <span>{getPercentage(metrics.rejected)}%</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{ width: `${getPercentage(metrics.rejected)}%` }}
                            aria-valuenow={getPercentage(metrics.rejected)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Applications */}
              <div className="row">
                <div className="col-md-12">
                  <div className="card bg-white shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 text-primary">Recent Applications</h5>
                      <a href="/adview" className="btn btn-sm btn-outline-primary">View All</a>
                    </div>
                    <div className="card-body">
                      {loading ? (
                        <div className="text-center p-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : recentApplications.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead className="table-primary">
                              <tr>
                                <th>Manufacturer</th>
                                <th>Drug Name</th>
                                <th>Status</th>
                                <th>Submission Date</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentApplications.map((app, index) => (
                                <tr key={index}>
                                  <td>{app.manufacturerName}</td>
                                  <td>{app.drugName}</td>
                                  <td>
                                    <span className={`badge ${app.status === 'approved' ? 'bg-success' : app.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                      {app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                  </td>
                                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                  <td>
                                    <a href={`/adhome/${encodeURIComponent(app.drugName)}`} className="btn btn-sm btn-primary">
                                      Review
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center p-3">
                          <p>No applications found</p>
                        </div>
                      )}
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
