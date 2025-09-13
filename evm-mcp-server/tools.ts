import { z } from "zod";
import { formatEther, isAddress, parseAbi, encodeFunctionData, decodeFunctionResult } from "viem";
import { getPublicClient } from "./clients";
import { ChainId, getChain, CHAINS } from "./chains";

// Register tools with the MCP server
export const registerTools = (server: any) => {
  // Register eth_getBalance tool
  server.tool(
    "eth_getBalance",
    balanceSchema.shape,
    async (args: z.infer<typeof balanceSchema>) => {
      try {
        const result = await getBalance(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting balance: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_getCode tool
  server.tool(
    "eth_getCode",
    codeSchema.shape,
    async (args: z.infer<typeof codeSchema>) => {
      try {
        const result = await getCode(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting code: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_gasPrice tool
  server.tool(
    "eth_gasPrice",
    gasPriceSchema.shape,
    async (args: z.infer<typeof gasPriceSchema>) => {
      try {
        const result = await getGasPrice(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting gas price: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_getLogs tool
  server.tool(
    "eth_getLogs",
    logsSchema.shape,
    async (args: z.infer<typeof logsSchema>) => {
      try {
        const result = await getLogs(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting logs: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_call tool
  server.tool(
    "eth_call",
    callSchema.shape,
    async (args: z.infer<typeof callSchema>) => {
      try {
        const result = await callContract(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error calling contract: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_blockNumber tool
  server.tool(
    "eth_blockNumber",
    blockNumberSchema.shape,
    async (args: z.infer<typeof blockNumberSchema>) => {
      try {
        const result = await getBlockNumber(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting block number: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Register eth_getTransactionByHash tool
  server.tool(
    "eth_getTransactionByHash",
    transactionSchema.shape,
    async (args: z.infer<typeof transactionSchema>) => {
      try {
        const result = await getTransactionByHash(args);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error getting transaction: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
};

// Schema for eth_getBalance tool
const balanceSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});

// Schema for eth_getCode tool
const codeSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});

// Schema for eth_gasPrice tool
const gasPriceSchema = z.object({
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});

// Schema for eth_getLogs tool
const logsSchema = z.object({
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }).optional(),
  fromBlock: z.union([
    z.literal("earliest"),
    z.literal("latest"),
    z.literal("pending"),
    z.literal("safe"),
    z.literal("finalized"),
    z.number().int().nonnegative(),
    z.string().regex(/^0x[0-9a-fA-F]+$/), // hex number
  ]).optional().default("latest"),
  toBlock: z.union([
    z.literal("earliest"),
    z.literal("latest"),
    z.literal("pending"),
    z.literal("safe"),
    z.literal("finalized"),
    z.number().int().nonnegative(),
    z.string().regex(/^0x[0-9a-fA-F]+$/), // hex number
  ]).optional().default("latest"),
  topics: z.array(
    z.union([
      z.string().regex(/^0x[0-9a-fA-F]{64}$/), // 32 byte hex
      z.null(),
      z.array(z.string().regex(/^0x[0-9a-fA-F]{64}$/))
    ])
  ).optional(),
  blockHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),
});

// Schema for eth_call tool
const callSchema = z.object({
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
  to: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  data: z.string().regex(/^0x[0-9a-fA-F]*$/, {
    message: "Data must be a hex string starting with 0x",
  }),
  from: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }).optional(),
  gas: z.union([
    z.number().int().positive(),
    z.string().regex(/^0x[0-9a-fA-F]+$/),
  ]).optional(),
  gasPrice: z.union([
    z.number().int().nonnegative(),
    z.string().regex(/^0x[0-9a-fA-F]+$/),
  ]).optional(),
  value: z.union([
    z.number().int().nonnegative(),
    z.string().regex(/^0x[0-9a-fA-F]+$/),
  ]).optional(),
  blockNumber: z.union([
    z.literal("latest"),
    z.literal("earliest"),
    z.literal("pending"),
    z.literal("safe"),
    z.literal("finalized"),
    z.number().int().nonnegative(),
  ]).optional().default("latest"),
});

// Schema for eth_blockNumber tool
const blockNumberSchema = z.object({
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
});

// Schema for eth_getTransactionByHash tool
const transactionSchema = z.object({
  chain: z
    .string()
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message:
        "Unsupported chain. Use one of: ethereum, base, arbitrum, avalanche, bsc",
    }),
  hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, {
    message: "Invalid transaction hash format",
  }),
});

/**
 * Get the balance of an Ethereum address on the specified chain
 */
export const getBalance = async (params: z.infer<typeof balanceSchema>) => {
  const { address, chain } = balanceSchema.parse(params);

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

    // Get balance in wei
    const balanceWei = await client.getBalance({ address });

    // Format balance to ETH/native token
    const balanceFormatted = formatEther(balanceWei);

    return {
      address,
      chain: chainInfo.name,
      balanceWei: balanceWei.toString(),
      balanceFormatted: `${balanceFormatted} ${chainInfo.symbol}`,
      symbol: chainInfo.symbol,
      decimals: chainInfo.decimals,
    };
  } catch (error) {
    return {
      error: `Failed to get balance: ${(error as Error).message}`,
    };
  }
};

/**
 * Get the code at an Ethereum address to determine if it's a contract
 */
export const getCode = async (params: z.infer<typeof codeSchema>) => {
  const { address, chain } = codeSchema.parse(params);

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

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
  } catch (error) {
    return {
      error: `Failed to get code: ${(error as Error).message}`,
    };
  }
};

/**
 * Get the current gas price on the specified chain
 */
export const getGasPrice = async (params: z.infer<typeof gasPriceSchema>) => {
  const { chain } = gasPriceSchema.parse(params);

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

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
  } catch (error) {
    return {
      error: `Failed to get gas price: ${(error as Error).message}`,
    };
  }
};

/**
 * Get event logs from smart contracts
 */
export const getLogs = async (params: z.infer<typeof logsSchema>) => {
  const parsedParams = logsSchema.parse(params);
  const { chain, address, fromBlock, toBlock, topics, blockHash } = parsedParams;

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

    // Prepare filter parameters
    const filter: any = {};
    
    if (address) filter.address = address;
    if (fromBlock !== undefined) filter.fromBlock = fromBlock;
    if (toBlock !== undefined) filter.toBlock = toBlock;
    if (topics) filter.topics = topics;
    if (blockHash) filter.blockHash = blockHash;

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
  } catch (error) {
    return {
      error: `Failed to get logs: ${(error as Error).message}`,
    };
  }
};

/**
 * Call a smart contract function (read-only)
 */
export const callContract = async (params: z.infer<typeof callSchema>) => {
  const parsedParams = callSchema.parse(params);
  const { chain, to, data, from, gas, gasPrice, value, blockNumber } = parsedParams;

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

    // Prepare call parameters
    const callParams: any = {
      to,
      data,
    };

    if (from) callParams.from = from;
    if (gas) callParams.gas = BigInt(gas);
    if (gasPrice) callParams.gasPrice = BigInt(gasPrice);
    if (value) callParams.value = BigInt(value);
    if (blockNumber) callParams.blockNumber = blockNumber;

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
  } catch (error) {
    return {
      error: `Failed to call contract: ${(error as Error).message}`,
    };
  }
};

/**
 * Get the latest block number
 */
export const getBlockNumber = async (params: z.infer<typeof blockNumberSchema>) => {
  const { chain } = blockNumberSchema.parse(params);

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

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
  } catch (error) {
    return {
      error: `Failed to get block number: ${(error as Error).message}`,
    };
  }
};

/**
 * Get transaction details by hash
 */
export const getTransactionByHash = async (params: z.infer<typeof transactionSchema>) => {
  const { chain, hash } = transactionSchema.parse(params);

  try {
    const client = getPublicClient(chain as ChainId);
    const chainInfo = getChain(chain as ChainId);

    // Get the transaction
    const transaction = await client.getTransaction({ hash: hash as `0x${string}` });

    // Try to get the receipt for additional info
    let receipt = null;
    let status = "pending";
    try {
      receipt = await client.getTransactionReceipt({ hash: hash as `0x${string}` });
      status = receipt.status === "success" ? "success" : "failed";
    } catch {
      // Transaction might be pending
    }

    // Format the response
    const formattedTx = {
      chain: chainInfo.name,
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value.toString(),
      valueFormatted: `${formatEther(transaction.value)} ${chainInfo.symbol}`,
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
  } catch (error) {
    return {
      error: `Failed to get transaction: ${(error as Error).message}`,
    };
  }
};

// Export all tools with their schemas
export const tools = {
  eth_getBalance: {
    handler: getBalance,
    schema: balanceSchema,
    description: "Get the ETH/native token balance of an address",
  },
  eth_getCode: {
    handler: getCode,
    schema: codeSchema,
    description: "Detect whether an address is a contract or wallet",
  },
  eth_gasPrice: {
    handler: getGasPrice,
    schema: gasPriceSchema,
    description: "Get the current gas price on the specified chain",
  },
  eth_getLogs: {
    handler: getLogs,
    schema: logsSchema,
    description: "Monitor contract events, such as token transfers or DAO votes",
  },
  eth_call: {
    handler: callContract,
    schema: callSchema,
    description: "Read smart contract data (e.g., token balances, configurations)",
  },
  eth_blockNumber: {
    handler: getBlockNumber,
    schema: blockNumberSchema,
    description: "Fetch the latest block for chain health/status tracking",
  },
  eth_getTransactionByHash: {
    handler: getTransactionByHash,
    schema: transactionSchema,
    description: "Analyze specific transactions by their hash",
  },
};