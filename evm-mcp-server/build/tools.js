"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = exports.getTransactionByHash = exports.getBlockNumber = exports.callContract = exports.getLogs = exports.getGasPrice = exports.getCode = exports.getBalance = exports.registerTools = void 0;
const zod_1 = require("zod");
const viem_1 = require("viem");
const clients_1 = require("./clients");
const chains_1 = require("./chains");
// Register tools with the MCP server
const registerTools = (server) => {
    // Register eth_getBalance tool
    server.tool("eth_getBalance", balanceSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getBalance)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting balance: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_getCode tool
    server.tool("eth_getCode", codeSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getCode)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting code: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_gasPrice tool
    server.tool("eth_gasPrice", gasPriceSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getGasPrice)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting gas price: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_getLogs tool
    server.tool("eth_getLogs", logsSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getLogs)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting logs: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_call tool
    server.tool("eth_call", callSchema.shape, async (args) => {
        try {
            const result = await (0, exports.callContract)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error calling contract: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_blockNumber tool
    server.tool("eth_blockNumber", blockNumberSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getBlockNumber)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting block number: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    // Register eth_getTransactionByHash tool
    server.tool("eth_getTransactionByHash", transactionSchema.shape, async (args) => {
        try {
            const result = await (0, exports.getTransactionByHash)(args);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error getting transaction: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
};
exports.registerTools = registerTools;
// Schema for eth_getBalance tool
const balanceSchema = zod_1.z.object({
    address: zod_1.z.string().refine(viem_1.isAddress, {
        message: "Invalid Ethereum address format",
    }),
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});
// Schema for eth_getCode tool
const codeSchema = zod_1.z.object({
    address: zod_1.z.string().refine(viem_1.isAddress, {
        message: "Invalid Ethereum address format",
    }),
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});
// Schema for eth_gasPrice tool
const gasPriceSchema = zod_1.z.object({
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});
// Schema for eth_getLogs tool
const logsSchema = zod_1.z.object({
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
    address: zod_1.z.string().refine(viem_1.isAddress, {
        message: "Invalid Ethereum address format",
    }).optional(),
    fromBlock: zod_1.z.union([
        zod_1.z.literal("earliest"),
        zod_1.z.literal("latest"),
        zod_1.z.literal("pending"),
        zod_1.z.literal("safe"),
        zod_1.z.literal("finalized"),
        zod_1.z.number().int().nonnegative(),
        zod_1.z.string().regex(/^0x[0-9a-fA-F]+$/), // hex number
    ]).optional().default("latest"),
    toBlock: zod_1.z.union([
        zod_1.z.literal("earliest"),
        zod_1.z.literal("latest"),
        zod_1.z.literal("pending"),
        zod_1.z.literal("safe"),
        zod_1.z.literal("finalized"),
        zod_1.z.number().int().nonnegative(),
        zod_1.z.string().regex(/^0x[0-9a-fA-F]+$/), // hex number
    ]).optional().default("latest"),
    topics: zod_1.z.array(zod_1.z.union([
        zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/), // 32 byte hex
        zod_1.z.null(),
        zod_1.z.array(zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/))
    ])).optional(),
    blockHash: zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),
});
// Schema for eth_call tool
const callSchema = zod_1.z.object({
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
    to: zod_1.z.string().refine(viem_1.isAddress, {
        message: "Invalid Ethereum address format",
    }),
    data: zod_1.z.string().regex(/^0x[0-9a-fA-F]*$/, {
        message: "Data must be a hex string starting with 0x",
    }),
    from: zod_1.z.string().refine(viem_1.isAddress, {
        message: "Invalid Ethereum address format",
    }).optional(),
    gas: zod_1.z.union([
        zod_1.z.number().int().positive(),
        zod_1.z.string().regex(/^0x[0-9a-fA-F]+$/),
    ]).optional(),
    gasPrice: zod_1.z.union([
        zod_1.z.number().int().nonnegative(),
        zod_1.z.string().regex(/^0x[0-9a-fA-F]+$/),
    ]).optional(),
    value: zod_1.z.union([
        zod_1.z.number().int().nonnegative(),
        zod_1.z.string().regex(/^0x[0-9a-fA-F]+$/),
    ]).optional(),
    blockNumber: zod_1.z.union([
        zod_1.z.literal("latest"),
        zod_1.z.literal("earliest"),
        zod_1.z.literal("pending"),
        zod_1.z.literal("safe"),
        zod_1.z.literal("finalized"),
        zod_1.z.number().int().nonnegative(),
    ]).optional().default("latest"),
});
// Schema for eth_blockNumber tool
const blockNumberSchema = zod_1.z.object({
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});
// Schema for eth_getTransactionByHash tool
const transactionSchema = zod_1.z.object({
    chain: zod_1.z
        .string()
        .refine((val) => Object.keys(chains_1.CHAINS).includes(val), {
        message: "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
    hash: zod_1.z.string().regex(/^0x[0-9a-fA-F]{64}$/, {
        message: "Invalid transaction hash format",
    }),
});
/**
 * Get the balance of an Ethereum address on the specified chain
 */
const getBalance = async (params) => {
    const { address, chain } = balanceSchema.parse(params);
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Get balance in wei
        const balanceWei = await client.getBalance({ address });
        // Format balance to ETH/native token
        const balanceFormatted = (0, viem_1.formatEther)(balanceWei);
        return {
            address,
            chain: chainInfo.name,
            balanceWei: balanceWei.toString(),
            balanceFormatted: `${balanceFormatted} ${chainInfo.symbol}`,
            symbol: chainInfo.symbol,
            decimals: chainInfo.decimals,
        };
    }
    catch (error) {
        return {
            error: `Failed to get balance: ${error.message}`,
        };
    }
};
exports.getBalance = getBalance;
/**
 * Get the code at an Ethereum address to determine if it's a contract
 */
const getCode = async (params) => {
    const { address, chain } = codeSchema.parse(params);
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Get code at the address
        const code = await client.getBytecode({ address });
        // If code length is 0 or code is '0x', it's an EOA (externally owned account/wallet)
        // Otherwise, it's a contract
        const isContract = code !== undefined && code !== "0x";
        return {
            address,
            chain: chainInfo.name,
            isContract,
            bytecodeSize: code ? (code.length - 2) / 2 : 0, // Convert hex string size to bytes
            bytecode: code || "0x",
        };
    }
    catch (error) {
        return {
            error: `Failed to get code: ${error.message}`,
        };
    }
};
exports.getCode = getCode;
/**
 * Get the current gas price on the specified chain
 */
const getGasPrice = async (params) => {
    const { chain } = gasPriceSchema.parse(params);
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Get gas price in wei
        const gasPriceWei = await client.getGasPrice();
        // Convert to Gwei (1 Gwei = 10^9 wei)
        const gasPriceGwei = Number(gasPriceWei) / 1e9;
        return {
            chain: chainInfo.name,
            gasPriceWei: gasPriceWei.toString(),
            gasPriceGwei: gasPriceGwei.toFixed(2),
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        return {
            error: `Failed to get gas price: ${error.message}`,
        };
    }
};
exports.getGasPrice = getGasPrice;
/**
 * Get event logs from smart contracts
 */
const getLogs = async (params) => {
    const parsedParams = logsSchema.parse(params);
    const { chain, address, fromBlock, toBlock, topics, blockHash } = parsedParams;
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Prepare filter parameters
        const filter = {};
        if (address)
            filter.address = address;
        if (fromBlock !== undefined)
            filter.fromBlock = fromBlock;
        if (toBlock !== undefined)
            filter.toBlock = toBlock;
        if (topics)
            filter.topics = topics;
        if (blockHash)
            filter.blockHash = blockHash;
        // Get logs
        const logs = await client.getLogs(filter);
        // Format logs for better readability
        const formattedLogs = logs.map(log => ({
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: log.blockNumber?.toString(),
            blockHash: log.blockHash,
            transactionHash: log.transactionHash,
            transactionIndex: log.transactionIndex,
            logIndex: log.logIndex,
            removed: log.removed,
        }));
        return {
            chain: chainInfo.name,
            filter: {
                address,
                fromBlock: fromBlock?.toString(),
                toBlock: toBlock?.toString(),
                topics,
                blockHash,
            },
            logsCount: formattedLogs.length,
            logs: formattedLogs,
        };
    }
    catch (error) {
        return {
            error: `Failed to get logs: ${error.message}`,
        };
    }
};
exports.getLogs = getLogs;
/**
 * Call a smart contract function (read-only)
 */
const callContract = async (params) => {
    const parsedParams = callSchema.parse(params);
    const { chain, to, data, from, gas, gasPrice, value, blockNumber } = parsedParams;
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Prepare call parameters
        const callParams = {
            to,
            data,
        };
        if (from)
            callParams.from = from;
        if (gas)
            callParams.gas = BigInt(gas);
        if (gasPrice)
            callParams.gasPrice = BigInt(gasPrice);
        if (value)
            callParams.value = BigInt(value);
        if (blockNumber)
            callParams.blockNumber = blockNumber;
        // Make the call
        const result = await client.call(callParams);
        return {
            chain: chainInfo.name,
            to,
            data,
            result: result.data,
            callParams: {
                from,
                gas: gas?.toString(),
                gasPrice: gasPrice?.toString(),
                value: value?.toString(),
                blockNumber: blockNumber?.toString(),
            },
        };
    }
    catch (error) {
        return {
            error: `Failed to call contract: ${error.message}`,
        };
    }
};
exports.callContract = callContract;
/**
 * Get the latest block number
 */
const getBlockNumber = async (params) => {
    const { chain } = blockNumberSchema.parse(params);
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Get the latest block number
        const blockNumber = await client.getBlockNumber();
        // Also get the block for additional information
        const block = await client.getBlock({ blockNumber });
        return {
            chain: chainInfo.name,
            blockNumber: blockNumber.toString(),
            blockHash: block.hash,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            timestampUnix: block.timestamp.toString(),
            gasLimit: block.gasLimit?.toString(),
            gasUsed: block.gasUsed?.toString(),
            baseFeePerGas: block.baseFeePerGas?.toString(),
            difficulty: block.difficulty?.toString(),
            totalDifficulty: block.totalDifficulty?.toString(),
            size: block.size?.toString(),
            transactionCount: block.transactions.length,
        };
    }
    catch (error) {
        return {
            error: `Failed to get block number: ${error.message}`,
        };
    }
};
exports.getBlockNumber = getBlockNumber;
/**
 * Get transaction details by hash
 */
