import { network, ethers } from "hardhat";

async function callPrecompile(value: number): Promise<string> {
  // Get provider from the hardhat network
  const provider = network.provider;

  // Precompile address
  const precompileAddress = "0x0000000000000000000000000000000000000807"; // Perps Oracle Price

  // ABI encode the uint16 value
  const abiCoder = new ethers.AbiCoder();
  const calldata = abiCoder.encode(["uint16"], [value]);

  // Make the call
  try {
    const result = await provider.send("eth_call", [
      {
        to: precompileAddress,
        data: calldata,
      },
      "latest",
    ]);

    return result;
  } catch (error) {
    throw new Error(`Failed to call precompile: ${error}`);
  }
}

async function main() {
  const testValue = 3; // BTC on testnet is index 3

  try {
    const result = await callPrecompile(testValue);
    console.log(`Precompile call successful. Result: ${result}`);

    // To convert to a float divide the returned price by 10^(6 - asset szDecimals)
    // For spot prices the conversion is 10^(8 - base asset szDecimals) instead

    // If you need to decode the returned value, you can use:
    // const decodedValue = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], result);
    // console.log(`Decoded value: ${decodedValue}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
