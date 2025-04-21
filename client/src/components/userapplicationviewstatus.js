import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import UserSidebar from "./usersidebar";
import "../App.css";

export default function UserApplicationViewStatus({ userData }) {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState(""); // State for status message
  const [manufacturerName, setManufacturerName] = useState("");

  // Get user data on component mount
  useEffect(() => {
    fetch("http://localhost:5008/userData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.cname) {
          setManufacturerName(data.data.cname);
          // Automatically fetch applications for this manufacturer
          fetchApplicationsByManufacturer(data.data.cname);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [])

  const fetchApplicationsByManufacturer = async (manufacturer) => {
    try {
      setStatusMessage("Loading applications...");
      const response = await axios.get(`http://localhost:5008/application-status/${manufacturer}`);

      if (response.data.status === "ok" && response.data.applications.length > 0) {
        setSearchResults(response.data.applications);
        setStatusMessage(`Found ${response.data.applications.length} applications`);
      } else {
        setSearchResults([]);
        setStatusMessage("No applications found for your company.");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setStatusMessage("Error retrieving applications.");
    }
  };

  const handleSearch = async () => {
    try {
      if (!drugName.trim()) {
        toast.warning("Please enter a drug name to search");
        return;
      }

      const response = await axios.get("http://localhost:5008/applicationstatus", {
        params: { drugName }
      });

      if (response.data.status === "success") {
        setSearchResults([response.data.data]);
        toast.success("Data retrieved successfully");
        setStatusMessage("Data retrieved successfully.");
      } else {
        setSearchResults([]);
        toast.info("No results found for the specified drug name");
        setStatusMessage("No results found for the specified drug name.");
      }

      setDrugName(""); // Clear the search bar after performing the search
    } catch (error) {
      console.error("Error retrieving data:", error);
      toast.error("Error retrieving data");
      setStatusMessage("Error retrieving data.");
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 bg-white sidebar">
            <UserSidebar/>
          </div>
          <div className="col-10 main-content p-0">
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mt-4 mb-4">
                <h2 className="mb-0">My Applications</h2>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-8 mx-auto">
                      <div className="input-group">
                        <input
                          type="text"
                          value={drugName}
                          onChange={(e) => setDrugName(e.target.value)}
                          className="form-control"
                          placeholder="Enter drug name to search"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleSearch}
                        >
                          <i className="bi bi-search me-2"></i>Search
                        </button>
                      </div>
                    </div>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-primary">
                          <tr>
                            <th>Manufacturer</th>
                            <th>Drug Name</th>
                            <th>Storage Temp</th>
                            <th>Description</th>
                            <th>Side Effects</th>
                            <th>Transaction Hash</th>
                            <th>Status</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((result, index) => (
                            <tr key={index}>
                              <td>{result.manufacturerName}</td>
                              <td>{result.drugName}</td>
                              <td>{result.storageTemperature}</td>
                              <td>{result.drugDescription?.substring(0, 30)}...</td>
                              <td>{result.commonSideEffect?.substring(0, 30)}...</td>
                              <td>
                                {result.transactionHash ? (
                                  <span className="text-success">{result.transactionHash.substring(0, 10)}...</span>
                                ) : (
                                  <span className="text-muted">Not available</span>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${result.status === 'approved' ? 'bg-success' : result.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                  {result.status || 'pending'}
                                </span>
                              </td>
                              <td>{new Date(result.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info text-center">
                      <i className="bi bi-info-circle me-2"></i>
                      {statusMessage || "No applications found. Please submit a clinical trial application first."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
