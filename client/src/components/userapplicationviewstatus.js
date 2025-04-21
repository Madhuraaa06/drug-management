import React, { useState, useEffect } from "react";
import axios from "axios";
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
        alert("Please enter a drug name to search");
        return;
      }

      const response = await axios.get("http://localhost:5008/applicationstatus", {
        params: { drugName }
      });

      if (response.data.status === "success") {
        setSearchResults([response.data.data]);
        setStatusMessage("Data retrieved successfully.");
      } else {
        setSearchResults([]);
        setStatusMessage("No results found for the specified drug name.");
      }

      setDrugName(""); // Clear the search bar after performing the search
    } catch (error) {
      console.error("Error retrieving data:", error);
      setStatusMessage("Error retrieving data.");
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div style={{ paddingTop: '100px' }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: '10px' }} className="table-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <input
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="form-control"
              placeholder="Enter drug name"
            />
            <button className="btn btn-primary" onClick={handleSearch} style={{ marginLeft: '10px', minWidth: '150px' }}>
              Search Your Drug By Name
            </button>
          </div>

          {statusMessage && <p>{statusMessage}</p>} {/* Display status message */}

          <h3>Your Drug Applications</h3>

          {searchResults.length > 0 ? (
            <div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Manufacturer Name</th>
                    <th>Drug Name</th>
                    <th>Storage Temperature</th>
                    <th>Drug Description</th>
                    <th>Common Side Effects</th>
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
                      <td>{result.drugDescription}</td>
                      <td>{result.commonSideEffect}</td>
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
            <div className="alert alert-info">
              {statusMessage || "No applications found. Please submit a clinical trial application first."}
            </div>
          )}
          <button onClick={logOut} className="btn btn-primary me-1">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
