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
        
        uint256 entryFee2 = 0.05 ether;
        uint256 maxParticipants2 = 5;
        coinToss.createPool(entryFee2, maxParticipants2);
        console.log("Created Pool 1 with entry fee:", entryFee2, "and max participants:", maxParticipants2);
        
        uint256 entryFee3 = 0.1 ether;
        uint256 maxParticipants3 = 5;
        coinToss.createPool(entryFee3, maxParticipants3);
        console.log("Created Pool 2 with entry fee:", entryFee3, "and max participants:", maxParticipants3);

        uint256 entryFee4 = 1 ether;
        uint256 maxParticipants4 = 100;
        coinToss.createPool(entryFee4, maxParticipants4);
        console.log("Created Pool 3 with entry fee:", entryFee4, "and max participants:", maxParticipants4);
       
        uint256 entryFee5 = 1.5 ether;
        uint256 maxParticipants5 = 50;
        coinToss.createPool(entryFee5, maxParticipants5);
        console.log("Created Pool 4 with entry fee:", entryFee4, "and max participants:", maxParticipants5);
       
        uint256 entryFee6 = 0.5 ether;
        uint256 maxParticipants6 = 15;
        coinToss.createPool(entryFee6, maxParticipants6);
        console.log("Created Pool 5 with entry fee:", entryFee4, "and max participants:", maxParticipants6);

        uint256 entryFee7 = 0.03 ether;
        uint256 maxParticipants7 = 5;
        coinToss.createPool(entryFee7, maxParticipants7);
        console.log("Created Pool 6 with entry fee:", entryFee4, "and max participants:", maxParticipants7);
       
        vm.stopBroadcast();
    }
}
