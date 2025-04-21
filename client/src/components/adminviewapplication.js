import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./sidebar";

export default function AdminApplicationView({ userData }) {
  const [data, setData] = useState([]);
  const [drugDetails, setDrugDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5008/getApplication", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userData");
        setData(data.data);
      });
  }, []);

  const getDrugDetails = async (drugName) => {
    try {
      const response = await fetch(`http://localhost:5008/getDrugDetails/${drugName}`);
      const data = await response.json();

      if (data.status === "ok") {
        setDrugDetails({
          drugName,
          drugDescription: data.data.drugDescription,
          commonSideEffect: data.data.commonSideEffect,
          storageTemperature: data.data.storageTemperature
        });
        setShowModal(true);
      } else {
        console.log("Error:", data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 bg-white sidebar">
            <Sidebar/>
          </div>
          <div className="col-10 main-content p-0">
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mt-4 mb-4">
                <h2 className="mb-0">Applications</h2>
              </div>

              <div className="card shadow-sm mb-4" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                <div className="card-header bg-light" style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <h5 className="mb-0 text-dark">List of Applications</h5>
                </div>
                <div className="card-body p-0">

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
                      {data.map((item, index) => (
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
                            <div className="d-flex justify-content-center">
                              <div className="action-buttons-container">
                                <button
                                  onClick={() => getDrugDetails(item.drugName)}
                                  className="btn btn-info action-btn"
                                >
                                  <i className="bi bi-info-circle"></i>
                                  <span>Details</span>
                                </button>
                                <Link
                                  to={`/adhome/${encodeURIComponent(item.drugName)}`}
                                  className="btn btn-primary action-btn"
                                >
                                  <i className="bi bi-file-earmark-text"></i>
                                  <span>Review</span>
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Drug Details */}
      {showModal && drugDetails && (
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
            width: '80%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            <div className="modal-header bg-primary text-white" style={{
              padding: '15px 20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 className="modal-title mb-0">Drug Details for {drugDetails.drugName}</h5>
              <button
                onClick={closeModal}
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
              <div className="row">
                <div className="col-md-6">
                  <table className="table application-table">
                    <tbody>
                      <tr>
                        <th className="text-dark">Drug Name</th>
                        <td>{drugDetails.drugName}</td>
                      </tr>
                      <tr>
                        <th className="text-dark">Side Effects</th>
                        <td>{drugDetails.commonSideEffect}</td>
                      </tr>
                      <tr>
                        <th className="text-dark">Storage Temperature</th>
                        <td>{drugDetails.storageTemperature}°C</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <div className="p-4 border rounded shadow-sm" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h5 className="mb-3 text-primary">Description</h5>
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{drugDetails.drugDescription}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link
                  to={`/adhome/${encodeURIComponent(drugDetails.drugName)}`}
                  className="btn btn-primary btn-lg px-4 py-2"
                  style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}
                >
                  <i className="bi bi-file-earmark-text me-2"></i> Review Clinical Trial Data
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

