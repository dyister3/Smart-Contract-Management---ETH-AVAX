// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    address public owner;
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += amount;
        totalSupply += amount; // Update total supply
        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Withdraw amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        totalSupply -= amount; // Update total supply after withdrawal

        emit Withdraw(msg.sender, amount);
    }

    function withdrawHalfBalance() external {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        uint256 amountToWithdraw = balance / 2;
        balances[msg.sender] -= amountToWithdraw * 2; // Correct deduction
        payable(msg.sender).transfer(amountToWithdraw);
        totalSupply -= amountToWithdraw; // Update total supply after half withdrawal

        emit Withdraw(msg.sender, amountToWithdraw);
    }

    function transfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid receiver address");
        require(amount > 0, "Transfer amount must be greater than zero");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }

    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function resetBalance() external onlyOwner {
        uint256 ownerBalance = balances[owner];
        require(ownerBalance > 0, "Owner balance is already zero");

        totalSupply -= ownerBalance; // Deduct owner's balance from total supply
        payable(owner).transfer(ownerBalance);
        balances[owner] = 0;

        emit Withdraw(owner, ownerBalance);
    }
}