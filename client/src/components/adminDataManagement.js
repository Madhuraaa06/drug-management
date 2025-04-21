import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./sidebar";

export default function AdminDataManagement({ userData }) {
  const [applicationCount, setApplicationCount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch application count on component mount
  useEffect(() => {
    fetchApplicationCount();
  }, []);

  const fetchApplicationCount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5008/getApplication", { method: "GET" });
      const data = await response.json();

      if (data.status === "ok") {
        setApplications(data.data);
        setApplicationCount(data.data.length);
      }
    } catch (error) {
      console.error("Error fetching application data:", error);
      toast.error("Failed to fetch application data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    setIsLoading(true);
    try {
      // Get admin token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in as an admin to perform this action");
        setIsLoading(false);
        return;
      }

      // Use query parameters for the token
      const url = new URL("http://localhost:5008/delete-all-applications");
      url.searchParams.append("adminToken", token);

      // Send the request
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "adminToken": token
        }
      });

      const data = await response.json();

      if (data.status === "ok") {
        toast.success(data.message);
        // Update application count
        setApplicationCount(0);
        setShowConfirmModal(false);
      } else {
        toast.error(data.message || "Failed to delete applications");
      }
    } catch (error) {
      console.error("Error deleting applications:", error);
      toast.error("An error occurred while deleting applications");
    } finally {
      setIsLoading(false);
    }
  };


  const confirmDeleteSingle = (application) => {
    setApplicationToDelete(application);
    setShowDeleteModal(true);
  };

  const cancelDeleteSingle = () => {
    setApplicationToDelete(null);
    setShowDeleteModal(false);
  };

  const deleteSingleApplication = async () => {
    if (!applicationToDelete) return;

    setIsDeleting(true);
    try {
      // Get admin token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You must be logged in as an admin to perform this action");
        setIsDeleting(false);
        return;
      }


      // Use query parameters for all data including the token
      const url = new URL("http://localhost:5008/delete-application");
      url.searchParams.append("drugName", applicationToDelete.drugName);
      url.searchParams.append("manufacturerName", applicationToDelete.manufacturerName);
      url.searchParams.append("adminToken", token);

      // Send the request
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "adminToken": token
        }
      });

      const result = await response.json();

      if (result.status === "ok") {
        toast.success(result.message);
        // Update the applications state by removing the deleted application
        setApplications(applications.filter(app =>
          !(app.drugName === applicationToDelete.drugName &&
            app.manufacturerName === applicationToDelete.manufacturerName)
        ));
        setApplicationCount(prev => prev - 1);
        setShowDeleteModal(false);
        setApplicationToDelete(null);
      } else {
        toast.error(result.message || "Failed to delete application");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("An error occurred while deleting the application");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 bg-white sidebar">
            <Sidebar />
          </div>
          <div className="col-10 main-content p-0">
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mt-4 mb-4">
                <h2 className="mb-0">Data Management</h2>
              </div>

              <div className="card shadow-sm mb-4" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <div className="card-header bg-light" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <h5 className="mb-0 text-dark">Database Operations</h5>
                </div>
                <div className="card-body p-4">
                  <div className="alert alert-info mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                      <div>
                        <h5 className="mb-1">Important Information</h5>
                        <p className="mb-0">
                          This section allows you to manage the application database.
                          Be careful when performing delete operations as they cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card border h-100">
                        <div className="card-header bg-light">
                          <h5 className="mb-0">Current Status</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Total Applications:</strong> {applicationCount}</p>
                          <button
                            className="btn btn-outline-primary"
                            onClick={fetchApplicationCount}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Loading...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-clockwise me-2"></i> Refresh Data
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border h-100">
                        <div className="card-header bg-danger text-white">
                          <h5 className="mb-0">Danger Zone</h5>
                        </div>
                        <div className="card-body">
                          <p className="text-danger">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Warning:</strong> The following actions are irreversible.
                          </p>
                          <button
                            className="btn btn-danger"
                            onClick={() => setShowConfirmModal(true)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-trash me-2"></i> Delete All Applications
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Applications List */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0">Applications List</h5>
                    </div>
                    <div className="card-body p-0">
                      {isLoading && applications.length === 0 ? (
                        <div className="text-center p-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-3">Loading applications...</p>
                        </div>
                      ) : applications.length === 0 ? (
                        <div className="alert alert-info m-3">
                          <i className="bi bi-info-circle me-2"></i>
                          No applications found in the database.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table application-table">
                            <thead>
                              <tr>
                                <th className="text-center">Manufacturer Name</th>
                                <th className="text-center">Drug Name</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Submission Date</th>
                                <th className="text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {applications.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-light-gray' : 'bg-white'}>
                                  <td className="text-center">{item.manufacturerName}</td>
                                  <td className="text-center">{item.drugName}</td>
                                  <td className="text-center">
                                    <span className={`badge ${item.status === 'approved' ? 'bg-success' : item.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                      {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="text-center">{new Date(item.createdAt).toLocaleDateString()}</td>
                                  <td className="text-center">
                                    <button
                                      onClick={() => confirmDeleteSingle(item)}
                                      className="btn btn-danger btn-sm"
                                      disabled={isDeleting}
                                    >
                                      <i className="bi bi-trash me-1"></i> Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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

      {/* Delete All Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div className="modal-header bg-danger text-white" style={{
              padding: '15px 20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 className="modal-title mb-0">Confirm Deletion</h5>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-close btn-close-white"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                  color: 'white'
                }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Warning:</strong> You are about to delete ALL drug applications from the database. This action cannot be undone.
              </div>
              <p>Are you sure you want to proceed?</p>
              <p><strong>Total applications to be deleted:</strong> {applicationCount}</p>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary px-4 py-2"
                style={{ minWidth: '120px', borderRadius: '6px' }}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-2"></i> Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="btn btn-danger px-4 py-2"
                style={{ minWidth: '140px', borderRadius: '6px' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i> Delete All Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Application Confirmation Modal */}
      {showDeleteModal && applicationToDelete && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div className="modal-header bg-danger text-white" style={{
              padding: '15px 20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 className="modal-title mb-0">Confirm Deletion</h5>
              <button
                onClick={cancelDeleteSingle}
                className="btn-close btn-close-white"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0',
                  color: 'white'
                }}
                disabled={isDeleting}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Warning:</strong> You are about to delete this application. This action cannot be undone.
              </div>
              <p>Are you sure you want to delete the following application?</p>
              <table className="table table-bordered mt-3">
                <tbody>
                  <tr>
                    <th style={{width: '40%'}}>Drug Name</th>
                    <td>{applicationToDelete.drugName}</td>
                  </tr>
                  <tr>
                    <th>Manufacturer</th>
                    <td>{applicationToDelete.manufacturerName}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className={`badge ${applicationToDelete.status === 'approved' ? 'bg-success' : applicationToDelete.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                        {applicationToDelete.status === 'approved' ? 'Approved' : applicationToDelete.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer d-flex justify-content-between m-3">
              <button
                onClick={cancelDeleteSingle}
                className="btn btn-secondary px-4 py-2"
                style={{ minWidth: '120px', borderRadius: '6px' }}
                disabled={isDeleting}
              >
                <i className="bi bi-x-circle me-2"></i> Cancel
              </button>
              <button
                onClick={deleteSingleApplication}
                className="btn btn-danger px-4 py-2 "
                style={{ minWidth: '120px', borderRadius: '6px' }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
