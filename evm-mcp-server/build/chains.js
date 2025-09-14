"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedChains = exports.getChain = exports.CHAINS = void 0;
// Make sure all environment variables are properly set
const validateEnvVar = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is not set. Please check your .env file.`);
    }
    return value;
};
// Get the endpoint name and token ID from environment variables
const QN_ENDPOINT_NAME = validateEnvVar("QN_ENDPOINT_NAME");
const QN_TOKEN_ID = validateEnvVar("QN_TOKEN_ID");
// Function to build QuickNode RPC URL based on network name
const buildRpcUrl = (networkName) => {
    // Special case for Ethereum mainnet
    if (networkName === "mainnet") {
        return `https://${QN_ENDPOINT_NAME}.quiknode.pro/${QN_TOKEN_ID}/`;
    }
    // For other networks, include network name in the URL
    return `https://${QN_ENDPOINT_NAME}.${networkName}.quiknode.pro/${QN_TOKEN_ID}/`;
};
exports.CHAINS = {
    ethereum: {
        network: "mainnet",
        rpc: buildRpcUrl("mainnet"),
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
    },
    plasma: {
        network: "plasma-mainnet",
        rpc: buildRpcUrl("plasma-mainnet"),
        name: "Plasma",
        symbol: "XPL",
        decimals: 18,
    },
};
// Helper to get a chain by ID
const getChain = (chainId) => {
    const chain = exports.CHAINS[chainId];
    if (!chain) {
        throw new Error(`Chain ${chainId} not supported. Supported chains: ${Object.keys(exports.CHAINS).join(", ")}`);
    }
    return chain;
};
exports.getChain = getChain;
// Get a list of all supported chains
const getSupportedChains = () => {
    return Object.keys(exports.CHAINS);
};
exports.getSupportedChains = getSupportedChains;
