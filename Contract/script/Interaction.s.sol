// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/CoinToss.sol"; 

contract CoinTossInteraction is Script {
    
    CoinToss public coinTossContract;
    address owner;
    address[] players;
    uint256 poolId;
    
    CoinToss.PlayerChoice constant HEADS = CoinToss.PlayerChoice.HEADS;
    CoinToss.PlayerChoice constant TAILS = CoinToss.PlayerChoice.TAILS;
    
    function setUp() public {
        owner = makeAddr("owner");
        
        for (uint i = 0; i < 20; i++) {
            players.push(makeAddr(string(abi.encodePacked("player", vm.toString(i)))));
        }
    }

    function run() public {
        vm.txGasPrice(0);
        vm.startBroadcast(owner);
        vm.deal(owner, 10 ether);
        
        console.log("Deploying CoinToss contract...");
        coinTossContract = new CoinToss();
        console.log("CoinToss deployed at:", address(coinTossContract));
        
        
        uint256 entryFee = 0.01 ether;
        uint256 maxParticipants = 20;
        console.log("Creating pool with entry fee:", entryFee, "and max participants:", maxParticipants);
        coinTossContract.createPool(entryFee, maxParticipants);
        poolId = 0; 
        vm.stopBroadcast();
        
    
        for (uint i = 0; i < players.length; i++) {
            vm.deal(players[i], 10 ether); 
        }
        
        
        console.log("\n--- Players joining the pool ---");
        for (uint i = 0; i < players.length; i++) {
            vm.startBroadcast(players[i]);
            console.log("Player", i, "joining pool...");
            coinTossContract.joinPool{value: entryFee}(poolId);
            vm.stopBroadcast();
        }
        
       
        (
            uint pEntryFee,
            uint pMaxParticipants,
            uint pCurrentParticipants,
            uint pPrizePool,
            uint pCurrentRound,
            CoinToss.PoolStatus pStatus,
            uint pMaxWinners,
            uint pCurrentActiveParticipants
        ) = coinTossContract.getPoolInfo(poolId);
        
        console.log("\n--- Pool Status After Joining ---");
        console.log("Entry Fee:", pEntryFee);
        console.log("Max Participants:", pMaxParticipants);
        console.log("Current Participants:", pCurrentParticipants);
        console.log("Prize Pool:", pPrizePool);
        console.log("Current Round:", pCurrentRound);
        console.log("Pool Status:", uint(pStatus)); 
        console.log("Max Winners:", pMaxWinners);
        console.log("Active Participants:", pCurrentActiveParticipants);
        
        uint currentRound = 1;
        bool gameCompleted = false;
        
        while (!gameCompleted) {
            console.log("\n--- Round", currentRound, "Selections ---");
            
            address[] memory activePlayers = getActivePlayers(poolId);
            console.log("Active players in round", currentRound, ":", activePlayers.length);
            
            if (activePlayers.length <= pMaxWinners) {
                console.log("Number of active players:", activePlayers.length);
                console.log("Max winners:", pMaxWinners);
                console.log("Game should complete after this round");
            }
            
           
            for (uint i = 0; i < activePlayers.length; i++) {
                vm.startBroadcast(activePlayers[i]);
                
              
                CoinToss.PlayerChoice choice = (i % 10 < 6) ? HEADS : TAILS;
                string memory choiceStr = (choice == HEADS) ? "HEADS" : "TAILS";
                
                console.log("Player at index", i, "address:", activePlayers[i]);
                console.log("Player selects", choiceStr);
                coinTossContract.makeSelection(poolId, choice);
                vm.stopBroadcast();
            }
            
          
            checkRoundResults(poolId, currentRound);
            
         
            (
                ,
                ,
                ,
                ,
                uint newRound,
                CoinToss.PoolStatus status,
                ,
                uint activeParticipants
            ) = coinTossContract.getPoolInfo(poolId);
            
            console.log("\n--- Pool Status After Round", currentRound, "---");
            console.log("Pool Status:", uint(status)); 
            console.log("Active Participants Remaining:", activeParticipants);
            console.log("Next Round:", newRound);
            
            if (status == CoinToss.PoolStatus.CLOSED) {
                gameCompleted = true;
            } else {
                currentRound = newRound;
            }
        }
        
       
        console.log("\n--- Game Complete, Claiming Prizes ---");
        address[] memory finalWinners = coinTossContract.getFinalWinners(poolId);
        
        (
            ,
            ,
            ,
            uint finalPrizePool,
            ,
            ,
            ,
            
        ) = coinTossContract.getPoolInfo(poolId);
        
        console.log("Final Prize Pool:", finalPrizePool);
        console.log("Number of Winners:", finalWinners.length);
        
        if (finalWinners.length > 0) {
            uint prizePerWinner = finalPrizePool / finalWinners.length;
            console.log("Prize per winner:", prizePerWinner);
            
            for (uint i = 0; i < finalWinners.length; i++) {
                vm.startBroadcast(finalWinners[i]);
                console.log("Winner", i, "address:", finalWinners[i]);
                
               
                for (uint j = 0; j < players.length; j++) {
                    if (finalWinners[i] == players[j]) {
                        console.log("This is original player", j);
                        break;
                    }
                }
                
                uint balanceBefore = address(finalWinners[i]).balance;
                coinTossContract.claimPrize(poolId);
                uint balanceAfter = address(finalWinners[i]).balance;
                console.log("Prize received:", balanceAfter - balanceBefore);
                vm.stopBroadcast();
            }
        }
    }
    
    function checkRoundResults(uint _poolId, uint _round) internal view {
        address[] memory winners = coinTossContract.getRoundWinners(_poolId, _round);
        address[] memory losers = coinTossContract.getRoundLosers(_poolId, _round);
        
        console.log("\n--- Round", _round, "Results ---");
        console.log("Number of Winners:", winners.length);
        for (uint i = 0; i < winners.length && i < 5; i++) {
            console.log("Winner", i, ":", winners[i]);
            
            
            for (uint j = 0; j < players.length; j++) {
                if (winners[i] == players[j]) {
                    console.log("This is original player", j);
                    break;
                }
            }
        }
        
        if (winners.length > 5) {
            console.log("...and", winners.length - 5, "more winners");
        }
        
        console.log("Number of Losers:", losers.length);
        for (uint i = 0; i < losers.length && i < 5; i++) {
            console.log("Loser", i, ":", losers[i]);
            
        
            for (uint j = 0; j < players.length; j++) {
                if (losers[i] == players[j]) {
                    console.log("This is original player", j);
                    break;
                }
            }
        }
        
        if (losers.length > 5) {
            console.log("...and", losers.length - 5, "more losers");
        }
    }
    
   
    function getActivePlayers(uint _poolId) internal view returns (address[] memory) {
        
        uint activeCount = 0;
        for (uint i = 0; i < players.length; i++) {
            (bool isParticipant, bool isEliminated, , ) = coinTossContract.getPlayerStatus(_poolId, players[i]);
            if (isParticipant && !isEliminated) {
                activeCount++;
            }
        }
        
       
        address[] memory activePlayers = new address[](activeCount);
        uint index = 0;
        for (uint i = 0; i < players.length; i++) {
            (bool isParticipant, bool isEliminated, , ) = coinTossContract.getPlayerStatus(_poolId, players[i]);
            if (isParticipant && !isEliminated) {
                activeCount++;
                if (index < activePlayers.length) {
                    activePlayers[index] = players[i];
                    index++;
                }
            }
        }
        
        return activePlayers;
    }
}