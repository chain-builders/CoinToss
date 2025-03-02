// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import "../src/CoinToss.sol";

contract CoinTossTest is Test {

    CoinToss public coinToss;
    address public owner;
    address public alice;
    address public bob;

    uint public constant ENTRY_FEE = 0.01 ether;
    uint public constant MAX_PARTICIPANTS = 5;
    
    
    function setUp() public {

        // Setup accounts
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        coinToss = new CoinToss();

        vm.deal(alice, 5 ether);
        vm.deal(bob, 5 ether);

        
    }

    function test_CreatePool() public {
        coinToss.createPool(ENTRY_FEE, MAX_PARTICIPANTS);
        coinToss.createPool(ENTRY_FEE, MAX_PARTICIPANTS);
        (uint entryFee, uint maxParticipants, uint currentParticipants, uint prizePool, uint currentRound, CoinToss.PoolStatus status) = 
            coinToss.getPoolInfo(1);
        assertEq(entryFee, ENTRY_FEE);
        assertEq(maxParticipants, MAX_PARTICIPANTS);
        assertEq(currentParticipants, 0);
        assertEq(prizePool, 0);
        assertEq(currentRound, 1);
        assertEq(uint(status), uint(CoinToss.PoolStatus.OPENED));
    }

    function test_JoinPool() public {

        coinToss.createPool(ENTRY_FEE, MAX_PARTICIPANTS);
   
    
        vm.startPrank(alice);
        coinToss.joinPool{value: ENTRY_FEE}(0);

        (, , uint currentParticipants, uint prizePool, , ) = coinToss.getPoolInfo(0);
        assertEq(currentParticipants, 1);
        assertEq(prizePool, ENTRY_FEE);
    
        vm.stopPrank();
    
    }
}