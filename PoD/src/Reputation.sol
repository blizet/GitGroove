// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Reputation {
    mapping(address => uint256) private reputations;
    address public admin;

    event ReputationUpdated(address indexed developer, uint256 newScore);
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    function updateReputation(address developer, uint256 increment) external onlyAdmin {
        reputations[developer] += increment;
        emit ReputationUpdated(developer, reputations[developer]);
    }

    function getReputation(address developer) external view returns (uint256) {
        // Minimum default reputation of 100
        return reputations[developer] == 0 ? 100 : reputations[developer];
    }

    // Allow changing admin (e.g., to FeePool) to enable updates from FeePool contract
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminChanged(oldAdmin, newAdmin);
    }
}
