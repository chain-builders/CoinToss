// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "../src/CoinToss.sol";

contract CoinTossTest is Test {

    CoinToss public coinToss;
    address public owner;
    address public jerry;
    address public annie;
    address public keneth;
    address public james;
    address public victory;

    uint public constant ENTRY_FEE = 0.01 ether;
    uint public constant MAX_PARTICIPANTS = 5;
    
    function setUp() public {
        // Setup accounts
        owner = address(this);
        jerry = makeAddr("jerry");
        annie = makeAddr("annie");
        keneth = makeAddr("keneth");
        james = makeAddr("james");
        victory = makeAddr("victory");

        coinToss = new CoinToss();

        vm.deal(jerry, 5 ether);
        vm.deal(annie, 5 ether);
        vm.deal(keneth, 5 ether);
        vm.deal(james, 5 ether);
        vm.deal(victory, 5 ether);
    }

    function test_CreatePool() public {
        coinToss.createPool(ENTRY_FEE, MAX_PARTICIPANTS);
        
        (uint entryFee, uint maxParticipants, uint currentParticipants, uint prizePool, 
         uint currentRound, CoinToss.PoolStatus status, uint maxWinners, uint currentActiveParticipants) = 
            coinToss.getPoolInfo(0);
            
        assertEq(entryFee, ENTRY_FEE);
        assertEq(maxParticipants, MAX_PARTICIPANTS);
        assertEq(currentParticipants, 0);
        assertEq(prizePool, 0);
        assertEq(currentRound, 1);
        assertEq(uint(status), uint(CoinToss.PoolStatus.OPENED));
        assertEq(maxWinners, 2); 
        assertEq(currentActiveParticipants, 0);
    }

    function test_JoinPool() public {
        coinToss.createPool(ENTRY_FEE, MAX_PARTICIPANTS);
   
        vm.startPrank(jerry);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        vm.stopPrank();

        (,, uint currentParticipants, uint prizePool,,,,) = coinToss.getPoolInfo(0);
        assertEq(currentParticipants, 1);
        assertEq(prizePool, ENTRY_FEE);
    }
    
    function test_MakeSelection() public {
       
        coinToss.createPool(ENTRY_FEE, 3); 
        
        vm.prank(jerry);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(annie);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(keneth);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
       
        (,,,,, CoinToss.PoolStatus status,,) = coinToss.getPoolInfo(0);
        assertEq(uint(status), uint(CoinToss.PoolStatus.ACTIVE));
        
        vm.prank(jerry);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        vm.prank(annie);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        (,,,, uint currentRound, CoinToss.PoolStatus statusAfterSelections,,) = coinToss.getPoolInfo(0);
        assertEq(uint(statusAfterSelections), uint(CoinToss.PoolStatus.ACTIVE));
        assertEq(currentRound, 1);
       
        vm.prank(keneth);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
        bool kenethWon = coinToss.didPlayerWinRound(0, 1, keneth);
        bool aliceWon = coinToss.didPlayerWinRound(0, 1, jerry);
        bool annieWon = coinToss.didPlayerWinRound(0, 1, annie);
        
        assertTrue(kenethWon, "keneth should win ");
        assertFalse(aliceWon, "Alice should lose ");
        assertFalse(annieWon, "annie should lose ");
        
        (,,,, uint newRound, CoinToss.PoolStatus newStatus,,) = coinToss.getPoolInfo(0);
        assertEq(uint(newStatus), uint(CoinToss.PoolStatus.CLOSED));
        
        address[] memory finalWinners = coinToss.getFinalWinners(0);
        assertEq(finalWinners.length, 1);
        assertEq(finalWinners[0], keneth);
    }
    
    function test_ClaimPrize() public {
        coinToss.createPool(ENTRY_FEE, 3);
        
        vm.prank(jerry);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(annie);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(keneth);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(jerry);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        vm.prank(annie);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        vm.prank(keneth);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
        

        (,,, uint prizePool,,,,) = coinToss.getPoolInfo(0);
        assertEq(prizePool, ENTRY_FEE * 3);
        
        uint kenethBalanceBefore = keneth.balance;
    
        vm.prank(keneth);
        coinToss.claimPrize(0);
        
       
        uint kenethBalanceAfter = keneth.balance;
        assertEq(kenethBalanceAfter, kenethBalanceBefore + prizePool);
        
        (bool isParticipant, bool isEliminated, bool isWinner, bool hasClaimed) = coinToss.getPlayerStatus(0, keneth);
        assertTrue(isParticipant);
        assertFalse(isEliminated);
        assertTrue(isWinner);
        assertTrue(hasClaimed);
        
        
        vm.expectRevert("Prize already claimed");
        vm.prank(keneth);
        coinToss.claimPrize(0);
    }
    
    /*
        I am still looking into testing for multiple rounds
     */
    // function test_PoolWithMultipleRounds() public {
        
    //     coinToss.createPool(ENTRY_FEE, 4);
        
    //     vm.prank(jerry);
    //     coinToss.joinPool{value: ENTRY_FEE}(0);
        
    //     vm.prank(annie);
    //     coinToss.joinPool{value: ENTRY_FEE}(0);
        
    //     vm.prank(keneth);
    //     coinToss.joinPool{value: ENTRY_FEE}(0);
        
    //     vm.prank(james);
    //     coinToss.joinPool{value: ENTRY_FEE}(0);
        
    //     vm.prank(jerry);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
    //     vm.prank(annie);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
    //     vm.prank(keneth);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
    //     vm.prank(james);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
       
    //     (,,,, uint currentRound,,,) = coinToss.getPoolInfo(0);
    //     assertEq(currentRound, 2); 
        
    //     bool aliceWonRound1 = coinToss.didPlayerWinRound(0, 1, jerry);
    //     bool kenethWonRound1 = coinToss.didPlayerWinRound(0, 1, keneth);
    //     assertTrue(aliceWonRound1, "Alice should win round 1 ");
    //     assertFalse(kenethWonRound1, "keneth should lose round 1");
        
        
    //     vm.prank(jerry);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
    //     vm.prank(annie);
    //     coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
    //     bool annieWonRound2 = coinToss.didPlayerWinRound(0, 2, annie);
    //     bool aliceWonRound2 = coinToss.didPlayerWinRound(0, 2, jerry);
    //     assertTrue(annieWonRound2, "annie should win round 2 ");
    //     assertFalse(aliceWonRound2, "Alice should lose round 2 ");
        
    //     (,,,,,CoinToss.PoolStatus status,,) = coinToss.getPoolInfo(0);
    //     assertEq(uint(status), uint(CoinToss.PoolStatus.CLOSED));
        
    //     address[] memory finalWinners = coinToss.getFinalWinners(0);
    //     assertEq(finalWinners.length, 1);
    //     assertEq(finalWinners[0], annie);
    // }
    
    function testRevert_JoinClosedPool() public {
        
        coinToss.createPool(ENTRY_FEE, 2);
        
        vm.prank(jerry);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(annie);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(keneth);
        coinToss.joinPool{value: ENTRY_FEE}(0);
    }
    
    function testRevert_NonWinnerClaimPrize() public {
        
        coinToss.createPool(ENTRY_FEE, 3);
        
        vm.prank(jerry);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(annie);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(keneth);
        coinToss.joinPool{value: ENTRY_FEE}(0);
        
        vm.prank(jerry);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        vm.prank(annie);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.HEADS);
        
        vm.prank(keneth);
        coinToss.makeSelection(0, CoinToss.PlayerChoice.TAILS);
        
        vm.prank(jerry);
        coinToss.claimPrize(0);
    }

    function testGetAllPools() public {
        
        vm.prank(owner);
        coinToss.createPool(1 ether, 10); 
        vm.prank(owner);
        coinToss.createPool(0.5 ether, 5); 

        
        CoinToss.PoolInfo[] memory allPools = coinToss.getAllPools();

       
        assertEq(allPools.length, 2, "Incorrect number of pools");

        
        assertEq(allPools[0].poolId, 0, "Incorrect pool ID for Pool 0");
        assertEq(allPools[0].entryFee, 1 ether, "Incorrect entry fee for Pool 0");
        assertEq(allPools[0].maxParticipants, 10, "Incorrect max participants for Pool 0");
        assertEq(allPools[0].currentParticipants, 0, "Incorrect current participants for Pool 0");
        assertEq(allPools[0].prizePool, 0, "Incorrect prize pool for Pool 0");
        assertEq(uint(allPools[0].status), uint(CoinToss.PoolStatus.OPENED), "Incorrect status for Pool 0");

        assertEq(allPools[1].poolId, 1, "Incorrect pool ID for Pool 1");
        assertEq(allPools[1].entryFee, 0.5 ether, "Incorrect entry fee for Pool 1");
        assertEq(allPools[1].maxParticipants, 5, "Incorrect max participants for Pool 1");
        assertEq(allPools[1].currentParticipants, 0, "Incorrect current participants for Pool 1");
        assertEq(allPools[1].prizePool, 0, "Incorrect prize pool for Pool 1");
        assertEq(uint(allPools[1].status), uint(CoinToss.PoolStatus.OPENED), "Incorrect status for Pool 1");
    }

     function testJoinPoolAndRetrieveUserPools() public {
        vm.prank(owner);
        coinToss.createPool(0.1 ether, 10);
        vm.prank(owner);
        coinToss.createPool(0.2 ether, 5);
        vm.prank(owner);
        coinToss.createPool(0.3 ether, 8);

        vm.prank(jerry);
        coinToss.joinPool{value: 0.1 ether}(0);
        
        vm.prank(jerry);
        coinToss.joinPool{value: 0.2 ether}(1);

        vm.prank(jerry);
        CoinToss.PoolInfo[] memory userPools = coinToss.getUserPools();

        assertEq(userPools.length, 2, "User should have joined 2 pools");
        assertEq(userPools[0].poolId, 0, "First pool ID should match");
        assertEq(userPools[1].poolId, 1, "Second pool ID should match");
        assertEq(userPools[0].entryFee, 0.1 ether, "Entry fee should match first pool");
        assertEq(userPools[1].entryFee, 0.2 ether, "Entry fee should match second pool");
    }

    function testUserPoolCount() public {
       
        vm.prank(owner);
        coinToss.createPool(0.1 ether, 10);
        vm.prank(owner);
        coinToss.createPool(0.2 ether, 5);
        vm.prank(owner);
        coinToss.createPool(0.3 ether, 8);

        
        vm.prank(jerry);
        coinToss.joinPool{value: 0.1 ether}(0);
        
        vm.prank(jerry);
        coinToss.joinPool{value: 0.2 ether}(1);

        vm.prank(jerry);
        uint poolCount = coinToss.getUserPoolCount();

        assertEq(poolCount, 2, "User should have joined 2 pools");
    }

    function testHasUserJoinedPool() public {
        
        vm.prank(owner);
        coinToss.createPool(0.1 ether, 10);
        vm.prank(owner);
        coinToss.createPool(0.2 ether, 5);

        
        vm.prank(jerry);
        coinToss.joinPool{value: 0.1 ether}(0);

        vm.prank(jerry);
        bool hasJoinedFirstPool = coinToss.hasUserJoinedPool(0);
        
        vm.prank(jerry);
        bool hasJoinedSecondPool = coinToss.hasUserJoinedPool(1);

        assertTrue(hasJoinedFirstPool, "User should have joined first pool");
        assertFalse(hasJoinedSecondPool, "User should not have joined second pool");
    }

    function testCannotJoinPoolTwice() public {
       
        vm.prank(owner);
        coinToss.createPool(0.1 ether, 10);

        vm.prank(jerry);
        coinToss.joinPool{value: 0.1 ether}(0);

        vm.expectRevert("Player has already joined this pool");
        vm.prank(jerry);
        coinToss.joinPool{value: 0.1 ether}(0);
    }

}