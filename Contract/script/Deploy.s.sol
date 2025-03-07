// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CoinToss} from "../src/CoinToss.sol";

contract CoinTossScript is Script {
    CoinToss public coinToss;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        
        coinToss = new CoinToss();
        
        console.log("CoinToss deployed to:", address(coinToss));

    
        uint256 entryFee1 = 0.01 ether;
        uint256 maxParticipants1 = 5;
        coinToss.createPool(entryFee1, maxParticipants1);
        console.log("Created Pool 0 with entry fee:", entryFee1, "and max participants:", maxParticipants1);
        
        uint256 entryFee2 = 0.02 ether;
        uint256 maxParticipants2 = 10;
        coinToss.createPool(entryFee2, maxParticipants2);
        console.log("Created Pool 1 with entry fee:", entryFee2, "and max participants:", maxParticipants2);
        
        uint256 entryFee3 = 2 ether;
        uint256 maxParticipants3 = 20;
        coinToss.createPool(entryFee3, maxParticipants3);
        console.log("Created Pool 2 with entry fee:", entryFee3, "and max participants:", maxParticipants3);

        uint256 entryFee4 = 10 ether;
        uint256 maxParticipants4 = 100;
        coinToss.createPool(entryFee4, maxParticipants4);
        console.log("Created Pool 3 with entry fee:", entryFee4, "and max participants:", maxParticipants4);
       
        uint256 entryFee5 = 5 ether;
        uint256 maxParticipants5 = 50;
        coinToss.createPool(entryFee5, maxParticipants5);
        console.log("Created Pool 4 with entry fee:", entryFee4, "and max participants:", maxParticipants5);
       
        uint256 entryFee6 = 0.02 ether;
        uint256 maxParticipants6 = 10;
        coinToss.createPool(entryFee6, maxParticipants6);
        console.log("Created Pool 5 with entry fee:", entryFee4, "and max participants:", maxParticipants6);

        uint256 entryFee7 = 0.03 ether;
        uint256 maxParticipants7 = 5;
        coinToss.createPool(entryFee7, maxParticipants7);
        console.log("Created Pool 6 with entry fee:", entryFee4, "and max participants:", maxParticipants7);

        uint256 entryFee8 = 0.03 ether;
        uint256 maxParticipants8 = 3;
        coinToss.createPool(entryFee8, maxParticipants8);
        console.log("Created Pool 7 with entry fee:", entryFee8, "and max participants:", maxParticipants8);

        uint256 entryFee9 = 0.01 ether;
        uint256 maxParticipants9 = 5;
        coinToss.createPool(entryFee9, maxParticipants9);
        console.log("Created Pool 8 with entry fee:", entryFee9, "and max participants:", maxParticipants9);

        uint256 entryFee10 = 0.01 ether;
        uint256 maxParticipants10 = 3;
        coinToss.createPool(entryFee10, maxParticipants10);
        console.log("Created Pool 9 with entry fee:", entryFee10, "and max participants:", maxParticipants10);

        uint256 entryFee11 = 0.022 ether;
        uint256 maxParticipants11 = 5;
        coinToss.createPool(entryFee11, maxParticipants11);
        console.log("Created Pool 10 with entry fee:", entryFee11, "and max participants:", maxParticipants11);

        uint256 entryFee12 = 0.03 ether;
        uint256 maxParticipants12 = 5;
        coinToss.createPool(entryFee12, maxParticipants12);
        console.log("Created Pool 11 with entry fee:", entryFee12, "and max participants:", maxParticipants12);

        uint256 entryFee13 = 0.01 ether;
        uint256 maxParticipants13 = 6;
        coinToss.createPool(entryFee13, maxParticipants13);
        console.log("Created Pool 12 with entry fee:", entryFee13, "and max participants:", maxParticipants13);

        uint256 entryFee14 = 0.02 ether;
        uint256 maxParticipants14 = 5;
        coinToss.createPool(entryFee14, maxParticipants14);
        console.log("Created Pool 13 with entry fee:", entryFee14, "and max participants:", maxParticipants14);
       
        vm.stopBroadcast();
    }
}
