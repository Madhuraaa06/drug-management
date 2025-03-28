import React, { useState } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../config";
import "../App.css";

export default function UserApplicationStatus() {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      console.log("🔍 Starting drug search...");
  
      const provider = window.ethereum;
      if (!provider) {
        console.log("❌ Non-Ethereum browser detected. Please install MetaMask.");
        return;
      }
  
      console.log("✅ Ethereum provider detected. Requesting account access...");
      await provider.request({ method: "eth_requestAccounts" });
  
      const web3 = new Web3(provider);
      console.log("✅ Web3 initialized.");
  
      const contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);
      console.log("✅ Connected to smart contract at:", CONTACT_ADDRESS);
  
      const COUNTER = await contract.methods.count().call();
      console.log("📊 Total records in contract:", COUNTER);
  
      const results = [];
  
      for (let i = 1; i <= COUNTER; i++) {
        console.log(`🔎 Searching record ${i}...`);
  
        try {
          const contact = await contract.methods.contacts(i).call();
          console.log(`📄 Drug Entry ${i}:`, contact);
  
          if (contact?.Drugname && contact.Drugname === drugName) {
            console.log(`✅ Match found for drug: ${drugName}`);
  
            // 🔹 Fetch transaction details
            const latestBlock = await web3.eth.getBlock('latest');
            console.log(`🟢 Latest Block:`, latestBlock);
  
            const transactionReceipt = await web3.eth.getTransactionReceipt(latestBlock.transactions[0]);
            if (transactionReceipt) {
              console.log("📝 Transaction Receipt:", transactionReceipt);
  
              const block = await web3.eth.getBlock(transactionReceipt.blockNumber);
              console.log("📦 Block Details:", block);
  
              results.push({
                ...contact,
                blockHash: block.hash,
                blockNumber: block.number,
              });
            } else {
              console.warn("⚠️ No transaction receipt found.");
            }
          }
        } catch (contactError) {
          console.error(`⚠️ Error retrieving record ${i}:`, contactError);
        }
      }
  
      console.log("🔹 Search completed. Total matches found:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("❌ Error in handleSearch:", error);
    }
  };
  
  const handleCheckUpdates = () => {
    window.location.href = "/userapplicationviewstatus";
  };

  return (
    <div style={{ paddingTop: "100px" }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: "10px" }} className="table-container">
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
              style={{ marginLeft: "10px" }}
            >
              Check for Updates
            </button>
          </div>

          <br />
          <br />

          {searchResults.length > 0 ? (
            <h3>
              Congratulations..! Your Certificate has been Approved. Please check in public search for Certificate.
            </h3>
          ) : (
            drugName !== "" && (
              <h3>
                Oops..! Your Certificate has not been Approved. Please check in updates for further information.
              </h3>
            )
          )}
        </div>
      </div>
    </div>
  );
}
