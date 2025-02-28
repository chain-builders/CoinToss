// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./errors/Errors.sol";
import "./events/Events.sol";

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

    function createPool(uint _entryFee, uint _maxParticipants) external onlyOwner {
        if(_entryFee == 0){
            revert Errors.EntryFeeMustBeGreaterThanZero();
        }
        uint poolId = poolCount++;
        pools[poolId] = Pool({
            entryFee: _entryFee,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            prizePool: 0,
            status: PoolStatus.OPENED
        });

        emit Events.PoolCreated(poolId, _entryFee, _maxParticipants);
    }

}
