// Chain configuration with QuickNode RPC endpoints
export type ChainConfig = {
  network: string;
  rpc: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
};

export type ChainId = keyof typeof CHAINS;

// Make sure all environment variables are properly set
const validateEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} is not set. Please check your .env file.`
    );
  }
  return value;
};

// Get the endpoint name and token ID from environment variables
const QN_ENDPOINT_NAME = validateEnvVar("QN_ENDPOINT_NAME");
const QN_TOKEN_ID = validateEnvVar("QN_TOKEN_ID");

// Function to build QuickNode RPC URL based on network name
const buildRpcUrl = (networkName: string): string => {
<<<<<<< HEAD:AI/evm-mcp-server/chains.ts
    return `https://${QN_ENDPOINT_NAME}.${networkName}.quiknode.pro/${QN_TOKEN_ID}/`;
};

export const CHAINS = {
=======
  // Special case for Ethereum mainnet
  if (networkName === "mainnet") {
    return `https://${QN_ENDPOINT_NAME}.quiknode.pro/${QN_TOKEN_ID}/`;
  }

  // For other networks, include network name in the URL
  return `https://${QN_ENDPOINT_NAME}.${networkName}.quiknode.pro/${QN_TOKEN_ID}/`;
};

export const CHAINS = {
  ethereum: {
    network: "mainnet",
    rpc: buildRpcUrl("mainnet"),
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
>>>>>>> 29c83d89254999e4a2c61b056967224003779df5:evm-mcp-server/chains.ts
  plasma: {
    network: "plasma-mainnet",
    rpc: buildRpcUrl("plasma-mainnet"),
    name: "Plasma",
    symbol: "XPL",
    decimals: 18,
    chainId: 9745,
  },
};

// Helper to get a chain by ID
export const getChain = (chainId: ChainId): ChainConfig => {
  const chain = CHAINS[chainId];
  if (!chain) {
    throw new Error(
      `Chain ${chainId} not supported. Supported chains: ${Object.keys(
        CHAINS
      ).join(", ")}`
    );
  }
  return chain;
};

// Get a list of all supported chains
export const getSupportedChains = (): string[] => {
  return Object.keys(CHAINS);
};

// Minimal viem Chain object for wallet client signing (typed as any to avoid viem type dep here)
export const getViemChain = (chainId: ChainId): any => {
  const chain = getChain(chainId);
  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: { name: chain.name, symbol: chain.symbol, decimals: chain.decimals },
    rpcUrls: { default: { http: [chain.rpc] }, public: { http: [chain.rpc] } },
  };
};
