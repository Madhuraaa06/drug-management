import React, { Component, useEffect, useState } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import "../App.css";


const CONTACT_ABI = require('../../src/config');
const CONTACT_ADDRESS = require('../../src/config');

export default function AdminHome({ userData }) {

  const { drugName } = useParams();
  const [clinicalTrialData, setClinicalTrialData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  
  
  const [walletAccount, setWalletAccount] = useState('')
  //const [currentChain, setCurrentChain] = useState('')
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  //const [isConnected, setIsConnected] = useState(false)
  const [ethBalance, setEthBalance] = useState(null)

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
      if (clinicalTrialData) {
        const totalPeopleTested = clinicalTrialData.clinicalTrialData.reduce((total, item) => {
          return total + item.numberOfPeopleTested;
        }, 0);
  
        if (totalPeopleTested < 100) {
          alert("Total number of people tested should be 100.");
        }
  
        const hasPlusSymbolInAge = clinicalTrialData.clinicalTrialData.some((item) => item.age.includes("+"));
  
        if (hasPlusSymbolInAge) {
          alert("Age should not contain a '+' symbol please reject the.");
        }
      }
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

      const hasPlusSymbolInAge = clinicalTrialData.clinicalTrialData.some((item) => item.age.includes("+", "-" ,"<",">"));

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
  
  const approve = async (e) => {

    //alert('Hello');
    let provider = window.ethereum;
    if (typeof provider !== "undefined") {
      await provider.request({
        method: "eth_requestAccounts"
      });
      const web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      setWalletAccount(account);

      console.log(account);
      alert(account)
    } else {
      console.log("Non-ethereum browser  detatched. Please install Metamask");
    }
    // window.localStorage.clear();
    // window.location.href = "./sign-in";
  };

  // Get the Accounts current Balance and convert to Wei and ETH
  const handleGetBalance = async () => {

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })

    // // Returns a hex value of Wei
    const wei = parseInt(balance, 16)
    const gwei = (wei / Math.pow(10, 9)) // parse to Gwei
    const eth = (wei / Math.pow(10, 18))// parse to ETH

    
    setEthBalance({ wei, gwei, eth })
    await handleSendTransaction(walletAccount,"0x0988301d9f3d9074acD2b68F55e4d688336eD6E3",2)
    //setShowBalanceModal(true)

  }

  const handleSendTransaction = async (sender, receiver, amount) => {
    try {
      // Log a message
      console.log("handleSendTransaction called");
    
      const provider = window.ethereum;
      if (typeof provider !== "undefined") {
        await provider.request({
          method: "eth_requestAccounts"
        });
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setWalletAccount(account);
    
        // Log the account value
        console.log("Account:", account);
    
        const contactList = new web3.eth.Contract(CONTACT_ABI.CONTACT_ABI, CONTACT_ADDRESS.CONTACT_ADDRESS);
        const COUNTER = await contactList.methods.count().call();
    
        // Log the counter value
        console.log("Counter:", COUNTER);
    
        for (let i = 1; i <= COUNTER; i++) {
          const contact = await contactList.methods.contacts(i).call();
          // Log the contact
          console.log("Contact:", JSON.stringify(contact));
        }
    
        if (clinicalTrialData) {
          const { manufacturerName, drugName, composition, targetedMedicalCondition } = clinicalTrialData;
  
          // Log the clinical trial data values
          console.log("manufacturerName:", manufacturerName);
          console.log("drugName:", drugName);
          console.log("composition:", composition);
          console.log("targetedMedicalCondition:", targetedMedicalCondition);
    
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
  }

  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false)
  }

  const handleOpenTransactionModal = () => {
    setShowTransactionModal(true)
  }

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false)
  }

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "/sign-in";
  };

  const updateCertificate = () => {
    window.localStorage.setItem("manufacturerName", clinicalTrialData.manufacturerName);
    window.localStorage.setItem("drugName", clinicalTrialData.drugName);
    window.location.href = "/update-reject";
  };

  return (
    <div style={{ paddingTop: '600px' }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: '10px' }}className="table-container">
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
              <td>The Total number of people tested in different age group</td>
              <td>age group</td>
              <td></td>
              <td></td>
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
        <br></br>
        <button onClick={logOut} className="btn btn-primary me-1">
          Log Out
        </button>
        <button onClick={approve} className="btn btn-primary me-1">
          Get Block Address
        </button>
        <button onClick={handleGetBalance} className="btn btn-primary me-1">
          Approve Certificate
        </button>
        <button onClick={updateCertificate} className="btn btn-primary me-1">
          Update/Reject Certificate
        </button>
      </div>
      {showPopup && <PopupWindow message={popupMessage} onClose={closePopup} />}
    </div>
  );
}
