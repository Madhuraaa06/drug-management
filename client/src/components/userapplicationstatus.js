import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../config";
import "../App.css";
import { Link } from "react-router-dom";

export default function UserApplicationStatus() {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [manufacturerName, setManufacturerName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user data and recent applications when component mounts
  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5008/userData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data && data.data.cname) {
            setManufacturerName(data.data.cname);
            fetchRecentApplications(data.data.cname);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  // Fetch recent applications for the current manufacturer
  const fetchRecentApplications = async (name) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5008/application-status/${encodeURIComponent(name)}`);
      const data = await response.json();

      if (data.status === "ok" && data.applications) {
        setRecentApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching recent applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      console.log("🔍 Starting drug search...");
      const provider = window.ethereum;
      if (!provider) {
        console.log("❌ Non-Ethereum browser detected. Please install MetaMask.");
        return;
      }
      await provider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(provider);
      console.log("✅ Web3 initialized.");

      const latestBlockNumber = await web3.eth.getBlockNumber();
      console.log(`📌 Latest Block Number: ${latestBlockNumber}`);

      if (latestBlockNumber < 19) {
        console.log("⚠️ No transactions available from block 19 onward.");
        return;
      }

      const allTransactionHashes = [];
      for (let i = latestBlockNumber; i >= 19; i--) {
        const block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
          block.transactions.forEach((tx) => {
            allTransactionHashes.push(tx.hash);
          });
        }
      }

      if (!allTransactionHashes.length) {
        console.log("⚠️ No transactions found.");
        return;
      }

      const results = [];
      for (let hash of allTransactionHashes) {
        console.log(`🔎 Fetching transaction details for hash: ${hash}...`);
        const tx = await web3.eth.getTransaction(hash);
        if (!tx || !tx.input) continue;

        try {
          const decodedData = web3.eth.abi.decodeParameters(
            ["string", "string", "string", "string"],
            tx.input.slice(10)
          );
          const extractedDrugName = decodedData[1];
          if (extractedDrugName === drugName) {
            console.log(`✅ Match found for drug: ${drugName}`);
            const block = await web3.eth.getBlock(tx.blockNumber);
            results.push({
              drugName: extractedDrugName,
              blockHash: block.hash,
              blockNumber: block.number,
              transactionHash: hash,
            });
          }
        } catch (decodeError) {
          console.error(`⚠️ Error decoding transaction ${hash}:`, decodeError);
        }
      }
      console.log("🔹 Search completed. Total matches found:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("❌ Error in handleSearch:", error);
    }
  };

  const handleDownloadCertificate = (result) => {
    const certificateContent = `Drug Certification\n\nDrug Name: ${result.drugName}\nBlock Number: ${result.blockNumber}\nTransaction Hash: ${result.transactionHash}\nBlock Hash: ${result.blockHash}\n`;
    const blob = new Blob([certificateContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${result.drugName}_certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      {/* Back button */}
      <div className="mb-4">
        <Link to="/userDetails" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </Link>
      </div>

      <div className="card p-4 shadow-lg mb-4">
        <h2 className="text-center">Drug Certification Search</h2>
        <div className="input-group mb-3">
          <input
            type="text"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            className="form-control"
            placeholder="Enter drug name"
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {searchResults.length > 0 ? (
          <div className="alert alert-success text-center">
            🎉 Your Certificate has been Approved!
          </div>
        ) : (
          drugName !== "" && (
            <div className="alert alert-warning text-center">
              ⚠️ Your Certificate is not approved yet. Check for updates.
            </div>
          )
        )}
      </div>

      {/* Recent Applications Section */}
      <div className="card p-4 shadow-lg">
        <h2 className="text-center mb-4">Your Recent Applications</h2>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading your applications...</p>
          </div>
        ) : recentApplications.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-primary">
                <tr>
                  <th>Drug Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app, index) => (
                  <tr key={index}>
                    <td>{app.drugName}</td>
                    <td>{app.drugDescription?.substring(0, 50)}...</td>
                    <td>
                      <span className={`badge ${app.status === 'approved' ? 'bg-success' : app.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                        {app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setDrugName(app.drugName)}
                      >
                        Check Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="alert alert-info text-center">
            <i className="bi bi-info-circle me-2"></i>
            You haven't submitted any applications yet.
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="row mt-4">
            {searchResults.map((result, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card shadow-sm p-3">
                  <h5 className="text-primary">{result.drugName}</h5>
                  <p><strong>Block Number:</strong> {result.blockNumber}</p>
                  <p><strong>Transaction Hash:</strong> {result.transactionHash.substring(0, 10)}...</p>
                  <p><strong>Block Hash:</strong> {result.blockHash.substring(0, 10)}...</p>
                  <button
                    className="btn btn-success"
                    onClick={() => handleDownloadCertificate(result)}
                  >
                    📄 Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
