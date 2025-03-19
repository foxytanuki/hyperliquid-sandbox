// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

contract MockSpotPricePrecompile {
    uint256 public price;

    fallback(bytes calldata /*data*/ ) external returns (bytes memory) {
        return abi.encode(price);
    }
}

contract QueryScript is Script {
    function run() external {
        // etch oracle precompile
        address SPOT_PX_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000808;
        MockSpotPricePrecompile spotPricePrecompile = new MockSpotPricePrecompile();
        vm.etch(SPOT_PX_PRECOMPILE_ADDRESS, address(spotPricePrecompile).code);

        // set price
        vm.store(SPOT_PX_PRECOMPILE_ADDRESS, bytes32(uint256(0)), bytes32(uint256(420)));

        bool success;
        bytes memory result;

        (success, result) = SPOT_PX_PRECOMPILE_ADDRESS.staticcall(abi.encode(1035));
        console.log(success);
        console.logBytes(result);
        console.log(abi.decode(result, (uint64)));
    }
}
