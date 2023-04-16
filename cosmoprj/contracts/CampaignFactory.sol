// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12 <0.9.0;

import "./Campaign.sol";

contract CampaignFactory {

    address[] public deployedCampaigns;

    function createCampaign(string memory _description, uint _target, uint _lifespan) public {
        Campaign newCampaign = new Campaign(_description, _target, _lifespan);
        deployedCampaigns.push(address(newCampaign));
        newCampaign.setRaiser(msg.sender);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }

}