import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

export default function UserHome({ userData }) {
  const initialState = {
    file: null,
    manufacturerName: "",
    drugName: "",
    storageTemperature: "",
    drugDescription: "",
    commonSideEffect: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  // Fetch user data and set manufacturer name when component mounts
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
            setFormData(prevData => ({
              ...prevData,
              manufacturerName: data.data.cname
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      file: selectedFile,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.file || !formData.manufacturerName || !formData.drugName) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5008/upload-clinicaltraildata", formDataObj);

      // Show success message instead of alert
      setSuccessMessage(response.data.message);

      // Keep manufacturer name but reset other fields
      const manufacturerName = formData.manufacturerName;
      setFormData({
        ...initialState,
        manufacturerName
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="auth-wrapper">
      <div className="user-home shadow-lg">
        {/* Header with back button */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary">Submit Clinical Trial Data</h2>
          <Link to="/userDetails" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </Link>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong> {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
          </div>
        )}

        {/* Form card */}
        <div className="card p-4 mb-4 bg-light">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Manufacturer Name</label>
              <input
                type="text"
                className="form-control bg-light"
                value={formData.manufacturerName}
                readOnly
                disabled
              />
              <small className="text-muted">Auto-filled from your profile</small>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Drug Name*</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Drug Name"
                value={formData.drugName}
                onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Storage Temperature*</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Storage Temperature"
                value={formData.storageTemperature}
                onChange={(e) => setFormData({ ...formData, storageTemperature: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Drug Description*</label>
            <textarea
              className="form-control"
              placeholder="Describe the drug in detail"
              value={formData.drugDescription}
              onChange={(e) => setFormData({ ...formData, drugDescription: e.target.value })}
              rows="4"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Targeted Medical Condition*</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Common Side Effect"
              value={formData.commonSideEffect}
              onChange={(e) => setFormData({ ...formData, commonSideEffect: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Upload Clinical Trial Data (CSV)*</label>
            <input
              type="file"
              className="form-control"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
            <small className="text-muted">Please upload a CSV file with clinical trial data</small>
          </div>
        </div>

        {/* Action buttons */}
        <div className="d-flex justify-content-end">
          <div>
            <button onClick={logOut} className="btn btn-outline-danger me-2">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </button>

            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload"></i> Submit Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}