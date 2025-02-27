// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CoinToss is Ownable(msg.sender) {
    enum UserChoice {
        HEADS,
        TAILS
    }

    enum PoolStatus {
        OPENED,
        ACTIVE,
        CLOSED
    }

    struct Player {
        address PlayerAddress;
        UserChoice choice;
        bool isEliminated;
        bool hasClaimed;
    }

    struct Pool {
        uint entryFee;
        uint maxParticipants;
        uint currentParticipants;
        uint prizePool;
        PoolStatus status;
    }

    uint poolCount;
    mapping(uint => Pool) pools;

    modifier poolExists(uint256 _poolId) {
        require(_poolId < poolCount, "Pool does not exist");
        _;
    }

    constructor(){
        poolCount = 0;
    }


}
