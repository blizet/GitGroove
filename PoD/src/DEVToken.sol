// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract DEVToken is ERC20 {
    address public feePool;
    address public oracle;
    uint256 public maxSupply = 1_000_000_000 * 10**18; // 1 billion tokens

    // Track minted amounts per issue ID (like "owner/repo/issues/2")
    mapping(string => uint256) public issueMintAmounts;

    event TokensMinted(address indexed to, uint256 amount, string issueId);
    event FeePoolUpdated(address newFeePool);
    event OracleUpdated(address newOracle);

    constructor() ERC20("Developer Token", "DEV") {
        _mint(msg.sender, 100_000_000 * 10**18); // Initial distribution (10%)
    }

    function setFeePool(address _feePool) external {
        require(feePool == address(0) || msg.sender == feePool, "DEV: Unauthorized");
        require(_feePool != address(0), "DEV: Zero address");
        feePool = _feePool;
        emit FeePoolUpdated(_feePool);
    }

    function setOracle(address _oracle) external {
        require(oracle == address(0) || msg.sender == oracle, "DEV: Unauthorized");
        require(_oracle != address(0), "DEV: Zero address");
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    /// @notice Mint tokens to developer for verified contributions
    /// @dev Temporarily unrestricted for testing — REMOVE before production
    function mint(
        address to,
        uint256 amount,
        string memory issueId
    ) external {
        require(totalSupply() + amount <= maxSupply, "DEV: Max supply exceeded");
        require(bytes(issueId).length > 0, "DEV: Empty issue ID");

        _mint(to, amount);
        issueMintAmounts[issueId] += amount;

        emit TokensMinted(to, amount, issueId);
    }

    /// @notice Oracle can slash tokens for fraudulent contributions
    function slash(
        address from,
        uint256 amount,
        string memory issueId
    ) external {
        require(msg.sender == oracle, "DEV: Not Oracle");
        _burn(from, amount);
        if (issueMintAmounts[issueId] >= amount) {
            issueMintAmounts[issueId] -= amount;
        }
    }
}
