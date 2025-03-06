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
        uint maxWinners;
        uint currentActiveParticipants;
        mapping(uint => address[]) roundWinners;
        mapping(uint => address[]) roundLosers;
        address[] finalWinners;
        bool prizeClaimed;
    }

    struct PoolInfo {
        uint poolId;
        uint entryFee;
        uint maxParticipants;
        uint currentParticipants;
        uint prizePool;
        PoolStatus status;
    }

    uint16 public constant POINTS_FOR_JOINING = 10;
    uint16 public constant POINTS_FOR_ROUND_WIN = 25;
    uint16 public constant POINTS_FOR_FINAL_WIN = 100;


    uint public poolCount;
    mapping(uint => Pool) public pools;
    mapping(address => uint[]) public userPools;

    mapping(address => uint64) public playerPoints; // player points tracks
    // Pack multiple flags into a single storage slot using bitmaps
    // poolId => (player => bitmap of awarded points)
    mapping(uint256 => mapping(address => uint8)) private pointsAwarded;

    mapping(uint256 => mapping(uint256 => address[])) private roundWinners; // poolId => (round => players who won)
    
    
    

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

        if(_maxParticipants <= 10){
            newPool.maxWinners = _maxParticipants > 1 ? 2 : 1;
        }
        else {
            newPool.maxWinners = 3;
        }
        
        emit Events.PoolCreated(poolId, _entryFee, _maxParticipants);
    }

    function joinPool(uint _poolId) external payable poolExists(_poolId){
        Pool storage pool = pools[_poolId];
        require(pool.status == PoolStatus.OPENED, "The Pool is not yet opened for participation");
        require(msg.value >= pool.entryFee, "Entry fee is not met");
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

        userPools[msg.sender].push(_poolId);

        _awardJoiningPoints(_poolId, msg.sender);

        if (pool.currentParticipants == pool.maxParticipants) {
            pool.status = PoolStatus.ACTIVE;
            pool.currentActiveParticipants = pool.currentParticipants;
            emit Events.PoolActivated(_poolId);
        }

        emit Events.PlayerJoined(_poolId, msg.sender);
    }

    function makeSelection(uint _poolId, PlayerChoice _choice) external poolExists(_poolId){
        Pool storage pool = pools[_poolId];
        Player storage player = pool.players[msg.sender];

        require(pool.status == PoolStatus.ACTIVE, "Pool has to be active");
        require(!player.isEliminated, "Player is eliminated");
        require(!pool.roundParticipation[pool.currentRound][msg.sender], "Already made a selection for this round");

        pool.roundParticipation[pool.currentRound][msg.sender] = true;
        pool.roundSelection[pool.currentRound][msg.sender] = _choice; 

        if (_choice == PlayerChoice.HEADS) {
            pool.headsCount[pool.currentRound]++;
        } 
        if (_choice == PlayerChoice.TAILS){
            pool.tailsCount[pool.currentRound]++;
        }
        
        //Break early if any player hasn't made a selection yet
        for (uint i = 0; i < pool.playersInPool.length; i++) {
            address playerAddress = pool.playersInPool[i];
            if (!pool.players[playerAddress].isEliminated && 
                !pool.roundParticipation[pool.currentRound][playerAddress]) {
                // Found at least one player who hasn't made a selection yet
                // No need to check the rest of the players
                return;
            }
        }
        
        // If we reach here, all active players have made their selections
        roundResult(_poolId, pool.currentRound);
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
            winningSelection = PlayerChoice.HEADS;

        }

        delete pool.roundWinners[_round];
        delete pool.roundLosers[_round];

        uint remainingPlayers = 0;
        for (uint i = 0; i < pool.playersInPool.length; i++){
            address playerAddressInPool = pool.playersInPool[i];
            Player storage player = pool.players[playerAddressInPool];

            if (!player.isEliminated && pool.roundParticipation[_round][playerAddressInPool]) {
                if (pool.roundSelection[_round][playerAddressInPool] != winningSelection) {
                    player.isEliminated = true;
                    pool.currentActiveParticipants--;
                    pool.roundLosers[_round].push(playerAddressInPool);
                } else {
                    remainingPlayers++;
                    pool.roundWinners[_round].push(playerAddressInPool);
                    _awardRoundWinPoints(_poolId, _round, playerAddressInPool);
                }
            }
        }

        pool.roundCompleted[_round] = true;
        emit Events.RoundCompleted(_poolId, _round, winningSelection);
        emit Events.RoundWinners(_poolId, _round, pool.roundWinners[_round]);
        emit Events.RoundLosers(_poolId, _round, pool.roundLosers[_round]);


         if (remainingPlayers <= pool.maxWinners || remainingPlayers <= 1) {
            pool.status = PoolStatus.CLOSED;
            for (uint i = 0; i < pool.playersInPool.length; i++) {
                address playerAddress = pool.playersInPool[i];
                if (!pool.players[playerAddress].isEliminated) {
                pool.finalWinners.push(playerAddress);
                _awardFinalWinPoints(_poolId, playerAddress);
            }
    }
            emit Events.PoolCompleted(_poolId, pool.prizePool);
        } else {
            pool.currentRound++;
        }
    }

    function concludeRound(uint _poolId, uint _round) external onlyOwner {
        roundResult(_poolId, _round);
    }

    function getPoolInfo(uint256 _poolId) external view poolExists(_poolId) returns (
        uint entryFee,
        uint maxParticipants,
        uint currentParticipants,
        uint prizePool,
        uint currentRound,
        PoolStatus status,
        uint maxWinners,
        uint currentActiveParticipants
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.entryFee,
            pool.maxParticipants,
            pool.currentParticipants,
            pool.prizePool,
            pool.currentRound,
            pool.status,
            pool.maxWinners,
            pool.currentActiveParticipants
        );
    }

    function getRoundWinners(uint _poolId, uint _round) external view poolExists(_poolId) returns (address[] memory) {
        require(_round <= pools[_poolId].currentRound, "Round does not exist");
        return pools[_poolId].roundWinners[_round];
    }

   
    function getRoundLosers(uint _poolId, uint _round) external view poolExists(_poolId) returns (address[] memory) {
        require(_round <= pools[_poolId].currentRound, "Round does not exist");
        return pools[_poolId].roundLosers[_round];
    }

    function didPlayerWinRound(uint _poolId, uint _round, address _playerAddress) external view poolExists(_poolId) returns (bool) {
        require(_round <= pools[_poolId].currentRound, "Round does not exist");
        
        address[] memory winners = pools[_poolId].roundWinners[_round];
        for (uint i = 0; i < winners.length; i++) {
            if (winners[i] == _playerAddress) {
                return true; 
            }
        }
        return false;
    }

     function getFinalWinners(uint _poolId) external view poolExists(_poolId) returns (address[] memory) {
        require(pools[_poolId].status == PoolStatus.CLOSED, "Pool must be completed to get final winners");
        return pools[_poolId].finalWinners;
    }

   function isPlayerWinner(uint _poolId, address _player) public view poolExists(_poolId) returns (bool) {
        Pool storage pool = pools[_poolId];
        require(pool.status == PoolStatus.CLOSED, "Pool must be completed to determine winners");
        
        for (uint i = 0; i < pool.finalWinners.length; i++) {
            if (pool.finalWinners[i] == _player) {
                return true; 
            }
        }
        return false;
    }

    function claimPrize(uint _poolId) external poolExists(_poolId) {
        Pool storage pool = pools[_poolId];
        Player storage player = pool.players[msg.sender];
        
        require(pool.status == PoolStatus.CLOSED, "Pool must be completed to claim prize");
        require(isPlayerWinner(_poolId, msg.sender), "Only winners can claim prizes");
        require(!player.hasClaimed, "Prize already claimed");
        
        player.hasClaimed = true;
        
        uint prizeAmount = pool.prizePool / pool.finalWinners.length;

        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        require(success, "Prize transfer failed");
        
        emit Events.PrizeClaimed(_poolId, msg.sender, prizeAmount);
    }

    function getPlayerStatus(uint _poolId, address _player) external view poolExists(_poolId) returns (
        bool isParticipant,
        bool isEliminated,
        bool isWinner,
        bool hasClaimed
    ) {
        Pool storage pool = pools[_poolId];
        Player storage player = pool.players[_player];
        
        isParticipant = player.playerAddress != address(0);
        isEliminated = player.isEliminated;
        isWinner = pool.status == PoolStatus.CLOSED && isPlayerWinner(_poolId, _player);
        hasClaimed = player.hasClaimed;
        
        return (isParticipant, isEliminated, isWinner, hasClaimed);
    }

    function getAllPools() external view returns (PoolInfo[] memory) {
        PoolInfo[] memory allPools = new PoolInfo[](poolCount);
        for (uint i = 0; i < poolCount; i++) {
            Pool storage pool = pools[i];
            allPools[i] = PoolInfo({
                poolId: i,
                entryFee: pool.entryFee,
                maxParticipants: pool.maxParticipants,
                currentParticipants: pool.currentParticipants,
                prizePool: pool.prizePool,
                status: pool.status
            });
        }
        return allPools;
    }

    function getUserPools() external view returns (PoolInfo[] memory) {
        uint[] storage poolIds = userPools[msg.sender];
        PoolInfo[] memory userPoolInfo = new PoolInfo[](poolIds.length);

        for (uint i = 0; i < poolIds.length; i++) {
            uint poolId = poolIds[i];
            Pool storage pool = pools[poolId];
            
            userPoolInfo[i] = PoolInfo({
                poolId: poolId,
                entryFee: pool.entryFee,
                maxParticipants: pool.maxParticipants,
                currentParticipants: pool.currentParticipants,
                prizePool: pool.prizePool,
                status: pool.status
            });
        }

        return userPoolInfo;
    }

    function getUserPoolCount() external view returns (uint) {
        return userPools[msg.sender].length;
    }

    function hasUserJoinedPool(uint _poolId) external view returns (bool) {
        uint[] storage poolIds = userPools[msg.sender];
        
        for (uint i = 0; i < poolIds.length; i++) {
            if (poolIds[i] == _poolId) {
                return true; 
            }
        }
    
        return false;
    }

    function _awardJoiningPoints(uint _poolId, address _player) internal {
        // Check if bit 0 is set
        if (pointsAwarded[_poolId][_player] & 0x01 == 0) {
            playerPoints[_player] += POINTS_FOR_JOINING;
            // Set bit 0 to mark as awarded
            pointsAwarded[_poolId][_player] |= 0x01;
            emit Events.PointsAwarded(_player, POINTS_FOR_JOINING, 1); // 1 = joined
        }
    
    }

    function _awardRoundWinPoints(uint _poolId, uint256 _round, address _player) internal {
        // Add to winners array (which is already being maintained)
        // No need for duplicate storage
        playerPoints[_player] += POINTS_FOR_ROUND_WIN;
        emit Events.PointsAwarded(_player, POINTS_FOR_ROUND_WIN, 2); // 2 = round win
    }

    function _awardFinalWinPoints(uint256 _poolId, address _player) internal {
        // Check if bit 1 is set
        if (pointsAwarded[_poolId][_player] & 0x02 == 0) {
            playerPoints[_player] += POINTS_FOR_FINAL_WIN;
            // Set bit 1 to mark as awarded
            pointsAwarded[_poolId][_player] |= 0x02;
            emit Events.PointsAwarded(_player, POINTS_FOR_FINAL_WIN, 3); // 3 = final win
        }
    }

    function getPlayerPoints(address _player) external view returns (uint64) {
        return playerPoints[_player];
    }

    function getPlayerPointsHistory(address _player) external view returns (uint64 totalPoints, uint8 finalsWon) {
        totalPoints = playerPoints[_player];
        
        // Count final wins
        finalsWon = 0;
        for (uint i = 0; i < poolCount; i++) {
            if (pointsAwarded[i][_player] & 0x02 != 0) {
                finalsWon++;
            }
        }
        
        return (totalPoints, finalsWon);
    }
}
