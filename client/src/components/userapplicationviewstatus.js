import React, { useState } from "react";
import axios from "axios";
import "../App.css";

export default function UserApplicationViewStatus({ userData }) {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState(""); // State for status message

  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:5000/applicationstatus", {
        params: { drugName }
      });

      if (response.data.status === "success") {
        setSearchResults(response.data.data);
        console.log(searchResults);
        setStatusMessage("Data retrieved successfully."); // Set success message
      } else {
        setSearchResults([]); // Clear previous results if not found
        setStatusMessage("No results found for the specified drug name."); // Set not found message
      }
      
      setDrugName(""); // Clear the search bar after performing the search
    } catch (error) {
      console.error("Error retrieving data:", error);
      setStatusMessage("Error retrieving data."); // Set error message
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

          {searchResults.length > 0 ? (
            <div>
              <table className="table">
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
                      <td>{result.transactionHash}</td>
                      <td>{result.status}</td>
                      <td>{new Date(result.createdAt).toLocaleString()}</td> {/* Format date */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            searchResults.length === 0 && !statusMessage.includes("Error") && (
              <p>No results found.</p>
            )
          )}
          <button onClick={logOut} className="btn btn-primary me-1">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
