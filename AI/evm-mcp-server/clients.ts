import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ChainId, getChain, getViemChain } from "./chains";

// Cache for viem clients to avoid creating duplicate clients
const clientCache = new Map<ChainId, ReturnType<typeof createPublicClient>>();

/**
 * Creates or retrieves a cached viem public client for the specified chain
 * @param chainId The chain identifier
 * @returns A viem public client configured for the specified chain
 */
export const getPublicClient = (chainId: ChainId) => {
  // Return from cache if exists
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId)!;
  }

  // Get chain configuration
  const chain = getChain(chainId);

  // Create new public client
  const client = createPublicClient({
    transport: http(chain.rpc),
  });

  // Cache for future use
  clientCache.set(chainId, client);

  return client;
};

/**
 * Creates a viem wallet client using DEPLOYER_PRIVATE_KEY for the specified chain
 */
export const getWalletClient = (chainId: ChainId) => {
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    throw new Error("DEPLOYER_PRIVATE_KEY env var must be set to a 0x-prefixed 32-byte hex string");
  }
  const account = privateKeyToAccount(pk as `0x${string}`);
  const chain = getChain(chainId);
  const viemChain = getViemChain(chainId);
  const client = createWalletClient({ account, chain: viemChain, transport: http(chain.rpc) });
  return { client, account };
};
