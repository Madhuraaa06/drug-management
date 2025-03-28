import React, { useState } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../../src/config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Publichome() {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const provider = window.ethereum;
      if (!provider) {
        console.log("❌ Non-Ethereum browser detected. Please install MetaMask.");
        return;
      }

      await provider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(provider);
      const contract = new web3.eth.Contract(CONTACT_ABI, CONTACT_ADDRESS);

      const COUNTER = await contract.methods.count().call();
      console.log("📊 Total drugs in contract:", COUNTER);

      const results = [];

      for (let i = 1; i <= COUNTER; i++) {
        try {
          const contact = await contract.methods.contacts(i).call();
          
          if (contact.Drugname?.toLowerCase().trim() === drugName.toLowerCase().trim()) {
            console.log(`✅ Match found for drug: ${drugName}`);

            let blockDetails = { blockHash: "N/A", blockNumber: "N/A" };

            try {
              const latestBlock = await web3.eth.getBlock("latest");
              const transactionReceipt = await web3.eth.getTransactionReceipt(latestBlock.transactions[0]);

              if (transactionReceipt) {
                const block = await web3.eth.getBlock(transactionReceipt.blockNumber);
                blockDetails = { blockHash: block.hash, blockNumber: block.number };
              }
            } catch (blockError) {
              console.warn("⚠️ Could not fetch block details:", blockError);
            }

            results.push({ ...contact, ...blockDetails });
          }
        } catch (error) {
          console.error(`⚠️ Error retrieving record ${i}:`, error);
        }
      }

      console.log("🔹 Search completed. Total matches found:", results.length);
      setSearchResults(results);
    } catch (error) {
      console.error("❌ Error in handleSearch:", error);
    }
  };

  return (
    <div style={{ paddingTop: "100px" }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: "10px" }} className="table-container">
          <h1 style={{ color: "navy" }}>Welcome to FDA Drug Search Page</h1>
          <div className="input-group mb-3">
            <input
              type="text"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="form-control"
              placeholder="Enter drug name"
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          <br />
          <br />

          {searchResults.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered text-center custom-table">
                <thead>
                  <tr>
                    {/* <th>Manufacturer Name</th> */}
                    <th>Drug Name</th>
                    <th>Composition</th>
                    <th>Targeted Medical Condition</th>
                    <th>Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr key={index}>
                      {/* //<td className="text-wrap">{result.Manufacturename || "N/A"}</td> */}
                      <td>{result.Drugname || "N/A"}</td>
                      <td className="text-wrap">{result.Composition || "N/A"}</td>
                      <td className="text-wrap">{result.Targetedmedicalcondition || "N/A"}</td>
                      <td>Yes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-warning text-center" role="alert">
              🚨 No matching drugs found. Try again with a different name.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
