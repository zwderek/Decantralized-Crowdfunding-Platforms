// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Hello.sol";

contract HelloFactory {
  address[] public deployedHello;

  function createHello(string memory tmp) public {
    Hello newHello = new Hello(tmp);
    deployedHello.push(address(newHello));
  }

  function getDeployedCampaigns() public view returns (address[] memory) {
    return deployedHello;
  }
}
