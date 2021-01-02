// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract ReceiverPays {
    address public owner;
    mapping(uint256 => bool) public nonceMap;

    event ClaimedPayment(address claimer, uint256 value);

    constructor() payable {
        owner = msg.sender;
    }

    function getContractBalance() public view returns (uint256) {
        return payable(address(this)).balance;
    }

    function claimPayment(
        bytes memory signature,
        uint256 nonce,
        uint256 amount
    ) public {
        require(!nonceMap[nonce], "Duplicate Nonce!");
        nonceMap[nonce] = true;
        bytes32 message =
            prefixed(
                keccak256(abi.encodePacked(msg.sender, amount, nonce, this))
            );
        require(
            computeSigner(message, signature) == owner,
            "Unable to Authorize"
        );
        payable(msg.sender).transfer(amount);
    }

    function shutdown() public {
        require(msg.sender == owner);
        selfdestruct(payable(msg.sender));
    }

    // To recover signer/address that signed message
    // 1. Calculate v,r,s using Signature
    // 2. Pass (message, v, r, s) to ecrecover to calculate address that signed the message

    function splitSignature(bytes memory signature)
        internal
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(signature.length == 65);
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        return (v, r, s);
    }

    function computeSigner(bytes32 message, bytes memory signature)
        internal
        pure
        returns (address signer)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(signature);
        return ecrecover(message, v, r, s);
    }

    function prefixed(bytes32 message)
        internal
        pure
        returns (bytes32 prefixedMessage)
    {
        prefixedMessage = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );
    }
}
