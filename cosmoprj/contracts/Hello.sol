// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Hello {

  string public hello;

  constructor (string memory tmp) {
    //console.log("Deploying a Hello with msg:", tmp);
    hello = tmp;
  }

  function sayHello() public view returns (string memory)  {
    return hello;
  }
  

}
