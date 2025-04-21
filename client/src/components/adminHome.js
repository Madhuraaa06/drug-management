import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import "../App.css";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../config";
import { toast } from 'react-toastify';
import axios from 'axios';

export default function AdminHome({ userData }) {
  const { drugName } = useParams();
  const [clinicalTrialData, setClinicalTrialData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [walletAccount, setWalletAccount] = useState('');
  const [ethBalance, setEthBalance] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5008/getClinicalTrialData/${encodeURIComponent(drugName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setClinicalTrialData(data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [drugName]);

  // We don't have the clinicalTrialData.clinicalTrialData structure in our actual data
  // So we'll skip the validation for now
  useEffect(() => {
    if (clinicalTrialData) {
      // Just log the data structure for debugging
      console.log("Clinical Trial Data:", clinicalTrialData);
    }
  }, [clinicalTrialData]);

  const PopupWindow = ({ message, onClose }) => {
    return (
      <div className="popup-container">
        <div className="popup-content">
          <p>{message}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage("");
  };

  const approve = async () => {
    let provider = window.ethereum;
    if (typeof provider !== "undefined") {
      await provider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      setWalletAccount(account);
      toast.info(`Connected to account: ${account}`);
    } else {
      console.log("Non-ethereum browser detached. Please install Metamask");
    }
  };

  const handleGetBalance = async () => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error("Please install MetaMask to approve certificates");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setWalletAccount(account);

      // Get account balance
      const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
      const wei = parseInt(balance, 16);
      const eth = (wei / Math.pow(10, 18));
      setEthBalance({ wei, eth });

      // Proceed with transaction
      await handleSendTransaction(account);

      // Update status in database
      if (clinicalTrialData) {
        await updateDrugStatus(clinicalTrialData.drugName, true);
      }
    } catch (error) {
      console.error("Error in handleGetBalance:", error);
      toast.error("Failed to connect to MetaMask. Please make sure it's installed and unlocked.");
    }
  };

  const handleSendTransaction = async (account) => {
    try {
      if (!clinicalTrialData) {
        toast.error("No clinical trial data available");
        return;
      }

      const web3 = new Web3(window.ethereum);
      const contactList = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);

      // Extract data from clinicalTrialData
      const { manufacturerName, drugName, drugDescription, commonSideEffect } = clinicalTrialData;

      // Show confirmation to user
      toast.info(`Approving drug: ${drugName} from ${manufacturerName}`);

      // Send transaction to blockchain
      const result = await contactList.methods.createContact(
        manufacturerName,
        drugName,
        drugDescription,
        commonSideEffect
      ).send({
        from: account,
        gas: 3000000,
        gasPrice: web3.utils.toWei('10', 'gwei')
      });

      console.log("Transaction result:", result);
      toast.success(`Certificate approved! Transaction hash: ${result.transactionHash.substring(0, 10)}...`);

      // Redirect to application list after successful approval
      setTimeout(() => {
        window.location.href = "/adview";
      }, 2000);

      return result;
    } catch (error) {
      console.error("Error in handleSendTransaction:", error);
      toast.error(`Transaction failed: ${error.message}`);
    }
  };

  const updateDrugStatus = async (drugName, approved) => {
    try {
      const response = await fetch("http://localhost:5008/update-reject-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manufacturerName: clinicalTrialData.manufacturerName,
          drugName: drugName,
          updatereject: approved,
          updatereason: approved ? "Approved by admin" : "",
          rejectreason: approved ? "" : "Rejected by admin"
        }),
      });

      const data = await response.json();
      if (data.status === "ok") {
        toast.success(data.message);
        // Redirect to application list after successful database update
        setTimeout(() => {
          window.location.href = "/adview";
        }, 2000);
      } else {
        toast.error("Failed to update status: " + data.message);
      }
    } catch (error) {
      console.error("Error updating drug status:", error);
      toast.error("Failed to update status in database");
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "/sign-in";
  };

  const updateCertificate = () => {
    if (clinicalTrialData) {
      // Using Link to navigate with state
      const encodedDrugName = encodeURIComponent(clinicalTrialData.drugName);
      window.location.href = `/update-reject?drugName=${encodedDrugName}`; // Add drug name to URL
    }
  };

  const fetchCsvData = async () => {
    if (!clinicalTrialData || !clinicalTrialData.csvFilePath) {
      toast.error("CSV file path not available");
      return;
    }

    setCsvLoading(true);
    try {
      // Get the CSV file from the server
      const response = await axios.get(`http://localhost:5008/${clinicalTrialData.csvFilePath}`, {
        responseType: 'text'
      });

      // Parse CSV data
      const csvText = response.data;
      const lines = csvText.split('\n');

      // Extract headers (first line)
      const headers = lines[0].split(',');
      setCsvHeaders(headers);

      // Extract data (remaining lines)
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() !== '') {
          const values = lines[i].split(',');
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = values[j];
          }
          data.push(row);
        }
      }

      setCsvData(data);
      setShowCsvModal(true);
    } catch (error) {
      console.error("Error fetching CSV file:", error);
      toast.error("Failed to load CSV file. Please try again.");
    } finally {
      setCsvLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!clinicalTrialData || !clinicalTrialData.csvFilePath) {
      toast.error("CSV file path not available");
      return;
    }

    // Create a download link
    const link = document.createElement('a');
    link.href = `http://localhost:5008/${clinicalTrialData.csvFilePath}`;
    link.download = `${clinicalTrialData.drugName}_clinical_trial_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started");
  };

  return (
    <div className="admin-dashboard no-sidebar">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-12 main-content p-0">
            <div className="fixed-top-nav full-width">
              <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container-fluid">
                  <span className="navbar-brand">FOOD AND DRUG ADMINISTRATION</span>
                  <div className="d-flex">
                    <a href="/adwelcome" className="btn btn-outline-light me-2">
                      <i className="bi bi-house me-1"></i> Home
                    </a>
                    <a href="/adview" className="btn btn-outline-light me-2">
                      <i className="bi bi-list-check me-1"></i> Applications
                    </a>
                    <a href="#" onClick={logOut} className="btn btn-outline-light">
                      <i className="bi bi-box-arrow-left me-1"></i> Logout
                    </a>
                  </div>
                </div>
              </nav>
            </div>

            <div className="container-fluid pt-5 mt-4">
              <div className="card rounded shadow-sm mb-4 mx-auto">
                <div className="card-header bg-primary text-white text-center py-3">
                  <h5 className="mb-0">Clinical Trial Data for {drugName}</h5>
                </div>
                {clinicalTrialData ? (
                  <div className="card-body p-4">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card border mb-4">
                          <div className="card-header bg-light">
                            <h5 className="mb-0">Drug Information</h5>
                          </div>
                          <div className="card-body p-0">
                            <table className="table table-bordered mb-0">
                              <tbody>
                                <tr>
                                  <th style={{width: '40%'}}>Manufacturer Name</th>
                                  <td>{clinicalTrialData.manufacturerName}</td>
                                </tr>
                                <tr>
                                  <th>Drug Name</th>
                                  <td>{clinicalTrialData.drugName}</td>
                                </tr>
                                <tr>
                                  <th>Storage Temperature</th>
                                  <td>{clinicalTrialData.storageTemperature}°C</td>
                                </tr>
                                <tr>
                                  <th>Common Side Effects</th>
                                  <td>{clinicalTrialData.commonSideEffect}</td>
                                </tr>
                                <tr>
                                  <th>Status</th>
                                  <td>
                                    <span className={`badge ${clinicalTrialData.status === 'approved' ? 'bg-success' : clinicalTrialData.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                                      {clinicalTrialData.status === 'approved' ? 'Approved' : clinicalTrialData.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                                <tr>
                                  <th>Submission Date</th>
                                  <td>{new Date(clinicalTrialData.createdAt).toLocaleDateString()}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border mb-4">
                          <div className="card-header bg-light">
                            <h5 className="mb-0">Drug Description</h5>
                          </div>
                          <div className="card-body">
                            <p style={{ whiteSpace: 'pre-line' }}>{clinicalTrialData.drugDescription}</p>
                          </div>
                        </div>

                        <div className="card border">
                          <div className="card-header bg-light">
                            <h5 className="mb-0">Clinical Trial Data</h5>
                          </div>
                          <div className="card-body">
                            <p><strong>CSV File:</strong> {clinicalTrialData.csvFilePath}</p>
                            <div className="d-flex mb-3">
                              <button
                                onClick={fetchCsvData}
                                className="btn btn-primary me-2"
                                disabled={csvLoading}
                              >
                                <i className="bi bi-eye me-1"></i> View CSV Data
                              </button>
                              <button
                                onClick={downloadCsv}
                                className="btn btn-outline-primary"
                              >
                                <i className="bi bi-download me-1"></i> Download CSV
                              </button>
                            </div>
                            <p className="mb-0"><strong>Transaction Hash:</strong><br/>
                              <code className="text-break">{clinicalTrialData.transactionHash}</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                      <a href="/adview" className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left me-1"></i> Back
                      </a>

                      <div>
                        {clinicalTrialData.status !== 'approved' && clinicalTrialData.status !== 'rejected' ? (
                          <>
                            <button onClick={approve} className="btn btn-outline-primary me-2">
                              <i className="bi bi-wallet me-1"></i> Get Block Address
                            </button>
                            <button onClick={handleGetBalance} className="btn btn-success me-2">
                              <i className="bi bi-check-circle me-1"></i> Approve Certificate
                            </button>
                            <button onClick={updateCertificate} className="btn btn-warning">
                              <i className="bi bi-pencil-square me-1"></i> Update/Reject Certificate
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card-body">
                    <div className="alert alert-info">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border text-primary me-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Loading clinical trial data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPopup && <PopupWindow message={popupMessage} onClose={closePopup} />}

      {/* CSV Data Modal */}
      {showCsvModal && (
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
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header bg-primary text-white" style={{
              padding: '15px 20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h5 className="modal-title mb-0" style={{ fontWeight: 'bold' }}>Clinical Trial Data for {clinicalTrialData?.drugName}</h5>
              <button
                onClick={() => setShowCsvModal(false)}
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
            <div className="modal-body" style={{ padding: '20px', overflow: 'auto', flex: '1 1 auto' }}>
              {csvLoading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading CSV data...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr className="bg-primary text-white">
                          {csvHeaders.map((header, index) => (
                            <th key={index} style={{ position: 'sticky', top: 0, backgroundColor: '#0d6efd', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-light' : 'bg-white'}>
                            {csvHeaders.map((header, colIndex) => (
                              <td key={colIndex} style={{ padding: '10px', borderColor: '#dee2e6' }}>{row[header]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
