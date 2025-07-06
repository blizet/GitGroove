// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract IssueManagement is Ownable {
    enum Difficulty { Easy, Medium, Hard }
    enum Status { Open, Assigned, Closed }

    struct Issue {
        uint256 id;
        string githubUrl;
        Difficulty difficulty;
        Status status;
        address assignedDeveloper;
        string issueCID;
        string prCID;
    }

    mapping(uint256 => Issue) private issues;
    mapping(uint256 => bool) private issueExists;
    mapping(bytes32 => uint256) public txToIssueId;

    // Events
    event IssueCreated(uint256 indexed id);
    event DeveloperAssigned(uint256 indexed id, address developer);
    event IssueUnassigned(uint256 indexed id);
    event IssueClosed(uint256 indexed id, string cid);
    event PRLinked(uint256 indexed id, string prCID);
    event TxLinked(uint256 indexed id, bytes32 txHash);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createIssue(uint256 issueId, string memory githubUrl, Difficulty difficulty) external onlyOwner {
        require(!issueExists[issueId], "Issue ID exists");
        issues[issueId] = Issue({
            id: issueId,
            githubUrl: githubUrl,
            difficulty: difficulty,
            status: Status.Open,
            assignedDeveloper: address(0),
            issueCID: "",
            prCID: ""
        });
        issueExists[issueId] = true;
        emit IssueCreated(issueId);
    }

    function assignDeveloper(uint256 issueId, address developer) external onlyOwner {
        require(issueExists[issueId], "Issue doesn't exist");
        require(developer != address(0), "Invalid developer");
        Issue storage issue = issues[issueId];
        require(issue.status == Status.Open, "Issue must be open");

        issue.assignedDeveloper = developer;
        issue.status = Status.Assigned;
        emit DeveloperAssigned(issueId, developer);
    }

    function unassignDeveloper(uint256 issueId) external onlyOwner {
        require(issueExists[issueId], "Issue doesn't exist");
        Issue storage issue = issues[issueId];
        require(issue.status == Status.Assigned, "Not assigned");

        issue.assignedDeveloper = address(0);
        issue.status = Status.Open;
        emit IssueUnassigned(issueId);
    }

    function closeIssueWithCID(uint256 issueId, string calldata issueCID) external onlyOwner {
        require(issueExists[issueId], "Issue doesn't exist");
        Issue storage issue = issues[issueId];
        require(issue.status != Status.Closed, "Already closed");
        require(bytes(issueCID).length > 0, "Empty CID");

        issue.status = Status.Closed;
        issue.issueCID = issueCID;
        emit IssueClosed(issueId, issueCID);
    }

    function linkMergedPR(uint256 issueId, string calldata prCID) external onlyOwner {
        require(issueExists[issueId], "Issue doesn't exist");
        Issue storage issue = issues[issueId];
        require(issue.status == Status.Closed, "Issue not closed");
        require(bytes(prCID).length > 0, "Empty PR CID");

        issue.prCID = prCID;
        emit PRLinked(issueId, prCID);
    }

    function linkTxToIssue(bytes32 txHash, uint256 issueId) external onlyOwner {
        require(issueExists[issueId], "Issue doesn't exist");
        require(txToIssueId[txHash] == 0, "Tx already linked");
        txToIssueId[txHash] = issueId;
        emit TxLinked(issueId, txHash);
    }

    function getIssue(uint256 issueId) external view returns (Issue memory) {
        require(issueExists[issueId], "Issue doesn't exist");
        return issues[issueId];
    }
}