// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BlindAuction {
    struct Bid {
        bytes32 blindedBid;
        uint256 deposit;
    }

    address payable public beneficiary;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    bool public ended;

    mapping(address => Bid[]) public bids;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) pendingReturns;

    event AuctionEnded(address winner, uint256 highestBid);

    event LogKeccak(bytes32 theKeccak);

    modifier onlyBefore(uint256 _time) {
        require(block.timestamp < _time, 'onlyBefore validation failed');
        _;
    }
    modifier onlyAfter(uint256 _time) {
        require(block.timestamp > _time, 'onlyAfter validation failed');
        _;
    }

    bool public bored;

    constructor(
        uint256 _biddingTime,
        uint256 _revealTime,
        address payable _beneficiary
    ) {
        biddingEnd = block.timestamp + _biddingTime;
        revealEnd = biddingEnd + _revealTime;
        beneficiary = _beneficiary;
    }

    /// Place a blinded bid with `_blindedBid` =
    /// keccak256(abi.encodePacked(value, fake, secret)).
    function bid(bytes32 _blindedBid) public payable onlyBefore(biddingEnd) {
        bids[msg.sender].push(
            Bid({blindedBid: _blindedBid, deposit: msg.value})
        );
    }

    function reveal(
        uint256[] memory _values,
        bool[] memory _fake,
        bytes32[] memory _secret
    ) public onlyAfter(biddingEnd) onlyBefore(revealEnd) {
        uint256 length = bids[msg.sender].length;
        require(
            _values.length == length &&
                _fake.length == length &&
                _secret.length == length,
            "length mismatch"
        );

        uint256 refund;
        for (uint256 i = 0; i < length; i++) {
            (uint256 value, bool fake, bytes32 secret) =
                (_values[i], _fake[i], _secret[i]);
            Bid storage bidToCheck = bids[msg.sender][i];
            bytes32 kc = keccak256(abi.encodePacked(value, fake, secret));
            emit LogKeccak(kc);
            if (
                kc == bidToCheck.blindedBid
            ) {
                refund += bidToCheck.deposit;
                if (!fake && bidToCheck.deposit >= value) {
                    if (placeBid(msg.sender, value)) refund -= value;
                }
                bidToCheck.blindedBid = bytes32(0);
            }
        }
        payable(msg.sender).transfer(refund);
    }

    function withdraw() public {
        uint256 amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;
            payable(msg.sender).transfer(amount);
        }
    }

    function auctionEnd() public onlyAfter(revealEnd) {
        require(!ended);
        emit AuctionEnded(highestBidder, highestBid);
        ended = true;
        beneficiary.transfer(highestBid);
    }

    function placeBid(address bidder, uint256 value)
        internal
        returns (bool success)
    {
        if (value < highestBid) {
            return false;
        }
        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = bidder;
        highestBid = value;
        return true;
    }

    function getBlockTime() public view returns (uint) {
      return block.timestamp;
    }

    function setBored() public {
      bored = !bored;
    }
}
