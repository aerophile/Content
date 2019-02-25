pragma solidity ^0.4.18;

import "@aragon/os/contracts/apps/AragonApp.sol";

contract Voting is AragonApp {
    bytes32 constant public CREATE_VOTES_ROLE = keccak256("CREATE_VOTES_ROLE");
    bytes32 constant public CAST_VOTES_ROLE = keccak256("CAST_VOTES_ROLE");
    struct Vote {
        address creator;
        string question;
        uint yes;
        uint no;
        mapping (address => VoteStates) voteStates;
    }
    Vote[] public votes;

    enum VoteStates {Absent, Yes, No}

    event VoteCreated(uint _voteId);
    event VoteCast(uint _voteId);

    function newVote(string _question) auth(CREATE_VOTES_ROLE) external {
        votes.push(Vote(msg.sender, _question, 0, 0));
        VoteCreated(votes.length - 1);
    }

    function castVote(uint _voteId, bool _supports) auth(CAST_VOTES_ROLE) {
        Vote vote = votes[_voteId];

        if(vote.voteStates[msg.sender] == VoteStates.Yes) {
            // if they voted yes before
            vote.yes--;
        }
        if(vote.voteStates[msg.sender] == VoteStates.No) {
            // if they voted no before
            vote.no--;
        }

        if(_supports) {
            vote.yes++;
        }
        else {
            vote.no++;
        }

        // we're tracking whether or not someone has already voted 
        // and we're keeping track as well of what they voted
        vote.voteStates[msg.sender] = _supports ? VoteStates.Yes : VoteStates.No;

        VoteCast(_voteId);
    }
}
