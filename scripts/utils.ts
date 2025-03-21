/**
 * Utility functions for Hyperliquid API
 */

import { network, ethers } from "hardhat";

export interface RawAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

export interface Asset extends RawAsset {
  index: number;
}

export interface RawSpotAsset {
  tokens: number[];
  name: string;
  index: number;
  isCanonical: boolean;
}

export interface SpotAsset extends RawSpotAsset {}

export interface MetaResponse {
  universe: Asset[];
}

export interface SpotMetaResponse {
  universe: SpotAsset[];
  tokens: Token[];
}

export interface Token {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: {
    address: string;
    evm_extra_wei_decimals: number;
  };
  fullName: string | null;
  deployerTradingFeeShare: string;
}

// Define the precompile addresses
export const PRECOMPILE_ADDRESSES = {
  POSITION: "0x0000000000000000000000000000000000000800",
  SPOT_BALANCE: "0x0000000000000000000000000000000000000801",
  VAULT_EQUITY: "0x0000000000000000000000000000000000000802",
  WITHDRAWABLE: "0x0000000000000000000000000000000000000803",
  DELEGATIONS: "0x0000000000000000000000000000000000000804",
  DELEGATOR_SUMMARY: "0x0000000000000000000000000000000000000805",
  MARK_PX: "0x0000000000000000000000000000000000000806",
  ORACLE_PX: "0x0000000000000000000000000000000000000807",
  SPOT_PX: "0x0000000000000000000000000000000000000808",
  L1_BLOCK_NUMBER: "0x0000000000000000000000000000000000000809",
};

// Define the data structures that match the Solidity structs
export interface Position {
  szi: bigint;
  leverage: number;
  entryNtl: bigint;
}

export interface SpotBalance {
  total: bigint;
  hold: bigint;
  entryNtl: bigint;
}

export interface UserVaultEquity {
  equity: bigint;
  lockedUntilTimestamp: bigint;
}

export interface Withdrawable {
  withdrawable: bigint;
}

export interface Delegation {
  validator: string;
  amount: bigint;
  lockedUntilTimestamp: bigint;
}

export interface DelegatorSummary {
  delegated: bigint;
  undelegated: bigint;
  totalPendingWithdrawal: bigint;
  nPendingWithdrawals: bigint;
}

/**
 * Generic function to call a precompile with encoded parameters
 * @param precompileAddress The address of the precompile to call
 * @param encodedParams The ABI encoded parameters
 * @returns The raw result from the precompile call
 */
export async function callPrecompile(
  precompileAddress: string,
  encodedParams: string
): Promise<string> {
  const provider = network.provider;

  try {
    const result = await provider.send("eth_call", [
      {
        to: precompileAddress,
        data: encodedParams,
      },
      "latest",
    ]);

    return result;
  } catch (error) {
    throw new Error(
      `Failed to call precompile at ${precompileAddress}: ${error}`
    );
  }
}

/**
 * Format a price value for display
 * @param price The price as a bigint
 * @param szDecimals The number of decimals for the asset
 * @param priceType The type of price (mark, oracle, or spot)
 * @returns Formatted price string
 */
export function formatPrice(
  price: bigint,
  szDecimals: number,
  priceType: "mark" | "oracle" | "spot" = "mark"
): string {
  // Based on the testnet output, we need to apply different scaling factors
  const exponent = priceType === "spot" ? 8 - szDecimals : 6 - szDecimals;
  const divisor = 10n ** BigInt(exponent);
  const priceNumber = Number(price) / Number(divisor);
  // Format with 2 decimal places for USD values
  return priceNumber.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Fetches metadata from Hyperliquid API
 */
async function _fetchMeta(url: string): Promise<MetaResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "meta" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetches SPOT metadata from Hyperliquid API
 */
async function _fetchSpotMeta(url: string): Promise<SpotMetaResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "spotMeta" }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch spot metadata: ${response.status}`);
  }

  return response.json();
}

/**
 * Returns the szDecimals and index for a given asset name
 * @param names Asset names (e.g. ["BTC", "ETH"])
 * @returns Array of objects containing szDecimals and index
 */
export async function getTestnetMetas(names: string[]): Promise<Asset[]> {
  try {
    const metadata = await _fetchMeta(
      "https://api.hyperliquid-testnet.xyz/info"
    );

    const results = names.map((name) => {
      const index = metadata.universe.findIndex((asset) => asset.name === name);

      if (index === -1) {
        return null;
      }

      return {
        name,
        szDecimals: metadata.universe[index].szDecimals,
        index,
      };
    });

    return results.filter((result) => result !== null) as Asset[];
  } catch (error) {
    console.error("Error getting metadata:", error);
    return [];
  }
}

/**
 * Fetches SPOT metadata from Hyperliquid API
 */
export async function getTestnetSpotUSDCMetas(
  names: string[]
): Promise<SpotAsset[]> {
  const metadata = await _fetchSpotMeta(
    "https://api.hyperliquid-testnet.xyz/info"
  );

  const results = names.map((name) => {
    const asset = metadata.tokens.find((asset) => asset.name === name);

    if (asset === undefined) {
      return null;
    }

    // Find the token pair TOKEN/USDC
    // [tokenIndex, usdcIndex=0]
    const token = metadata.universe.find(
      (token) => token.tokens[0] === asset.index && token.tokens[1] === 0
    );

    if (token === undefined) {
      return null;
    }

    return {
      name: `${name}/USDC`,
      index: token.index,
      isCanonical: token.isCanonical,
    };
  });

  return results.filter((result) => result !== null) as SpotAsset[];
}
