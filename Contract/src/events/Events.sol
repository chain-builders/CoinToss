// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../CoinToss.sol";

library Events {
    event PoolCreated(uint poolId, uint256 entryFee, uint256 maxParticipants);
    event PlayerJoined(uint poolId, address playerThatJoined);
    event PoolActivated(uint poolId);
    event RoundCompleted(uint poolId, uint round, CoinToss.PlayerChoice winningSelection);
    event PoolCompleted(uint poolId, uint prizePool);
    event RoundWinners(uint poolId, uint round, address[] roundWinners);
    event RoundLosers(uint poolId, uint round, address[] roundWinners);
    event PrizeClaimed(uint poolId, address player, uint prizeAmount);
    event PointsAwarded(address player, uint16 points, uint8 reason);
    event AllPlayersEliminated(uint poolId, uint round);
    event PreviousRoundWinnersSelected(uint poolId, uint previousRound);
    event AllPlayersEliminatedFirstRound(uint poolId);
    event EntryFeesRefunded(uint poolId);
}

