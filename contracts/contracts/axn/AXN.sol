// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

contract AXN is MintableBaseToken {
    constructor() public MintableBaseToken("Axion Perpetuals", "AXN", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "TAIL";
    }
}
