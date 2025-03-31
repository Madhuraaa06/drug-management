import React, { useState } from "react";
import axios from "axios";

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
      const response = await axios.post("http://localhost:5000/upload-clinicaltraildata", formDataObj);
      alert(response.data.message);
      setFormData(initialState); // Reset form
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
      <div className="user-home">
        <h2>Submit Clinical Trial Data</h2>
        <div className="row mb-3">
          <div className="col">
            <label>Manufacturer Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Manufacturer Name"
              value={formData.manufacturerName}
              onChange={(e) => setFormData({ ...formData, manufacturerName: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Drug Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Drug Name"
              value={formData.drugName}
              onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Storage Temperature</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Storage Temperature"
              value={formData.storageTemperature}
              onChange={(e) => setFormData({ ...formData, storageTemperature: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Drug Description</label>
          <textarea
            className="form-control"
            placeholder="Describe the drug"
            value={formData.drugDescription}
            onChange={(e) => setFormData({ ...formData, drugDescription: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Targeted Medical Condition</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Common Side Effect"
            value={formData.commonSideEffect}
            onChange={(e) => setFormData({ ...formData, commonSideEffect: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Upload Clinical Trial Data (CSV)</label>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>

        <button onClick={logOut} className="btn btn-danger me-2">
          Log Out
        </button>

        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}