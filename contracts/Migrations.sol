// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Migrations {
    address public owner;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }
}