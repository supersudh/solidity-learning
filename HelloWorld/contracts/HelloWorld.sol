// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract HelloWorld {
    uint256 storedData;
    bytes32 public name;

    function set(uint256 _storedData) public {
        storedData = _storedData;
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function hi() public pure returns (int256) {
        return 42;
    }

    function test() public view returns (uint256 res) {
        address myAddress = address(this);
        res = myAddress.balance;
    }

    function setName(bytes32 _name) external {
        name = _name;
    }

    function getTimeStamp() public view returns (uint256) {
        return block.timestamp;
    }
}
