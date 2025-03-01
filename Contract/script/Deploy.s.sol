// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {CoinToss} from "../src/CoinToss.sol";

contract CoinTossScript is Script {
    CoinToss public coinToss;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        coinToss = new CoinToss();

        vm.stopBroadcast();
    }
}
