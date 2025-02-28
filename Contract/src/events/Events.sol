// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../CoinToss.sol";

library Events {
    event PoolCreated(uint poolId, uint256 entryFee, uint256 maxParticipants);
    event PlayerJoined(uint poolId, address playerThatJoined);
    event RoundCompleted(uint poolId, uint round, CoinToss.PlayerChoice);
    event PoolCompleted(uint poolId, uint prizePool);
}

