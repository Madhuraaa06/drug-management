import React, { useState } from "react";
import axios from "axios";
import "../App.css";

export default function UserApplicationViewStatus({ userData }) {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:5000/applicationstatus", {
        params: { drugName }
      });
      setSearchResults(response.data);
      setDrugName(""); // Clear the search bar after performing the search
    } catch (error) {
      console.error("Error retrieving data:", error);
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

          {searchResults.length > 0 ? (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Manufacturer Name</th>
                    <th>Drug Name</th>
                    <th>Update Required</th>
                    <th>Required Update for next Submission</th>
                    <th>Reject Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr key={index}>
                      <td>{result.manufacturerName}</td>
                      <td>{result.drugName}</td>
                      <td>{result.updatereject ? "True" : "False"}</td>
                      <td>{result.updatereason}</td>
                      <td>{result.rejectreason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No results found.</p>
          )}
          <button onClick={logOut} className="btn btn-primary me-1">
          Log Out
        </button>
        </div>
      </div>
    </div>
  );
}
