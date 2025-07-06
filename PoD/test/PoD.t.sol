// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/DEVToken.sol";
import "../src/Reputation.sol";
import "../src/FeePool.sol";
import "../src/IssueManagement.sol";
import "../src/PoDOracle.sol";

contract PodTest is Test {
    DEVToken devToken;
    Reputation reputation;
    FeePool feePool;
    IssueManagement issueManagement;
    PoDOracle oracle;

    address admin = address(1);
    address developer = address(2);
    address other = address(3);

    function setUp() public {
        vm.startPrank(admin);

        devToken = new DEVToken();
        reputation = new Reputation();
        feePool = new FeePool(address(devToken), address(reputation));
        issueManagement = new IssueManagement(admin);

        // Deploy oracle with references
        oracle = new PoDOracle(
            address(issueManagement),
            address(feePool),
            address(reputation)
        );

        // Setup permissions / ownerships
        devToken.setFeePool(address(feePool));
        devToken.setOracle(address(oracle));

        issueManagement.transferOwnership(address(oracle));
        feePool.setAdmin(address(oracle));
        reputation.setAdmin(address(feePool));

        vm.stopPrank();

        // Seed FeePool with DEV tokens from admin
        vm.prank(admin);
        devToken.transfer(address(feePool), 1_000 ether);
    }

    // --- DEVToken Tests ---

    function testMintAndSlash() public {
        uint256 mintAmount = 100 ether;
        string memory issueId = "repo/issues/1";

        vm.prank(address(feePool));
        devToken.mint(developer, mintAmount, issueId);
        assertEq(devToken.balanceOf(developer), mintAmount);
        assertEq(devToken.issueMintAmounts(issueId), mintAmount);

        uint256 slashAmount = 40 ether;
        vm.prank(address(oracle));
        devToken.slash(developer, slashAmount, issueId);
        assertEq(devToken.balanceOf(developer), mintAmount - slashAmount);
        assertEq(devToken.issueMintAmounts(issueId), mintAmount - slashAmount);
    }

    function test_RevertIf_NonFeePoolCallsMint() public {
        vm.prank(admin);
        vm.expectRevert("DEV: Not FeePool");
        devToken.mint(developer, 100 ether, "issue1");
    }

    function test_RevertIf_NonOracleCallsSlash() public {
        vm.prank(other);
        vm.expectRevert("DEV: Not Oracle");
        devToken.slash(developer, 10 ether, "issue1");
    }

    // --- Reputation Tests ---

    function testInitialReputation() public {
        uint256 rep = reputation.getReputation(developer);
        assertEq(rep, 100);
    }

    function testUpdateReputation() public {
        address newDev = address(10);

        // Prank as feePool contract which is admin now
        vm.prank(address(feePool));
        reputation.updateReputation(newDev, 5);

        assertEq(reputation.getReputation(newDev), 5); 
    }

    function test_RevertIf_NonAdminUpdatesReputation() public {
        vm.prank(developer);
        vm.expectRevert("Only admin");
        reputation.updateReputation(developer, 105);
    }

    // --- IssueManagement Tests ---

    function testCreateAssignUnassignCloseAndLinkPR() public {
        uint256 issueId = 1;
        string memory githubUrl = "https://github.com/repo/issues/1";

        vm.prank(address(oracle)); // oracle is owner/admin
        issueManagement.createIssue(issueId, githubUrl, IssueManagement.Difficulty.Medium);

        IssueManagement.Issue memory issue = issueManagement.getIssue(issueId);
        assertEq(issue.id, issueId);
        assertEq(uint(issue.status), uint(IssueManagement.Status.Open));

        vm.prank(address(oracle));
        issueManagement.assignDeveloper(issueId, developer);
        issue = issueManagement.getIssue(issueId);
        assertEq(issue.assignedDeveloper, developer);
        assertEq(uint(issue.status), uint(IssueManagement.Status.Assigned));

        vm.prank(address(oracle));
        issueManagement.unassignDeveloper(issueId);
        issue = issueManagement.getIssue(issueId);
        assertEq(issue.assignedDeveloper, address(0));
        assertEq(uint(issue.status), uint(IssueManagement.Status.Open));

        vm.prank(address(oracle));
        issueManagement.assignDeveloper(issueId, developer);

        string memory issueCID = "bafybeicidissue";
        vm.prank(address(oracle));
        issueManagement.closeIssueWithCID(issueId, issueCID);
        issue = issueManagement.getIssue(issueId);
        assertEq(uint(issue.status), uint(IssueManagement.Status.Closed));
        assertEq(issue.issueCID, issueCID);

        string memory prCID = "bafybeicidpr";
        vm.prank(address(oracle));
        issueManagement.linkMergedPR(issueId, prCID);
        issue = issueManagement.getIssue(issueId);
        assertEq(issue.prCID, prCID);
    }

    function test_RevertIf_DuplicateIssueCreated() public {
        vm.prank(address(oracle));
        issueManagement.createIssue(2, "url1", IssueManagement.Difficulty.Easy);

        vm.prank(address(oracle));
        vm.expectRevert("Issue ID exists");
        issueManagement.createIssue(2, "url2", IssueManagement.Difficulty.Hard);
    }

    function test_RevertIf_AssigningZeroAddress() public {
        vm.prank(address(oracle));
        issueManagement.createIssue(3, "url3", IssueManagement.Difficulty.Easy);

        vm.prank(address(oracle));
        vm.expectRevert("Invalid developer");
        issueManagement.assignDeveloper(3, address(0));
    }

    // --- FeePool Tests ---

    function testLockFeesAndRewardDeveloper() public {
        uint256 issueId = 4;
        uint256 amount = 200 ether;

        vm.prank(address(oracle));  // oracle is admin of FeePool
        feePool.lockFees(issueId, amount);
        assertEq(feePool.lockedFees(issueId), amount);

        vm.prank(address(oracle));
        feePool.rewardDeveloper(developer, issueId, FeePool.Difficulty.Medium);

        uint256 bal = devToken.balanceOf(developer);
        assertGt(bal, 0);
    }

    function test_RevertIf_NonAdminLocksFees() public {
        vm.prank(other);
        vm.expectRevert("Only admin");
        feePool.lockFees(5, 100 ether);
    }

    function test_RevertIf_NonAdminRewardsDeveloper() public {
        vm.prank(other);
        vm.expectRevert("Only admin");
        feePool.rewardDeveloper(developer, 4, FeePool.Difficulty.Easy);
    }

    function test_RevertIf_RewardingWithoutLockedFees() public {
        vm.prank(address(oracle));
        vm.expectRevert("No fees locked");
        feePool.rewardDeveloper(developer, 999, FeePool.Difficulty.Easy);
    }
}
