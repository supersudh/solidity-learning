// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Structs1 {
    struct User {
        string name;
        uint256 age;
        string about;
    }

    mapping(address => User) public users;

    User[] public usersList;

    function addUser(
        string memory name,
        uint256 age,
        string memory about
    ) public returns (string memory) {
      address from = msg.sender;
      users[from].name = name;
      users[from].age = age;
      users[from].about = about;
      usersList.push(User({
        name: name,
        age: age,
        about: about
      }));
      return users[from].name;
    }

    function getUser(
      address userAddress
    ) public view returns (string memory) {
      return users[userAddress].name;
    }
}
