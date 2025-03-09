// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CoinToss} from "../src/CoinToss.sol";

contract DeployInteractionScript is Script {
    address constant CONTRACT_ADDRESS = 0x9f10AA66C96E71499E0FEA03A785B36c2b5d48fD;
    CoinToss public coinToss;
    
    function setUp() public {}
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        coinToss = CoinToss(CONTRACT_ADDRESS);
        console.log("Connected to CoinToss at:", address(coinToss));
        
        uint256 entryFee1 = 0.1 ether;
        uint256 maxParticipants1 = 3;
        coinToss.createPool(entryFee1, maxParticipants1);
        console.log("Created Pool with entry fee:", entryFee1, "and max participants:", maxParticipants1);
        
        uint256 entryFee2 = 0.02 ether;
        uint256 maxParticipants2 = 3;
        coinToss.createPool(entryFee2, maxParticipants2);
        console.log("Created Pool with entry fee:", entryFee2, "and max participants:", maxParticipants2);
        
        uint256 entryFee3 = 0.02 ether;
        uint256 maxParticipants3 = 6;
        coinToss.createPool(entryFee3, maxParticipants3);
        console.log("Created Pool with entry fee:", entryFee3, "and max participants:", maxParticipants3);

        uint256 entryFee4 = 0.01 ether;
        uint256 maxParticipants4 =3;
        coinToss.createPool(entryFee4, maxParticipants4);
        console.log("Created Pool with entry fee:", entryFee4, "and max participants:", maxParticipants4);

        uint256 entryFee5 = 0.01 ether;
        uint256 maxParticipants5 = 4;
        coinToss.createPool(entryFee5, maxParticipants5);
        console.log("Created Pool with entry fee:", entryFee5, "and max participants:", maxParticipants5);

        uint256 entryFee6 = 0.02 ether;
        uint256 maxParticipants6 = 3;
        coinToss.createPool(entryFee6, maxParticipants6);
        console.log("Created Pool with entry fee:", entryFee6, "and max participants:", maxParticipants6);

        uint256 entryFee7 = 0.011 ether;
        uint256 maxParticipants7 = 3;
        coinToss.createPool(entryFee7, maxParticipants7);
        console.log("Created Pool with entry fee:", entryFee7, "and max participants:", maxParticipants7);
        
        vm.stopBroadcast();
    }
}