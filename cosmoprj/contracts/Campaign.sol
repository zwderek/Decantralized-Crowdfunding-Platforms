// SPDX-License-Identifier: MIT
pragma solidity >=0.8.12 <0.9.0;

contract Campaign {

    address public raiser;
    string public campaign_description; //description of the campaign
    string public campaign_board; //
    uint public start_timestamp;
    uint public end_timestamp;
    uint public target;
    uint public contributers_count;

    address[] public contributers_list;
    mapping(address => bool) public contributers;
    mapping(address => uint) public contributers_amount;

    bool public is_end;


    struct Request {
        string request_description;
        uint value;
        uint start_timestamp;
        uint end_timestamp;
        bool is_completed;
        uint approvalCount;
        uint approvalPower;
        mapping(address => bool) approvals;
    }

    uint numRequests;
    mapping (uint => Request) requests;

    modifier restricted_raiser() {
        require(msg.sender == raiser);
        _;
    }

    constructor(string memory _description, uint _target, uint _lifespan) {
        require(_lifespan <= 364 && _lifespan >= 7, "campaign lifespan must not exceed 364 days");

        raiser = msg.sender; //
        start_timestamp = block.timestamp;
        //end_timestamp = start_timestamp + (_lifespan * 1 minutes); //for test
        end_timestamp = start_timestamp + (_lifespan * 1 days);
        campaign_description = _description;
        campaign_board = "New Campaign created\n";
        target = _target;
        is_end = false;
    }

    function setRaiser(address add) public restricted_raiser {
        raiser = add;
    }

    function customize(string memory info) public restricted_raiser {
        campaign_board = string.concat(campaign_board, info);
    }

    function contribute() payable public{
        require(block.timestamp < end_timestamp, "campaign is already end");
        require(msg.value + address(this).balance <= target, "exceed target");

        payable(address(this)).transfer(msg.value);
        if (!contributers[msg.sender]) {
            contributers[msg.sender] = true;
            contributers_list.push(msg.sender);
            contributers_amount[msg.sender] = msg.value;
            contributers_count++;
        } else {
            contributers_amount[msg.sender] += msg.value;
        }
    }

    /************ request functions ************/

    function createRequest(string memory _description, uint value) external restricted_raiser {
        require(block.timestamp < end_timestamp, "campaign is already end");

        if (numRequests > 0) {
            require(requests[numRequests-1].is_completed == true, "previous request is not completed yet");    
        }
        //require(block.timestamp + (3 * 1 minutes) <= end_timestamp, "lifespan error");
        require(block.timestamp + (7 * 1 days) <= end_timestamp, "lifespan error");
        require(value < address(this).balance, "value error");
        
        Request storage r = requests[numRequests++];
        r.request_description = _description;
        r.value = value;
        r.start_timestamp = block.timestamp;
        //r.end_timestamp = start_timestamp + (3 * 1 minutes); // for testing
        r.end_timestamp = start_timestamp + (7 * 1 days);
        r.is_completed = false;
        r.approvalCount = 0;
    }
    
    function approveRequest(uint index) external {
        require(block.timestamp < end_timestamp, "campaign is already end");
        require(contributers[msg.sender], "not contributer");
        require(!requests[index].approvals[msg.sender], "already approved");
        require(requests[index].is_completed == false, "voting period is end");

        requests[index].approvals[msg.sender] = true;
        requests[index].approvalCount++;
    }

    function getRequestApprovementSum(uint index) public view returns (uint) {
        uint sum = 0;
        for (uint i=0; i<contributers_list.length; i++) {
            address cur = contributers_list[i];
            if (requests[index].approvals[cur]) {
                sum += contributers_amount[cur];
            }
        }
        return sum;
    }

    function finalizeRequest(uint index) restricted_raiser external returns (string memory) {
        require(block.timestamp < end_timestamp, "campaign is already end");
        require(!requests[index].is_completed, "already been completed");
        require(block.timestamp >= requests[index].end_timestamp, "voting period is not end yet");

        if (requests[index].value > address(this).balance) { //insufficient balance
            requests[index].is_completed = true;
            return "Insufficient Balance";
        }
        if (getRequestApprovementSum(index) <= (address(this).balance / 2)) { //less than 50%
            requests[index].is_completed = true;
            return "Request Denied";
        }

        uint previous_balance = address(this).balance;
        uint withdraw_value = requests[index].value;
        for (uint i=0; i<contributers_list.length; i++) {
            address cur = contributers_list[i];
            contributers_amount[cur] -= withdraw_value * contributers_amount[cur]/previous_balance;
        }
        payable(raiser).transfer(requests[index].value);
        requests[index].is_completed = true;
        return "Request Succeeded";
    }

    /************ refund functions ************/

    function refund() external returns (string memory) {
        require(block.timestamp >= end_timestamp, "campaign is not end yet");
        require(is_end == false, "campaign is already end");

        is_end = true;
        for (uint i=0; i<contributers_list.length; i++) {
            address cur = contributers_list[i];
            payable(cur).transfer(contributers_amount[cur]);
            contributers_amount[cur] = 0; 
        }
        return "Refund Succeeded";

    }

    /************ query functions ************/

    function getSummery() external view returns (address, string memory, string memory, uint, uint, uint) {
        return (
            raiser,
            campaign_description,
            campaign_board,
            contributers_count,
            numRequests,
            target
        );
    }

    function getDetails() external view returns (uint, uint, bool) {
        return (
            start_timestamp,
            end_timestamp,
            is_end
        );
    }

    function getContributers() external view returns (address[] memory) {
        return contributers_list;
    }

    function getContributerAmount(address add) external view returns (uint) {
        require (contributers[add], "not a contributer");
        return contributers_amount[add];
    }

    function getRequestSummery(uint index) external view returns (string memory, uint, uint, uint) {
        Request storage r = requests[index];
        return (
            r.request_description,
            r.value,
            r.start_timestamp,
            r.end_timestamp
        );
    }

    function getRequestDetails(uint index) external view returns (bool, uint, uint) {
        Request storage r = requests[index];
        return (
            r.is_completed,
            r.approvalCount,
            getRequestApprovementSum(index) * 100 / address(this).balance
        );
    }

    fallback() external payable {}
    
    receive() external payable {}


}