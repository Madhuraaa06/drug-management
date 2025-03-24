import React, { useState } from "react";
import axios from "axios";

export default function AdminUpdate({ userData }) {
  const [manufacturerName, setManufacturerName] = useState(localStorage.getItem("manufacturerName") || "");
  const [drugName, setDrugName] = useState(localStorage.getItem("drugName") || "");
  const [updateRejectOption, setUpdateRejectOption] = useState(false);
  const [updateReason, setUpdateReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleSubmit = async () => {
    const requestData = {
      manufacturerName,
      drugName,
      updatereject: updateRejectOption,
      updatereason: updateRejectOption ? updateReason : "",
      rejectreason: !updateRejectOption ? rejectReason : ""
    };

    try {
      await axios.post("http://localhost:5000/update-reject-certificate", requestData);
      alert("Data submitted successfully");
      console.log("Data submitted successfully");
      setManufacturerName(""); // Reset manufacturerName state
      setDrugName(""); // Reset drugName state
      setUpdateRejectOption(false); // Reset updateRejectOption state
      setUpdateReason(""); // Reset updateReason state
      setRejectReason(""); // Reset rejectReason state
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  }

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="auth-wrapper">
      <div className="user-home">
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

        <button onClick={logOut} className="btn btn-primary me-1">
          Log Out
        </button>
        <button onClick={handleSubmit} className="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  );
}
