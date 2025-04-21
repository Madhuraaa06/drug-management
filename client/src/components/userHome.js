import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import UserSidebar from "./usersidebar";
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
      toast.error("Please fill in all fields and upload a file.");
      return;
    }

    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    try {
      setLoading(true);
      toast.info("Submitting your application...");

      const response = await axios.post("http://localhost:5008/upload-clinicaltraildata", formDataObj);

      // Show success message with toast
      toast.success(response.data.message);

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

      // No need to scroll to top with toast notifications
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-dashboard">
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-2 p-0">
            <UserSidebar/>
          </div>
          <div className="col-10 main-content p-0">
            <div className="container-fluid fixed-content">
              <div className="bg-primary text-white text-center py-3 mt-4 mb-4">
                <h2 className="mb-0">Submit Clinical Trial Data</h2>
              </div>

              {/* Form card */}
              <div className="card shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="row mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Manufacturer Name</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={formData.manufacturerName}
                        readOnly
                        disabled
                      />
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

                  <div className="mb-4">
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

                  <div className="mb-4">
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

                  {/* Action buttons */}
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      onClick={handleSubmit}
                      className="btn btn-primary px-5 py-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-2"></i> Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}