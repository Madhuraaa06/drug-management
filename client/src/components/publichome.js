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

  return (
    <div style={{ paddingTop: '100px' }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: '10px' }} className="table-container">
          <h1 style={{ color: 'navy' }}>Welcome to FDA Drug Search Page</h1>
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

          <br /><br />

          {searchResults.length > 0 ? (
            <table className="table table-bordered text-center">
              <thead>
                <tr>
                  <th>Manufacturer Name</th>
                  <th>Drug Name</th>
                  <th>Composition</th>
                  <th>Targeted Medical Condition</th>
                  <th>Approved</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.Manufacturename}</td>
                    <td>{result.Drugname}</td>
                    <td>{result.Composition}</td>
                    <td>{result.Targetedmedicalcondition}</td>
                    <td>Yes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
