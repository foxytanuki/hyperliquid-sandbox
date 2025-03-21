import { network, ethers } from "hardhat";
import { getMetadata } from "./utils";

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

// Convert raw price to floating point
function convertToFloat(
  rawPrice: bigint,
  szDecimals: number,
  isSpot = false
): number {
  // For perp prices: divide by 10^(6 - asset szDecimals)
  // For spot prices: divide by 10^(8 - base asset szDecimals)
  const exponent = isSpot ? 8 - szDecimals : 6 - szDecimals;
  const divisor = 10n ** BigInt(exponent);

  return Number(rawPrice) / Number(divisor);
}

async function main() {
  const metadata = await getMetadata("BTC");

  if (!metadata) {
    throw new Error("Failed to get metadata");
  }

  const { szDecimals, index } = metadata;

  try {
    const result = await callPrecompile(index);
    const rawPrice = BigInt(result);
    console.log(`BTC Oracle Price (raw): ${rawPrice}`);

    // Convert to actual price
    const oraclePrice = convertToFloat(rawPrice, szDecimals, false);
    console.log(`BTC Oracle Price: ${oraclePrice}`);
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
