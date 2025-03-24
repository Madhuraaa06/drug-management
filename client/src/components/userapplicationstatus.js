import React, { useState } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../../src/config";
import "../App.css";

export default function UserApplicationStatus() {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const provider = window.ethereum;
      if (typeof provider !== "undefined") {
        await provider.request({
          method: "eth_requestAccounts"
        });
        const web3 = new Web3(provider);

        const contactList = new web3.eth.Contract(
          CONTACT_ABI,
          CONTACT_ADDRESS
        );

        const COUNTER = await contactList.methods.count().call();
        const results = []; // Array to store search results

        for (let i = 1; i <= COUNTER; i++) {
          const contact = await contactList.methods.contacts(i).call();

          // Assuming the drugName field is the one you want to search
          if (contact.Drugname === drugName) {
            const block = await web3.eth.getBlock(contact.blockHash);
            results.push({ ...contact, blockHash: contact.blockHash, blockNumber: block.number });
          }
        }

        setSearchResults(results);
      } else {
        console.log("Non-ethereum browser detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
    }
  };

  const handleCheckUpdates = () => {
    window.location.href = "/userapplicationviewstatus";
  };

  return (
    <div style={{ paddingTop: '100px' }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: '10px' }} className="table-container">
          <div className="input-group mb-3">
            <input
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="form-control"
              placeholder="Enter drug name"
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search Your Drug By Name
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCheckUpdates}
              style={{ marginLeft: '10px' }}
            >
              Check for Updates
            </button>
          </div>

          <br /><br />

          {searchResults.length > 0 ? (
            <p><h3>Congratulations..! Your Certificate has been Approved. Please check in public search for Certificate</h3></p>
          ) : (
            drugName !== "" && <p><h3>Oops..! Your Certificate has not been Approved. Please check in updates for further information</h3></p>
          )}
        </div>
      </div>
    </div>
  );
}
