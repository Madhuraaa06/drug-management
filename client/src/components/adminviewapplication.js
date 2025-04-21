import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function AdminApplicationView({ userData }) {
  const [data, setData] = useState([]);
  const [drugDetails, setDrugDetails] = useState(null);

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
      } else {
        console.log("Error:", data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="container" style={{ paddingTop: '100px' }}>
      <div className="card p-4 shadow-lg">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">List of Applications</h3>
          <div>
            <Link to="/adwelcome" className="btn btn-outline-secondary me-2">
              <i className="bi bi-arrow-left me-1"></i> Back
            </Link>
            <button onClick={logOut} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-left me-1"></i> Log Out
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-primary">
              <tr>
                <th>Manufacturer Name</th>
                <th>Drug Name</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.manufacturerName}</td>
                  <td>{item.drugName}</td>
                  <td>
                    <span className={`badge ${item.status === 'approved' ? 'bg-success' : item.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                      {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => getDrugDetails(item.drugName)}
                      className="btn btn-sm btn-info me-2"
                    >
                      <i className="bi bi-info-circle me-1"></i> Details
                    </button>
                    <Link
                      to={`/adhome/${encodeURIComponent(item.drugName)}`}
                      className="btn btn-sm btn-primary"
                    >
                      <i className="bi bi-file-earmark-text me-1"></i> Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {drugDetails && (
          <div className="card mt-4 p-3 bg-light">
            <h4 className="card-title">Drug Details for {drugDetails.drugName}</h4>
            <div className="row">
              <div className="col-md-6">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Drug Name</th>
                      <td>{drugDetails.drugName}</td>
                    </tr>
                    <tr>
                      <th>Side Effects</th>
                      <td>{drugDetails.commonSideEffect}</td>
                    </tr>
                    <tr>
                      <th>Storage Temperature</th>
                      <td>{drugDetails.storageTemperature}°C</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded">
                  <h5>Description</h5>
                  <p style={{ whiteSpace: 'pre-line' }}>{drugDetails.drugDescription}</p>
                </div>
                <div className="mt-3 text-center">
                  <Link
                    to={`/adhome/${encodeURIComponent(drugDetails.drugName)}`}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-file-earmark-text me-1"></i> Review Clinical Trial Data
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

