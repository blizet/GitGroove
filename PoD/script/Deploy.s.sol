// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DEVToken.sol";
import "../src/Reputation.sol";
import "../src/FeePool.sol";
import "../src/IssueManagement.sol";
import "../src/PoDOracle.sol";

contract Deploy is Script {
    function run() external {
        address admin = msg.sender;

        vm.startBroadcast();

        // Deploy core contracts
        DEVToken devToken = new DEVToken();
        Reputation reputation = new Reputation();
        FeePool feePool = new FeePool(address(devToken), address(reputation));
        IssueManagement issueMgmt = new IssueManagement(admin);
        
        PoDOracle oracle = new PoDOracle(
            address(issueMgmt),
            address(feePool),
            address(reputation)
        );

        // Setup permissions
        devToken.setFeePool(address(feePool));
        devToken.setOracle(address(oracle));
        issueMgmt.transferOwnership(address(oracle));
        feePool.setAdmin(address(oracle));
        reputation.setAdmin(address(feePool));

        vm.stopBroadcast();

        console.log("DEVToken deployed at:", address(devToken));
        console.log("Reputation deployed at:", address(reputation));
        console.log("FeePool deployed at:", address(feePool));
        console.log("IssueManagement deployed at:", address(issueMgmt));
        console.log("PoDOracle deployed at:", address(oracle));
    }
}
