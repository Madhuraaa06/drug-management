import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, Link } from "react-router-dom";
import "../App.css";

const CONTACT_ABI = require('../../src/config');
const CONTACT_ADDRESS = require('../../src/config');

export default function AdminHome({ userData }) {
  const { drugName } = useParams();
  const [clinicalTrialData, setClinicalTrialData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [walletAccount, setWalletAccount] = useState('');
  const [ethBalance, setEthBalance] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/getClinicalTrialData/${encodeURIComponent(drugName)}`)
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

  useEffect(() => {
    if (clinicalTrialData) {
      const totalPeopleTested = clinicalTrialData.clinicalTrialData.reduce((total, item) => {
        return total + item.numberOfPeopleTested;
      }, 0);

      if (totalPeopleTested < 100) {
        setPopupMessage("Total number of people tested should be greater than 100.");
        setShowPopup(true);
      }

      const hasPlusSymbolInAge = clinicalTrialData.clinicalTrialData.some((item) => item.age.includes("+"));

      if (hasPlusSymbolInAge) {
        setPopupMessage("Age range defined is not proper. Please reject it.");
        setShowPopup(true);
      }
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
      alert(account);
    } else {
      console.log("Non-ethereum browser detached. Please install Metamask");
    }
  };

  const handleGetBalance = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });

    const wei = parseInt(balance, 16);
    const eth = (wei / Math.pow(10, 18)); // parse to ETH

    setEthBalance({ wei, eth });
    await handleSendTransaction(walletAccount, "0x0988301d9f3d9074acD2b68F55e4d688336eD6E3", 2);
  };

  const handleSendTransaction = async (sender, receiver, amount) => {
    try {
      const provider = window.ethereum;
      if (typeof provider !== "undefined") {
        await provider.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setWalletAccount(account);

        const contactList = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
        const COUNTER = await contactList.methods.count().call();

        if (clinicalTrialData) {
          const { manufacturerName, drugName, composition, targetedMedicalCondition } = clinicalTrialData;

          await contactList.methods.createContact(manufacturerName, drugName, composition, targetedMedicalCondition)
            .send({
              from: walletAccount,
              gas: 3000000,
              gasPrice: web3.utils.toWei('10', 'gwei')
            })
            .then((res) => console.log("res", res))
            .catch((e) => console.log(e.message));
        } else {
          console.log("clinicalTrialData is undefined");
        }
      } else {
        console.log("Non-ethereum browser detached. Please install Metamask");
      }
    } catch (error) {
      console.error("Error in handleSendTransaction:", error);
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
      // Alternatively, if using Link component:
      // return (
      //   <Link 
      //     to={{
      //       pathname: '/update-reject',
      //       state: { clinicalTrialData } // Pass the clinicalTrialData state
      //     }}
      //   >
      //     Update/Reject Certificate
      //   </Link>
      // );
    }
  };

  return (
    <div style={{ paddingTop: '600px' }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: '10px' }} className="table-container">
          <h1>Clinical Trial Data for {drugName}</h1>
          {clinicalTrialData ? (
            <table>
              <thead>
                <tr>
                  <th>Manufacturer Name</th>
                  <th>Drug Name</th>
                  <th>Composition</th>
                  <th>Targeted Medical Condition</th>
                  <th>Number of People Tested</th>
                  <th>Age</th>
                  <th>Results</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{clinicalTrialData.manufacturerName}</td>
                  <td>{clinicalTrialData.drugName}</td>
                  <td>{clinicalTrialData.composition}</td>
                  <td>{clinicalTrialData.targetedMedicalCondition}</td>
                  <td>{clinicalTrialData.clinicalTrialData.reduce((total, item) => total + item.numberOfPeopleTested, 0)}</td>
                  <td>{clinicalTrialData.clinicalTrialData.map(item => item.age).join(", ")}</td>
                  <td>{clinicalTrialData.clinicalTrialData.map(item => item.results).join(", ")}</td>
                </tr>
                {clinicalTrialData.clinicalTrialData.map((item, index) => (
                  <tr key={index}>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{item.targetedMedicalCondition}</td>
                    <td>{item.numberOfPeopleTested}</td>
                    <td>{item.age}</td>
                    <td>{item.results}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Loading clinical trial data...</p>
          )}
        </div>
        <br />
        <button onClick={logOut} className="btn btn-primary me-1">Log Out</button>
        <button onClick={approve} className="btn btn-primary me-1">Get Block Address</button>
        <button onClick={handleGetBalance} className="btn btn-primary me-1">Approve Certificate</button>
        <button onClick={updateCertificate} className="btn btn-primary me-1">Update/Reject Certificate</button>
      </div>
      {showPopup && <PopupWindow message={popupMessage} onClose={closePopup} />}
    </div>
  );
}
