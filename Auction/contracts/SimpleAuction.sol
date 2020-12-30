// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleAuction {
    address payable public beneficiary;
    uint256 public expiryTime;
    mapping(address => uint256) pendingReturns;
    address public highestBidder;
    uint256 public highestBid;
    bool public ended;

    bool public bored;

    event HighestBidIncreased(address bidder, uint256 amount);
    event AuctionEnded(address winner, uint256 amount);

    constructor(uint256 _biddingTime, address payable _beneficiary) {
        beneficiary = _beneficiary;
        expiryTime = block.timestamp + _biddingTime;
    }

    function bid() public payable {
        require(block.timestamp <= expiryTime, "Auction expired");
        require(beneficiary != msg.sender, "Beneficiary cannot bid");
        require(msg.value > highestBid, "Bid higher than highestBid");
        if (msg.value > highestBid) {
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function auctionEnd() public {
        require(
            expiryTime <= block.timestamp,
            "Time left for auction to expire"
        );
        require(!ended, "Auction already ended");
        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
        beneficiary.transfer(highestBid);
    }

    function getBlockTime() public view returns (uint) {
      return block.timestamp;
    }

    function setBored() public {
      bored = !bored;
    }
}
