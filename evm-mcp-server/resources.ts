/**
 * Resources file for useful references about EVM blockchains
 * Optional, but can be used to enhance LLM agent performance
 */

// Register resources with the MCP server
export const registerResources = (server: any) => {
  // Register gas reference resource
  server.resource(
    "gas-reference",
    "evm://docs/gas-reference",
    async (uri: URL) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(gasReferencePoints, null, 2),
          },
        ],
      };
    }
  );

  // Register block explorers resource
  server.resource(
    "block-explorers",
    "evm://docs/block-explorers",
    async (uri: URL) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(blockExplorers, null, 2),
          },
        ],
      };
    }
  );

  // Register supported chains resource
  server.resource(
    "supported-chains",
    "evm://docs/supported-chains",
    async (uri: URL) => {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(supportedChains, null, 2),
          },
        ],
      };
    }
  );

  return server;
};

// Gas price reference points (in Gwei)
const gasReferencePoints = {
  ethereum: {
    low: 20,
    average: 40,
    high: 100,
    veryHigh: 200,
  },
};

// Block explorer URLs by chain
const blockExplorers = {
  ethereum: 'https://etherscan.io',
  plasma: 'https://plasmascan.to',
};

const supportedChains = {
  ethereum: {
    network: "mainnet",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  plasma: {
    network: "plasma-mainnet",
    name: "Plasma",
    symbol: "XPL",
    decimals: 18,
  },
};