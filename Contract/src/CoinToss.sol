// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./errors/Errors.sol";
import "./events/Events.sol";

contract CoinToss is Ownable {
    enum PlayerChoice {
        NONE,
        HEADS,
        TAILS
    }

    enum PoolStatus {
        OPENED,
        ACTIVE,
        CLOSED
    }

    struct Player {
        address playerAddress;
        PlayerChoice choice;
        bool isEliminated;
        bool hasClaimed;
    }

    struct Pool {
        uint entryFee;
        uint maxParticipants;
        uint currentParticipants;
        uint prizePool;
        PoolStatus status;
        mapping(address => Player) players;
        uint currentRound;
        address[] playersInPool;
        mapping(uint => mapping(address => bool)) roundParticipation;
        mapping(uint => mapping(address => PlayerChoice)) roundSelection;
        mapping(uint => uint) headsCount;
        mapping(uint => uint) tailsCount;
        mapping(uint256 => bool) roundCompleted;
    }

    uint poolCount;
    mapping(uint => Pool) pools;
   
    

    modifier poolExists(uint _poolId) {
        require(_poolId < poolCount, "Pool does not exist");
        _;
    }

    constructor() Ownable(msg.sender){
        poolCount = 0;
    }

    function createPool(uint _entryFee, uint _maxParticipants) external onlyOwner {
        if(_entryFee == 0){
            revert Errors.EntryFeeMustBeGreaterThanZero();
        }
        
        uint poolId = poolCount++;
        
        Pool storage newPool = pools[poolId];
        newPool.entryFee = _entryFee;
        newPool.maxParticipants = _maxParticipants;
        newPool.currentParticipants = 0;
        newPool.prizePool = 0;
        newPool.status = PoolStatus.OPENED;
        newPool.currentRound = 1;
        
        emit Events.PoolCreated(poolId, _entryFee, _maxParticipants);
    }

    function joinPool(uint _poolId) external payable poolExists(_poolId){
        Pool storage pool = pools[_poolId];
        require(pool.status == PoolStatus.OPENED, "The Pool is not yet opened for participation");
        require(msg.value == pool.entryFee, "Entry fee is not met");
        require(pool.currentParticipants < pool.maxParticipants, "The pool is already full");
        require(pool.players[msg.sender].playerAddress == address(0), "Player has already joined this pool");

        Player storage newPlayer = pool.players[msg.sender];
        newPlayer.playerAddress = msg.sender;
        
        pool.prizePool += msg.value;
        pool.currentParticipants++;
        pool.playersInPool.push(msg.sender);
        newPlayer.choice = PlayerChoice.NONE;
        newPlayer.isEliminated = false;
        newPlayer.hasClaimed = false;

        if (pool.currentParticipants == pool.maxParticipants) {
            pool.status = PoolStatus.ACTIVE;
        }

        emit Events.PlayerJoined(_poolId, newPlayer.playerAddress);
    }

    function makeSelection(uint _poolId, PlayerChoice _choice) external poolExists(_poolId){
        Pool storage pool = pools[_poolId];
        Player storage player = pool.players[msg.sender];

        require(pool.status == PoolStatus.ACTIVE, "Pool has to be active");
        require(!player.isEliminated, "Player is eliminated");
        require(!pool.roundParticipation[pool.currentRound][msg.sender], "Already made a selection for this round");

        pool.roundParticipation[pool.currentRound][msg.sender] == true;
        pool.roundSelection[pool.currentRound][msg.sender] = _choice; 

        if (_choice == PlayerChoice.HEADS) {
            pool.headsCount[pool.currentRound]++;
        } 
        if (_choice == PlayerChoice.TAILS){
            pool.tailsCount[pool.currentRound]++;
        }

        // TODO - Check if all remaining players have made their choices 

        roundResult(_poolId, pool.currentRound); // or we check result in another function
    }

    function roundResult(uint _poolId, uint _round) internal poolExists(_poolId){
        Pool storage pool = pools[_poolId];
        require(pool.status == PoolStatus.ACTIVE, "Pool must be active");
        require(!pool.roundCompleted[_round], "Round already completed");

        uint headsCount = pool.headsCount[_round];
        uint tailsCount = pool.tailsCount[_round];

        PlayerChoice winningSelection;

        if(headsCount < tailsCount){
            winningSelection = PlayerChoice.HEADS;
        } 
        else if (tailsCount < headsCount){
            winningSelection = PlayerChoice.TAILS;
        } 
        else {
            // Chainlink VRF to solve the randomness of picking a winning selection
        }
        uint remainingPlayers = 0;
        for (uint i = 0; i < pool.playersInPool.length; i++){
            address playerAddressesInPool = pool.playersInPool[i];
            Player storage player = pool.players[playerAddressesInPool];

            if (!player.isEliminated && pool.roundParticipation[_round][playerAddressesInPool]) {
                if (pool.roundSelection[_round][playerAddressesInPool] != winningSelection) {
                    player.isEliminated = true;
                } else {
                    remainingPlayers++;
                }
            }
        }

        emit Events.RoundCompleted(_poolId, _round, winningSelection);

        if (remainingPlayers <= 1) {
            pool.status = PoolStatus.CLOSED;
            emit Events.PoolCompleted(_poolId, pool.prizePool);
        } else {
            pool.currentRound++;
        }
    }

    function getPoolInfo(uint256 _poolId) external view poolExists(_poolId) returns (
        uint entryFee,
        uint maxParticipants,
        uint currentParticipants,
        uint prizePool,
        uint currentRound,
        PoolStatus status
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.entryFee,
            pool.maxParticipants,
            pool.currentParticipants,
            pool.prizePool,
            pool.currentRound,
            pool.status
        );
    }

}
