import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { CONTACT_ABI, CONTACT_ADDRESS } from "../../src/config";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

export default function Publichome() {
  const [drugName, setDrugName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Function to fetch drug suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5008/drug-suggestions?query=${encodeURIComponent(query)}`);

      if (response.data.status === "ok") {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce((query) => fetchSuggestions(query), 300),
    []
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDrugName(value);
    debouncedFetchSuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setDrugName(suggestion);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (!drugName.trim()) {
      alert("Please enter a drug name to search");
      return;
    }

    setIsLoading(true);
    setSearchResults([]);

    try {
      console.log("🔍 Starting drug search...");

      // First try to search in MongoDB using the applicationstatus endpoint
      const mongoResponse = await axios.get("http://localhost:5008/applicationstatus", {
        params: { drugName: drugName.trim() }
      });

      if (mongoResponse.data.status === "success" && mongoResponse.data.data) {
        // Format the data to match the expected structure
        const drugData = mongoResponse.data.data;
        const result = {
          Drugname: drugData.drugName,
          Composition: drugData.drugDescription || "N/A",
          Targetedmedicalcondition: drugData.commonSideEffect || "N/A",
          transactionHash: drugData.transactionHash || "N/A",
          status: drugData.status || "pending"
        };

        setSearchResults([result]);
        console.log("🔹 Search completed. Found drug in MongoDB.");
      } else {
        // If not found in MongoDB, try the blockchain API
        const blockchainResponse = await axios.get("http://localhost:5008/drugs");

        if (blockchainResponse.data.status === "ok" && blockchainResponse.data.data) {
          // Filter drugs by name (case-insensitive)
          const matchingDrugs = blockchainResponse.data.data.filter(drug =>
            drug.drugName.toLowerCase().includes(drugName.trim().toLowerCase())
          );

          if (matchingDrugs.length > 0) {
            // Format the data to match the expected structure
            const results = matchingDrugs.map(drug => ({
              Drugname: drug.drugName,
              Composition: drug.composition || "N/A",
              Targetedmedicalcondition: drug.targetCondition || "N/A",
              status: "approved" // Assume drugs in blockchain are approved
            }));

            setSearchResults(results);
            console.log(`🔹 Search completed. Found ${results.length} drugs in blockchain.`);
          } else {
            console.log("🔹 No matching drugs found in blockchain.");
          }
        } else {
          console.log("🔹 No drugs found in blockchain API.");
        }
      }
    } catch (error) {
      console.error("❌ Error in handleSearch:", error);
      alert("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: "100px" }} className="auth-wrapper">
      <div className="admin-home">
        <div style={{ paddingTop: "10px" }} className="table-container">
          <h1 style={{ color: "navy" }}>Welcome to FDA Drug Search Page</h1>
          <div className="position-relative">
            <div className="input-group mb-3">
              <input
                type="text"
                value={drugName}
                onChange={handleInputChange}
                onFocus={() => drugName.trim() !== '' && setShowSuggestions(true)}
                className="form-control"
                placeholder="Enter drug name"
                autoComplete="off"
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Searching...
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-search me-1"></i> Search
                  </span>
                )}
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="position-absolute w-100 bg-white border rounded shadow-sm"
                style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 border-bottom suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <br />
          <br />

          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Searching blockchain for drug information...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered text-center custom-table shadow-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <th>Drug Name</th>
                    <th>Composition</th>
                    <th>Targeted Medical Condition</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{result.Drugname || "N/A"}</td>
                      <td className="text-wrap">{result.Composition || "N/A"}</td>
                      <td className="text-wrap">{result.Targetedmedicalcondition || "N/A"}</td>
                      <td>
                        <span className={`badge ${result.status === 'approved' ? 'bg-success' : result.status === 'rejected' ? 'bg-danger' : 'bg-warning'}`}>
                          {result.status === 'approved' ? 'Approved' : result.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : drugName.trim() !== '' ? (
            <div className="alert alert-warning text-center" role="alert">
              🚨 No matching drugs found. Try again with a different name.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
