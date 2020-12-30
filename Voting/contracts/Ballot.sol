// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/// @title Voting with delegation
contract Ballot {
    struct Voter {
        uint256 weight;
        bool voted;
        address delegate;
        uint256 vote;
    }

    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        // 1. Set Chairperson information
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        // 2. Set proposals
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function giveRightToVoters(address[] calldata voterAddresses) public {
      require(msg.sender == chairperson, "You are not a CP");
      for (uint i = 0;i<voterAddresses.length;i++) {
        require(!voters[voterAddresses[i]].voted, "Already voted");
        require(voters[voterAddresses[i]].weight == 0, "Duplicate voter");
        voters[voterAddresses[i]].weight = 1;
      }
    }

    function giveRightToVote(address voter) public {
        require(msg.sender == chairperson, "You are not a CP");
        require(!voters[voter].voted, "Already voted");
        require(voters[voter].weight == 0, "Duplicate voter");
        voters[voter].weight = 1;
    }

    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted");
        require(to != msg.sender, "You cant delegate for yourselves");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(
                voters[to].delegate != msg.sender,
                "Found loop in delegation"
            );
        }

        Voter storage theDelegate = voters[to];

        if (theDelegate.voted) {
            proposals[theDelegate.vote].voteCount += sender.weight;
        } else {
            theDelegate.weight += sender.weight;
        }

        sender.voted = true;
        sender.delegate = to;
    }

    function vote(uint256 proposal) public {
        Voter storage voter = voters[msg.sender];
        require(!voter.voted, "Already voted");
        require(voter.weight > 0, "Insufficient Weight");

        proposals[proposal].voteCount += voter.weight;

        voter.voted = true;
        voter.vote = proposal;
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningCount = 0;
        for (uint256 i = 0; i < proposals.length; i++) {
          if (proposals[i].voteCount > winningCount) {
            winningCount = proposals[i].voteCount;
            winningProposal_ = i;
          }
        }
    }

    function winnerName() public view returns (bytes32 winnerName_) {
      uint256 winningProposal_ = winningProposal();
      winnerName_ = proposals[winningProposal_].name;
    }
}
