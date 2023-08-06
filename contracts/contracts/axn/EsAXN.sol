// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract EsAXN is MintableBaseToken {
    constructor() public MintableBaseToken("Escrowed Axion", "esAXN", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "esAXN";
    }
}
