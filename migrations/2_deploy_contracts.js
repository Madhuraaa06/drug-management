// Help Truffle find `TruffleTutorial.sol` in the `/contracts` directory
const Contact = artifacts.require("Contacts");

module.exports = function(deployer) {
  // Command Truffle to deploy the Smart Contract
  deployer.deploy(Contact);
};

