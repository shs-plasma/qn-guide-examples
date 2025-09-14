"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicClient = void 0;
const viem_1 = require("viem");
const chains_1 = require("./chains");
// Cache for viem clients to avoid creating duplicate clients
const clientCache = new Map();
/**
 * Creates or retrieves a cached viem public client for the specified chain
 * @param chainId The chain identifier
 * @returns A viem public client configured for the specified chain
 */
const getPublicClient = (chainId) => {
    // Return from cache if exists
    if (clientCache.has(chainId)) {
        return clientCache.get(chainId);
    }
    // Get chain configuration
    const chain = (0, chains_1.getChain)(chainId);
    // Create new public client
    const client = (0, viem_1.createPublicClient)({
        transport: (0, viem_1.http)(chain.rpc),
    });
    // Cache for future use
    clientCache.set(chainId, client);
    return client;
};
exports.getPublicClient = getPublicClient;
