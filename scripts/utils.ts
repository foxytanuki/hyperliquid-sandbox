/**
 * Utility functions for Hyperliquid API
 */

interface Asset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
}

interface MetaResponse {
  universe: Asset[];
}

/**
 * Fetches metadata from Hyperliquid API
 */
async function fetchMetadata(): Promise<MetaResponse> {
  const response = await fetch("https://api.hyperliquid.xyz/info", {
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
 * Returns the szDecimals and index for a given asset name
 * @param name Asset name (e.g. "BTC", "ETH")
 * @returns Object containing szDecimals and index, or null if not found
 */
export async function getMetadata(
  name: string
): Promise<{ szDecimals: number; index: number } | null> {
  try {
    const metadata = await fetchMetadata();

    const index = metadata.universe.findIndex((asset) => asset.name === name);

    if (index === -1) {
      return null;
    }

    return {
      szDecimals: metadata.universe[index].szDecimals,
      index,
    };
  } catch (error) {
    console.error("Error getting metadata:", error);
    return null;
  }
}
