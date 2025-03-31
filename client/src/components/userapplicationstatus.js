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
      await provider.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(provider);
      console.log("✅ Web3 initialized.");

      const latestBlockNumber = await web3.eth.getBlockNumber();
      console.log(`📌 Latest Block Number: ${latestBlockNumber}`);

      if (latestBlockNumber < 19) {
        console.log("⚠️ No transactions available from block 19 onward.");
        return;
      }

      const allTransactionHashes = [];
      for (let i = latestBlockNumber; i >= 19; i--) {
        const block = await web3.eth.getBlock(i, true);
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
        if (!tx || !tx.input) continue;

        try {
          const decodedData = web3.eth.abi.decodeParameters(
            ["string", "string", "string", "string"],
            tx.input.slice(10)
          );
          const extractedDrugName = decodedData[1];
          if (extractedDrugName === drugName) {
            console.log(`✅ Match found for drug: ${drugName}`);
            const block = await web3.eth.getBlock(tx.blockNumber);
            results.push({
              drugName: extractedDrugName,
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

  const handleDownloadCertificate = (result) => {
    const certificateContent = `Drug Certification\n\nDrug Name: ${result.drugName}\nBlock Number: ${result.blockNumber}\nTransaction Hash: ${result.transactionHash}\nBlock Hash: ${result.blockHash}\n`;
    const blob = new Blob([certificateContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${result.drugName}_certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      <div className="card p-4 shadow-lg">
        <h2 className="text-center">Drug Certification Search</h2>
        <div className="input-group mb-3">
          <input
            type="text"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            className="form-control"
            placeholder="Enter drug name"
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {searchResults.length > 0 ? (
          <div className="alert alert-success text-center">
            🎉 Your Certificate has been Approved!
          </div>
        ) : (
          drugName !== "" && (
            <div className="alert alert-warning text-center">
              ⚠️ Your Certificate is not approved yet. Check for updates.
            </div>
          )
        )}

        {searchResults.length > 0 && (
          <div className="row mt-4">
            {searchResults.map((result, index) => (
              <div key={index} className="col-md-6 mb-3">
                <div className="card shadow-sm p-3">
                  <h5 className="text-primary">{result.drugName}</h5>
                  <p><strong>Block Number:</strong> {result.blockNumber}</p>
                  <p><strong>Transaction Hash:</strong> {result.transactionHash.substring(0, 10)}...</p>
                  <p><strong>Block Hash:</strong> {result.blockHash.substring(0, 10)}...</p>
                  <button
                    className="btn btn-success"
                    onClick={() => handleDownloadCertificate(result)}
                  >
                    📄 Download Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
