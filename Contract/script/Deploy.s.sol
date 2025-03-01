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
        uint256 maxParticipants2 = 10;
        coinToss.createPool(entryFee2, maxParticipants2);
        console.log("Created Pool 1 with entry fee:", entryFee2, "and max participants:", maxParticipants2);
        
        uint256 entryFee3 = 0.1 ether;
        uint256 maxParticipants3 = 20;
        coinToss.createPool(entryFee3, maxParticipants3);
        console.log("Created Pool 2 with entry fee:", entryFee3, "and max participants:", maxParticipants3);
       
        vm.stopBroadcast();
    }
}
