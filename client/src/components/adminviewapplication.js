import React, { useEffect, useState } from "react";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function AdminApplicationView({ userData }) {
  const [data, setData] = useState([]);
  const [drugDetails, setDrugDetails] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/getApplication", { method: "GET" })
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
        setDrugDetails({
          drugName,
          drugDescription: data.data.drugDescription,
          commonSideEffect: data.data.commonSideEffect,
          storageTemperature: data.data.storageTemperature
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
    <div style={styles.authWrapper}>
      <div style={styles.container}>
        <h3 style={styles.heading}>List of Applications</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Manufacturer Name</th>
              <th style={styles.tableHeader}>Drug Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} style={styles.tableRow}>
                <td style={styles.tableCellBold}>{item.manufacturerName}</td>
                <td>
                  <button
                    onClick={() => getDrugDetails(item.drugName)}
                    style={styles.button}
                  >
                    {item.drugName}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {drugDetails && (
          <div style={styles.detailsContainer}>
            <h4>Drug Details for {drugDetails.drugName}</h4>
            <table>
              <tbody>
                <tr><td style={styles.detailLabel}>Drug Name:</td><td>{drugDetails.drugName}</td></tr>
                <tr><td style={styles.detailLabel}>Description:</td><td>{drugDetails.drugDescription}</td></tr>
                <tr><td style={styles.detailLabel}>Side Effects:</td><td>{drugDetails.commonSideEffect}</td></tr>
                <tr><td style={styles.detailLabel}>Storage Temp:</td><td>{drugDetails.storageTemperature}</td></tr>
                <tr>
                  <td style={styles.detailLabel}>Clinical Trial Data:</td>
                  <td>
                    <Link to={`/adhome/${encodeURIComponent(drugDetails.drugName)}`}>
                      <FontAwesomeIcon icon={faPaperPlane} style={styles.icon} />
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <button onClick={logOut} style={styles.logoutButton}>Log Out</button>
      </div>
    </div>
  );
}

const styles = {
  authWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f4f4"
  },
  container: {
    maxWidth: "900px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
  },
  heading: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  },
  tableHeader: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "12px",
    textAlign: "center"
  },
  tableRow: {
    backgroundColor: "#f9f9f9"
  },
  tableCellBold: {
    textAlign: "center",
    fontWeight: "bold",
    padding: "10px"
  },
  button: {
    display: "block",
    margin: "0 auto",
    width: "200px",
    height: "40px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.3s"
  },
  buttonHover: {
    backgroundColor: "#0056b3"
  },
  detailsContainer: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9"
  },
  detailLabel: {
    fontWeight: "bold",
    paddingRight: "10px"
  },
  icon: {
    color: "#007bff",
    fontSize: "16px"
  },
  logoutButton: {
    display: "block",
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.3s"
  }
};
