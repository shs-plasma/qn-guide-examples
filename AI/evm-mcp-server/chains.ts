// Chain configuration with QuickNode RPC endpoints
export type ChainConfig = {
  network: string;
  rpc: string;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
  // Optional explorer API config
  routescanNetwork?: string; // e.g., "mainnet"
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
  return `https://${QN_ENDPOINT_NAME}.${networkName}.quiknode.pro/${QN_TOKEN_ID}/`;
};

export const CHAINS = {
  plasma: {
    network: "plasma-mainnet",
    rpc: buildRpcUrl("plasma-mainnet"),
    name: "Plasma",
    symbol: "XPL",
    decimals: 18,
    chainId: 9745,
    routescanNetwork: "mainnet",
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

// Helper to build Routescan base URL for a chain
export const getRoutescanBase = (chainId: ChainId): string => {
  const chain = getChain(chainId);
  const network = chain.routescanNetwork || "mainnet";
  return `https://api.routescan.io/v2/network/${network}/evm/${chain.chainId}`;
};
