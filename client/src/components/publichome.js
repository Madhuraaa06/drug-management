import React, { useState } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../../src/config";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Publichome() {
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

      await provider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(provider);
      console.log("✅ Web3 initialized.");

      // Get the latest block number
      const latestBlockNumber = await web3.eth.getBlockNumber();
      console.log(`📌 Latest Block Number: ${latestBlockNumber}`);

      if (latestBlockNumber < 19) {
        console.log("⚠️ No transactions available from block 19 onward.");
        return;
      }

      const allTransactionHashes = [];

      // Fetch transactions from block 19 onwards
      for (let i = latestBlockNumber; i >= 19; i--) {
        const block = await web3.eth.getBlock(i, true); // true to include transactions
        if (block && block.transactions) {
          block.transactions.forEach((tx) => {
            allTransactionHashes.push(tx.hash);
          });
        }
      }

      if (!allTransactionHashes.length) {
        console.log("⚠️ No transactions found.");
        return;
      }

      const results = [];

      for (let hash of allTransactionHashes) {
        console.log(`🔎 Fetching transaction details for hash: ${hash}...`);

        const tx = await web3.eth.getTransaction(hash);
        if (!tx || !tx.input) {
          console.log(`⚠️ Transaction ${hash} has no input data.`);
          continue;
        }

        try {
          const decodedData = web3.eth.abi.decodeParameters(
            ["string", "string", "string", "string"], // Adjust types as needed
            tx.input.slice(10) // Remove function selector
          );

          console.log("🔓 Decoded Transaction Data:", decodedData);

          const extractedDrugName = decodedData[1]; // Element 1 is the drug name
          console.log(`📝 Extracted Drug Name: ${extractedDrugName}`);

          if (extractedDrugName.toLowerCase().trim() === drugName.toLowerCase().trim()) {
            console.log(`✅ Match found for drug: ${drugName}`);

            const block = await web3.eth.getBlock(tx.blockNumber);
            console.log("📦 Block Details:", block);

            results.push({
              Drugname: extractedDrugName,
              Composition: decodedData[2] || "N/A",
              Targetedmedicalcondition: decodedData[3] || "N/A",
              blockHash: block.hash,
              blockNumber: block.number,
              transactionHash: hash,
            });
          }
        } catch (decodeError) {
          console.error(`⚠️ Error decoding transaction ${hash}:`, decodeError);
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
                    <th>Drug Name</th>
                    <th>Composition</th>
                    <th>Targeted Medical Condition</th>
                    <th>Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr key={index}>
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
