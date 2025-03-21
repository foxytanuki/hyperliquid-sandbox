/**
 * Utility functions for Hyperliquid API
 */

interface Asset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
}

interface MetaResponse {
  universe: Asset[];
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
 * Returns the szDecimals and index for a given asset name
 * @param names Asset names (e.g. ["BTC", "ETH"])
 * @returns Array of objects containing szDecimals and index
 */
export async function getTestnetMetas(
  names: string[]
): Promise<{ name: string; szDecimals: number; index: number }[]> {
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

    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("Error getting metadata:", error);
    return [];
  }
}
