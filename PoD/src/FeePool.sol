// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Reputation.sol";

contract FeePool {
    using SafeERC20 for IERC20;
    
    IERC20 public devToken;
    Reputation public reputation;
    address public admin;
    
    enum Difficulty { Easy, Medium, Hard }
    
    mapping(uint256 => uint256) public lockedFees;

    event RewardPaid(address indexed developer, uint256 reward, uint256 issueId);
    event FeesLocked(uint256 indexed issueId, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _devToken, address _reputation) {
        devToken = IERC20(_devToken);
        reputation = Reputation(_reputation);
        admin = msg.sender;
    }

    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        admin = newAdmin;
    }

    function lockFees(uint256 issueId, uint256 amount) external onlyAdmin {
        require(amount > 0, "Amount zero");
        lockedFees[issueId] += amount;
        emit FeesLocked(issueId, amount);
    }

    function rewardDeveloper(address developer, uint256 issueId, Difficulty difficulty) external onlyAdmin {
        uint256 lockedAmount = lockedFees[issueId];
        require(lockedAmount > 0, "No fees locked");

        uint256 multiplier = (difficulty == Difficulty.Easy ? 1 :
                            difficulty == Difficulty.Medium ? 2 : 4);
        
        uint256 repScore = reputation.getReputation(developer);
        uint256 reward = (lockedAmount * multiplier * repScore) / 400;

        require(reward <= lockedAmount, "Reward exceeds locked fees");
        lockedFees[issueId] -= reward;
        devToken.safeTransfer(developer, reward);
        reputation.updateReputation(developer, 1);
        emit RewardPaid(developer, reward, issueId);
    }
}