const getTransactionByHash = async (params) => {
    const { chain, hash } = transactionSchema.parse(params);
    try {
        const client = (0, clients_1.getPublicClient)(chain);
        const chainInfo = (0, chains_1.getChain)(chain);
        // Get the transaction
        const transaction = await client.getTransaction({ hash: hash });
        // Try to get the receipt for additional info
        let receipt = null;
        let status = "pending";
        try {
            receipt = await client.getTransactionReceipt({ hash: hash });
            status = receipt.status === "success" ? "success" : "failed";
        }
        catch {
            // Transaction might be pending
        }
        // Format the response
        const formattedTx = {
            chain: chainInfo.name,
            hash: transaction.hash,
            from: transaction.from,
            to: transaction.to,
            value: transaction.value.toString(),
            valueFormatted: `${(0, viem_1.formatEther)(transaction.value)} ${chainInfo.symbol}`,
            gas: transaction.gas.toString(),
            gasPrice: transaction.gasPrice?.toString(),
            maxFeePerGas: transaction.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: transaction.maxPriorityFeePerGas?.toString(),
            nonce: transaction.nonce,
            data: transaction.input,
            blockNumber: transaction.blockNumber?.toString(),
            blockHash: transaction.blockHash,
            transactionIndex: transaction.transactionIndex,
            type: transaction.type,
            status,
        };
        // Add receipt data if available
        if (receipt) {
            return {
                ...formattedTx,
                receipt: {
                    status: receipt.status,
                    gasUsed: receipt.gasUsed.toString(),
                    effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
                    cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
                    logsBloom: receipt.logsBloom,
                    logs: receipt.logs.map(log => ({
                        address: log.address,
                        topics: log.topics,
                        data: log.data,
                        logIndex: log.logIndex,
                    })),
                    contractAddress: receipt.contractAddress,
                    type: receipt.type,
                },
            };
        }
        return formattedTx;
    }
    catch (error) {
        return {
            error: `Failed to get transaction: ${error.message}`,
        };
    }
};
exports.getTransactionByHash = getTransactionByHash;
// Export all tools with their schemas
exports.tools = {
    eth_getBalance: {
        handler: exports.getBalance,
        schema: balanceSchema,
        description: "Get the ETH/native token balance of an address",
    },
    eth_getCode: {
        handler: exports.getCode,
        schema: codeSchema,
        description: "Detect whether an address is a contract or wallet",
    },
    eth_gasPrice: {
        handler: exports.getGasPrice,
        schema: gasPriceSchema,
        description: "Get the current gas price on the specified chain",
    },
    eth_getLogs: {
        handler: exports.getLogs,
        schema: logsSchema,
        description: "Monitor contract events, such as token transfers or DAO votes",
    },
    eth_call: {
        handler: exports.callContract,
        schema: callSchema,
        description: "Read smart contract data (e.g., token balances, configurations)",
    },
    eth_blockNumber: {
        handler: exports.getBlockNumber,
        schema: blockNumberSchema,
        description: "Fetch the latest block for chain health/status tracking",
    },
    eth_getTransactionByHash: {
        handler: exports.getTransactionByHash,
        schema: transactionSchema,
        description: "Analyze specific transactions by their hash",
    },
};
