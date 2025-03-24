import React, { Component, useEffect, useState } from "react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import "../App.css";

export default function AdminApplicationView({ userData }) {

  const [data, setData] = useState([]);
  const [drugDetails, setDrugDetails] = useState(null); // New state for drug details

  useEffect(() => {
    fetch("http://localhost:5000/getApplication", {
      method: "Get"
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userData");
        setData(data.data);
      });
  }, []);

  const getDrugDetails = async (drugName) => {
    try {
      const response = await fetch(`http://localhost:5000/getDrugDetails/${drugName}`);
      const data = await response.json();

      if (data.status === "ok") {
        const { drugDescription, commonSideEffect, storageTemperature } = data.data;

        // Set the drug details in state
        setDrugDetails({
          drugName: drugName,
          drugDescription: drugDescription,
          commonSideEffect: commonSideEffect,
          storageTemperature: storageTemperature
        });
      } else {
        console.log("Error:", data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };
  return (
    <div style={{ paddingTop: "64px" }} className="auth-wrapper">
      <div className="container" style={{ maxWidth: "800px", backgroundColor: "white" }}>
        <div className="row">
          <div className="col-12">
            <div style={{ paddingTop: "34px" }} className="table-container">
              <h3>List of Apllications</h3>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>Manufacturer Name</th>
                    <th style={{ textAlign: "center" }}>Drug Name</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>{item.manufacturerName}</td>
                      {/* Render drug name as a link/button to get drug details */}
                      <td>
                        <button
                          onClick={() => getDrugDetails(item.drugName)} className="btn-btn-three"
                          style={{ display: "block", margin: "0 auto", width: "200px", height: "50px" }}
                        >
                          {item.drugName}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              <br />
              {/* Render the drug details */}

              {drugDetails && (
                <div>
                  <h4>Drug Details for {drugDetails.drugName}</h4>
                  <table>
                    <tbody>
                      <tr>
                        <td>Drug Name:</td>
                        <td>{drugDetails.drugName}</td>
                      </tr>
                      <tr>
                        <td>Drug Description:</td>
                        <td>{drugDetails.drugDescription}</td>
                      </tr>
                      <tr>
                        <td>Common Side Effect:</td>
                        <td>{drugDetails.commonSideEffect}</td>
                      </tr>
                      <tr>
                        <td>Storage Temperature:</td>
                        <td>{drugDetails.storageTemperature}</td>
                      </tr>
                      <tr>
                        <td>Click here to get Clinical Trail Data </td>
                        <td>
                          <Link to={`/adhome/${encodeURIComponent(drugDetails.drugName)}`}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                          </Link>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              )}




              <br></br>
              <br></br>
              <button onClick={logOut} className="btn-btn-three">
                Log Out
              </button>
              <br></br>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

