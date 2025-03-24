import React, { useEffect, useState } from "react";
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      file: selectedFile,
    }));
  };

  const handleSubmit = async () => {
    // Create a FormData object to send the text inputs and the file
    const { file, ...data } = formData;
    const formDataObj = new FormData();
    formDataObj.append("file", file);
    for (const key in data) {
      formDataObj.append(key, data[key]);
    }

    try {
      // Make an API request to upload the CSV file and submit the data
      await axios.post("http://localhost:5000/upload-clinicaltraildata", formDataObj);

      // File and data submitted successfully
      alert("Form successfully submitted");
      console.log("CSV file and data submitted successfully");

      setFormData(initialState); // Reset form data to initial values
    } catch (error) {
      // Handle error
      console.error("Error uploading CSV file and submitting data:", error);
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  return (
    <div className="auth-wrapper">
      <div className="user-home">
        <div className="mb-3">
          <div class="row">
            <div class="col">
              <label>Manufacturer name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Manufacturer Name"
                value={formData.manufacturerName}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    manufacturerName: e.target.value,
                  }))
                }
              />
            </div>
            <div class="col">
              <label>Drug name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Drug Name"
                value={formData.drugName}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    drugName: e.target.value,
                  }))
                }
              />
            </div>
            <div class="col">
              <label>Storage Temperature</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Appropriate Storage Temperature"
                value={formData.storageTemperature}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    storageTemperature: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label>Drug Description</label>
          <input
            type="text"
            className="form-control"
            placeholder="Describe what it cures"
            value={formData.drugDescription}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                drugDescription: e.target.value,
              }))
            }
          />
        </div>
        <div className="mb-3">
          <label>Common side effect</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Common Side Effect"
            value={formData.commonSideEffect}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                commonSideEffect: e.target.value,
              }))
            }
          />
        </div>
        <div class="mb-3">
          <h6>Upload clinical trail data</h6>
          <input type={"file"} accept={".csv"} onChange={handleFileChange} />
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
