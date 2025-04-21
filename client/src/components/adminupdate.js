import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

export default function AdminUpdate({ userData }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const drugNameFromUrl = queryParams.get("drugName");

  const [manufacturerName, setManufacturerName] = useState("");
  const [drugName, setDrugName] = useState(drugNameFromUrl || "");
  const [updateRejectOption, setUpdateRejectOption] = useState(false);
  const [updateReason, setUpdateReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch drug details when component mounts
  useEffect(() => {
    if (drugNameFromUrl) {
      fetchDrugDetails(drugNameFromUrl);
    } else {
      setLoading(false);
    }
  }, [drugNameFromUrl]);

  const fetchDrugDetails = async (drugName) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5008/getClinicalTrialData/${encodeURIComponent(drugName)}`);
      if (response.data.status === "ok" && response.data.data) {
        const drugData = response.data.data;
        setManufacturerName(drugData.manufacturerName || "");
        setDrugName(drugData.drugName || "");

        // If the drug is already approved or rejected, redirect to the applications list
        if (drugData.status === 'approved' || drugData.status === 'rejected') {
          toast.info(`This application has already been ${drugData.status}. Redirecting to applications list.`);
          setTimeout(() => {
            window.location.href = "/adview";
          }, 2000);
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching drug details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate input
    if (updateRejectOption && !updateReason.trim()) {
      toast.error("Please provide a reason for requesting updates");
      return;
    }

    if (!updateRejectOption && !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    const requestData = {
      manufacturerName,
      drugName,
      updatereject: updateRejectOption,
      updatereason: updateRejectOption ? updateReason : "",
      rejectreason: !updateRejectOption ? rejectReason : ""
    };

    try {
      const response = await axios.post("http://localhost:5008/update-reject-certificate", requestData);

      if (response.data.status === "ok") {
        const action = updateRejectOption ? "Update requested" : "Application rejected";
        toast.success(`${action} successfully. Redirecting to applications list.`);

        // Redirect to the applications list after a short delay
        setTimeout(() => {
          window.location.href = "/adview";
        }, 2000);
      } else {
        toast.error(`Error: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  }

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="auth-wrapper">
      <div className="user-home">


        {loading ? (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading drug details...</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div className="row">
                <div className="col">
                  <label>Manufacturer name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Manufacturer Name"
                    value={manufacturerName}
                    readOnly
                  />
                </div>
                <div className="col">
                  <label>Drug name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Drug Name"
                    value={drugName}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="updateRejectOption"
                  id="updateOption"
                  value={true}
                  checked={updateRejectOption === true}
                  onChange={() => setUpdateRejectOption(true)}
                />
                <label className="form-check-label">Update</label>
              </div>
              {updateRejectOption && (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe what additional data to be submitted"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                />
              )}
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="updateRejectOption"
                  id="rejectOption"
                  value={false}
                  checked={updateRejectOption === false}
                  onChange={() => setUpdateRejectOption(false)}
                />
                <label className="form-check-label">Reject</label>
              </div>
              {!updateRejectOption && (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Describe the reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              )}
            </div>

            <div className="d-flex justify-content-between">
              <Link to={`/adhome/${encodeURIComponent(drugName)}`} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i> Back
              </Link>
              <button onClick={handleSubmit} className="btn btn-primary">
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
