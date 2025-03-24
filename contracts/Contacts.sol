// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.10;

contract Contacts {
  uint public count = 0; // state variable

  struct Contact {
    uint id;
    string Manufacturename;
    string Drugname;
    string Composition;
    string Targetedmedicalcondition;
  }

  constructor() public{
    //createContact('Gilead Sciences', 'Remdesivir', 'Remdesivir 50%', 'COVID-19');
  }

  mapping(uint => Contact) public contacts;

  function createContact(string memory _mname, string memory _dname, string memory _comp, string memory _target) 
  public {
    count++;
    contacts[count] = Contact(count, _mname, _dname, _comp, _target);
  }
}