const CONTACT_ADDRESS = '0x92aA896358b31CC2C6Aeb3080dCcEdB06be4c2E2';

const CONTACT_ABI=[
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
        "internalType": "string",
        "name": "Manufacturename",
        "type": "string"
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
    "type": "function"
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
    "type": "function"
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
        "name": "_target",
        "type": "string"
      }
    ],
    "name": "createContact",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


module.exports = {
    CONTACT_ABI,
    CONTACT_ADDRESS
};
