// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IssueManagement.sol";
import "./FeePool.sol";
import "./Reputation.sol";

contract PoDOracle {
    address public admin;
    IssueManagement public issueManagement;
    FeePool public feePool;
    Reputation public reputation;

    event PoDValidated(
        uint256 indexed issueId, 
        bytes32 indexed l2TxHash,
        address indexed developer,
        uint256 rewardAmount
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(
        address _issueManagement,
        address _feePool,
        address _reputation
    ) {
        admin = msg.sender;
        issueManagement = IssueManagement(_issueManagement);
        feePool = FeePool(_feePool);
        reputation = Reputation(_reputation);
    }

    function validateContribution(
        uint256 issueId,
        bytes32 l2TxHash,
        address developer
    ) external onlyAdmin {
        IssueManagement.Issue memory issue = issueManagement.getIssue(issueId);
        require(issue.status == IssueManagement.Status.Open, "Issue not open");

        uint256 feesLocked = feePool.lockedFees(issueId);
        require(feesLocked > 0, "No fees locked");

        // Convert difficulty enum
        FeePool.Difficulty feePoolDifficulty;
        if (issue.difficulty == IssueManagement.Difficulty.Easy) {
            feePoolDifficulty = FeePool.Difficulty.Easy;
        } else if (issue.difficulty == IssueManagement.Difficulty.Medium) {
            feePoolDifficulty = FeePool.Difficulty.Medium;
        } else {
            feePoolDifficulty = FeePool.Difficulty.Hard;
        }

        uint256 repScore = reputation.getReputation(developer);
        uint256 reward = (feesLocked * uint256(feePoolDifficulty) * repScore) / 100;

        feePool.rewardDeveloper(developer, issueId, feePoolDifficulty);
        issueManagement.assignDeveloper(issueId, developer);
        issueManagement.linkTxToIssue(l2TxHash, issueId);

        emit PoDValidated(issueId, l2TxHash, developer, reward);
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        admin = newAdmin;
    }
}