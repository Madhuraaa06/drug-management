const CONTACT_ADDRESS = '0x57983Fac855d699422D324AC8D172cb50bf6DFcC';

const CONTACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "contacts",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "Manufacturename",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "Drugname",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "Composition",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "Targetedmedicalcondition",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "count",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_mname",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_dname",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_comp",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_comp",
          "type": "_target"
        }
        
      ],
      "name": "createContact",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  module.exports = {
    CONTACT_ABI,
    CONTACT_ADDRESS
  };