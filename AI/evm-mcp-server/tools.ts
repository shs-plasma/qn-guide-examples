import { z } from "zod";
import { formatEther, formatUnits, isAddress, encodeFunctionData, decodeFunctionResult, encodeDeployData, type Hex } from "viem";
import { getPublicClient, getWalletClient } from "./clients";
import { ChainId, getChain, CHAINS, getRoutescanBase } from "./chains";

const SOURCIFY_URL = process.env.SOURCIFY_URL || "https://sourcify.dev/server";
const ROUTESCAN_API_KEY = process.env.ROUTESCAN_API_KEY || "";

// Internal helper to query Routescan's Etherscan-compatible endpoint
const routescanFetch = async (
  chain: ChainId,
  module: string,
  action: string,
  params?: Record<string, string | number | boolean>,
  apiKey?: string
) => {
  const base = getRoutescanBase(chain);
  const url = new URL(`${base}/etherscan`);
  url.searchParams.set("module", module);
  url.searchParams.set("action", action);
  const key = apiKey ?? ROUTESCAN_API_KEY;
  if (key) url.searchParams.set("apiKey", key);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  return { endpoint: url.toString(), result: json };
};

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

  // Register contract_verify tool
  server.tool(
    "contract_verify",
    verifySchema.shape,
    async (args: z.infer<typeof verifySchema>) => {
      try {
        const result = await verifyContract(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error verifying: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Register contract_deploy tool
  server.tool(
    "contract_deploy",
    deploySchema.shape,
    async (args: z.infer<typeof deploySchema>) => {
      try {
        const result = await deployContract(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error deploying: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Register proxy_inspect tool
  server.tool(
    "proxy_inspect",
    proxyInspectSchema.shape,
    async (args: z.infer<typeof proxyInspectSchema>) => {
      try {
        const result = await inspectProxy(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error inspecting proxy: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Register routescan_addresses tool
  server.tool(
    "routescan_addresses",
    routescanAddressesSchema.shape,
    async (args: z.infer<typeof routescanAddressesSchema>) => {
      try {
        const result = await listRoutescanAddresses(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error listing addresses: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Register routescan_etherscan tool
  server.tool(
    "routescan_etherscan",
    routescanEtherscanSchema.shape,
    async (args: z.infer<typeof routescanEtherscanSchema>) => {
      try {
        const result = await routescanEtherscanQuery(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error querying Routescan Etherscan API: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Register routescan_get tool (generic)
  server.tool(
    "routescan_get",
    routescanGetSchema.shape,
    async (args: z.infer<typeof routescanGetSchema>) => {
      try {
        const result = await routescanGet(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error calling Routescan GET: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  // Typed Routescan account tools
  server.tool(
    "routescan_account_txlist",
    routescanAccountTxListSchema.shape,
    async (args: z.infer<typeof routescanAccountTxListSchema>) => {
      try {
        const result = await routescanAccountTxList(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching account txlist: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "routescan_account_txlistinternal",
    routescanAccountTxListInternalSchema.shape,
    async (args: z.infer<typeof routescanAccountTxListInternalSchema>) => {
      try {
        const result = await routescanAccountTxListInternal(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching internal txs: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "routescan_account_tokentx",
    routescanAccountTokenTxSchema.shape,
    async (args: z.infer<typeof routescanAccountTokenTxSchema>) => {
      try {
        const result = await routescanAccountTokenTx(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching ERC20 transfers: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "routescan_account_tokennfttx",
    routescanAccountTokenNftTxSchema.shape,
    async (args: z.infer<typeof routescanAccountTokenNftTxSchema>) => {
      try {
        const result = await routescanAccountTokenNftTx(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching NFT transfers: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "routescan_account_token1155tx",
    routescanAccountToken1155TxSchema.shape,
    async (args: z.infer<typeof routescanAccountToken1155TxSchema>) => {
      try {
        const result = await routescanAccountToken1155Tx(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching ERC1155 transfers: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  server.tool(
    "routescan_account_tokenbalance",
    routescanAccountTokenBalanceSchema.shape,
    async (args: z.infer<typeof routescanAccountTokenBalanceSchema>) => {
      try {
        const result = await routescanAccountTokenBalance(args);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error fetching token balance: ${(error as Error).message}` }], isError: true };
      }
    }
  );

  return server;
};

// =============== New Tools: Verification, Deployment, Proxy Inspect ===============

const verifySchema = z.object({
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
  // One of the following should be provided
  metadataJson: z.string().optional(),
  sources: z
    .array(z.object({ path: z.string(), content: z.string() }))
    .optional(),
});

export const verifyContract = async (params: z.infer<typeof verifySchema>) => {
  const { address, chain, metadataJson, sources } = verifySchema.parse(params);
  try {
    const chainInfo = getChain(chain as ChainId);
    // Build multipart form
    const form = new FormData();
    form.append("address", address);
    form.append("chain", String(chainInfo.chainId));
    form.append("rpc", chainInfo.rpc);
    if (metadataJson) {
      form.append(
        "files",
        new Blob([metadataJson], { type: "application/json" }),
        "metadata.json"
      );
    }
    if (sources) {
      for (const s of sources) {
        form.append("files", new Blob([s.content], { type: "text/plain" }), s.path);
      }
    }
    const res = await fetch(`${SOURCIFY_URL}/verify`, { method: "POST", body: form as any });
    const verifyResult = await res.json().catch(() => ({}));
    // Confirm status
    const statusRes = await fetch(
      `${SOURCIFY_URL}/check-all-by-addresses?addresses=${address}&chainIds=${chainInfo.chainId}`
    );
    const status = await statusRes.json().catch(() => ({}));
    return { backend: "sourcify", verifyResult, status };
  } catch (error) {
    return { error: `Verification failed: ${(error as Error).message}` };
  }
};

const deploySchema = z.object({
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
  bytecode: z.string().regex(/^0x[0-9a-fA-F]+$/),
  abi: z.array(z.any()),
  args: z.array(z.any()).optional().default([]),
  value: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  maxFeePerGas: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  maxPriorityFeePerGas: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  gas: z.string().regex(/^0x[0-9a-fA-F]+$/).optional(),
  nonce: z.number().int().nonnegative().optional(),
});

export const deployContract = async (params: z.infer<typeof deploySchema>) => {
  const parsed = deploySchema.parse(params);
  const { chain, bytecode, abi, args, value, maxFeePerGas, maxPriorityFeePerGas, gas, nonce } = parsed;
  try {
    const publicClient = getPublicClient(chain as ChainId);
    const { client: walletClient, account } = getWalletClient(chain as ChainId);
    const data = encodeDeployData({ abi: abi as any, bytecode: bytecode as Hex, args });
    // Estimate gas if not provided
    const gasEstimate = await publicClient.estimateGas({
      account: account.address as `0x${string}`,
      data,
      to: undefined,
      value: value ? BigInt(value) : undefined,
    }).catch(() => undefined);
    const hash = await walletClient.sendTransaction({
      account,
      data,
      to: undefined,
      value: value ? BigInt(value) : undefined,
      gas: gas ? BigInt(gas) : gasEstimate,
      maxFeePerGas: maxFeePerGas ? BigInt(maxFeePerGas) : undefined,
      maxPriorityFeePerGas: maxPriorityFeePerGas ? BigInt(maxPriorityFeePerGas) : undefined,
      nonce,
      // satisfy types; wallet client already has chain context set
      chain: undefined,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return {
      txHash: hash,
      contractAddress: receipt.contractAddress,
      status: receipt.status,
      gasUsed: receipt.gasUsed?.toString(),
    };
  } catch (error) {
    return { error: `Deployment failed: ${(error as Error).message}` };
  }
};

const proxyInspectSchema = z.object({
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
});

export const inspectProxy = async (params: z.infer<typeof proxyInspectSchema>) => {
  const { chain, address } = proxyInspectSchema.parse(params);
  const client = getPublicClient(chain as ChainId);
  const toAddr = (slotVal: string | null) => {
    if (!slotVal) return null;
    const clean = slotVal.replace(/^0x/, "").padStart(64, "0");
    const last20 = clean.slice(24 * 2); // last 40 hex chars
    const addr = `0x${last20}`.toLowerCase();
    if (/^0x0{40}$/.test(addr)) return null;
    return addr as `0x${string}`;
  };
  try {
    const implSlot = "0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC" as const;
    const adminSlot = "0xB53127684A568B3173AE13B9F8A6016E243E63B6E8EE1178D6A717850B5D6103" as const;
    const beaconSlot = "0xA3F0AD74E5423AEBFD80D3EF4346578335A9A72AEAEE59FF6CB3582B35133D50" as const;
    const [implRaw, adminRaw, beaconRaw] = await Promise.all([
      client.getStorageAt({ address, slot: implSlot }),
      client.getStorageAt({ address, slot: adminSlot }),
      client.getStorageAt({ address, slot: beaconSlot }),
    ]);
    const implementation = toAddr(implRaw as any);
    const admin = toAddr(adminRaw as any);
    const beacon = toAddr(beaconRaw as any);
    const isProxy = Boolean(implementation || beacon);
    return { isProxy, implementation, admin, beacon };
  } catch (error) {
    return { error: `Proxy inspection failed: ${(error as Error).message}` };
  }
};

// Schema for eth_getBalance tool
const balanceSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
});

// Schema for eth_getCode tool
const codeSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
});

// Schema for eth_gasPrice tool
const gasPriceSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
});

// Schema for eth_getLogs tool
const logsSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
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
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
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
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
});

// Schema for eth_getTransactionByHash tool
const transactionSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
  hash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, {
    message: "Invalid transaction hash format",
  }),
});

// Schema: Routescan addresses list
const routescanAddressesSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
  limit: z.number().int().min(1).max(100).optional().default(25),
  cursor: z.string().optional(),
  // Optional API key override
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

// Schema: Routescan Etherscan-compatible query
const routescanEtherscanSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
  module: z.string(),
  action: z.string(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
  // Optional API key override
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const listRoutescanAddresses = async (params: z.infer<typeof routescanAddressesSchema>) => {
  const { chain, limit, cursor, apiKey, format } = routescanAddressesSchema.parse(params);
  const base = getRoutescanBase(chain as ChainId);
  const key = apiKey ?? ROUTESCAN_API_KEY;
  const url = new URL(`${base}/addresses`);
  url.searchParams.set("limit", String(limit));
  if (cursor) url.searchParams.set("cursor", cursor);
  if (key) url.searchParams.set("apiKey", key);

  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  if (format === "normalized") {
    const items = Array.isArray((json as any)?.items)
      ? (json as any).items.map((it: any) => ({
          address: it?.address ?? it?.addr ?? null,
          firstSeen: it?.firstSeen ?? null,
          lastSeen: it?.lastSeen ?? null,
        }))
      : [];
    return { chain, endpoint: url.toString(), format, count: items.length, items, raw: json };
  }
  return { chain, endpoint: url.toString(), limit, cursor: cursor || null, result: json, format };
};

export const routescanEtherscanQuery = async (params: z.infer<typeof routescanEtherscanSchema>) => {
  const { chain, module, action, params: extra, apiKey, format } = routescanEtherscanSchema.parse(params);
  const base = getRoutescanBase(chain as ChainId);
  const key = apiKey ?? ROUTESCAN_API_KEY;
  const url = new URL(`${base}/etherscan`);

  // Build query string
  url.searchParams.set("module", module);
  url.searchParams.set("action", action);
  if (key) url.searchParams.set("apiKey", key);
  for (const [k, v] of Object.entries(extra || {})) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  if (format === "normalized") {
    const address = typeof (extra as any)?.address === "string" ? ((extra as any).address as string) : undefined;
    const decimals = typeof (extra as any)?.decimals === "number" ? ((extra as any).decimals as number) : undefined;
    if (module === "account" && action === "txlist" && address) {
      const items = Array.isArray((json as any)?.result) ? (json as any).result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: String(tx.blockNumber),
        timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
        from: tx.from,
        to: tx.to,
        valueWei: String(tx.value ?? "0"),
        valueFormatted: (() => { try { return `${formatEther(BigInt(tx.value || 0))}`; } catch { return null; } })(),
        gas: tx.gas ? String(tx.gas) : null,
        gasPrice: tx.gasPrice ? String(tx.gasPrice) : null,
        nonce: tx.nonce !== undefined ? Number(tx.nonce) : null,
        status: tx.txreceipt_status === "1" ? "success" : (tx.txreceipt_status === "0" ? "failed" : null),
        direction: tx.from?.toLowerCase() === address.toLowerCase() ? "out" : (tx.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
      })) : [];
      return { chain, endpoint: url.toString(), module, action, params: extra, format, count: items.length, items, raw: json };
    }
    if (module === "account" && action === "txlistinternal" && address) {
      const items = Array.isArray((json as any)?.result) ? (json as any).result.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: String(tx.blockNumber),
        timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
        from: tx.from,
        to: tx.to,
        valueWei: String(tx.value ?? "0"),
        valueFormatted: (() => { try { return `${formatEther(BigInt(tx.value || 0))}`; } catch { return null; } })(),
        traceId: tx.traceId ?? null,
        type: tx.type ?? null,
        contractAddress: tx.contractAddress ?? null,
        isError: tx.isError === "1",
        direction: tx.from?.toLowerCase() === address.toLowerCase() ? "out" : (tx.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
      })) : [];
      return { chain, endpoint: url.toString(), module, action, params: extra, format, count: items.length, items, raw: json };
    }
    if (module === "account" && action === "tokentx" && address) {
      const items = Array.isArray((json as any)?.result) ? (json as any).result.map((ev: any) => {
        const d = Number(ev.tokenDecimal || 0);
        let formatted: string | null = null;
        try { formatted = formatUnits(BigInt(ev.value || 0), d); } catch { formatted = null; }
        return {
          txHash: ev.hash,
          blockNumber: String(ev.blockNumber),
          timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
          token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName, decimals: d },
          from: ev.from,
          to: ev.to,
          amount: { raw: String(ev.value ?? "0"), formatted },
          direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
        };
      }) : [];
      return { chain, endpoint: url.toString(), module, action, params: extra, format, count: items.length, items, raw: json };
    }
    if (module === "account" && action === "tokennfttx" && address) {
      const items = Array.isArray((json as any)?.result) ? (json as any).result.map((ev: any) => ({
        txHash: ev.hash,
        blockNumber: String(ev.blockNumber),
        timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
        token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName },
        from: ev.from,
        to: ev.to,
        tokenId: ev.tokenID ?? ev.tokenId ?? null,
        amount: { raw: "1", formatted: "1" },
        direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
      })) : [];
      return { chain, endpoint: url.toString(), module, action, params: extra, format, count: items.length, items, raw: json };
    }
    if (module === "account" && action === "token1155tx" && address) {
      const items = Array.isArray((json as any)?.result) ? (json as any).result.map((ev: any) => ({
        txHash: ev.hash,
        blockNumber: String(ev.blockNumber),
        timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
        token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName },
        from: ev.from,
        to: ev.to,
        tokenId: ev.tokenID ?? ev.tokenId ?? null,
        amount: { raw: String(ev.tokenValue ?? ev.value ?? "0"), formatted: String(ev.tokenValue ?? ev.value ?? "0") },
        direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
      })) : [];
      return { chain, endpoint: url.toString(), module, action, params: extra, format, count: items.length, items, raw: json };
    }
    if (module === "account" && action === "tokenbalance" && address) {
      const raw = (json as any)?.result ?? null;
      let formatted: string | null = null;
      if (raw != null && typeof decimals === "number") {
        try { formatted = formatUnits(BigInt(raw), decimals); } catch { formatted = null; }
      }
      return { chain, endpoint: url.toString(), module, action, params: extra, format, balance: { raw, formatted, decimals: decimals ?? null }, rawResult: json };
    }
  }
  return {
    chain,
    endpoint: url.toString(),
    module,
    action,
    params: extra,
    result: json,
    format,
  };
};

// Schema: Routescan generic GET under base path
const routescanGetSchema = z.object({
  chain: z
    .string()
    .optional()
    .default("plasma")
    .refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }),
  path: z.string().regex(/^\/?[a-zA-Z0-9_\-\/]*$/, {
    message: "Path must be a relative path without query string",
  }),
  query: z.record(z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanGet = async (params: z.infer<typeof routescanGetSchema>) => {
  const { chain, path, query, apiKey, format } = routescanGetSchema.parse(params);
  const base = getRoutescanBase(chain as ChainId);
  const url = new URL(`${base}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, String(v));
  const key = apiKey ?? ROUTESCAN_API_KEY;
  if (key) url.searchParams.set("apiKey", key);
  const res = await fetch(url.toString());
  const json = await res.json().catch(() => ({}));
  if (format === "normalized" && path.startsWith("etherscan")) {
    return { chain, endpoint: url.toString(), format, note: "For normalization, prefer routescan_etherscan with module/action.", result: json };
  }
  return { chain, endpoint: url.toString(), result: json, format };
};

// ===================== Typed Routescan Account Tools =====================

const commonRangeSchema = {
  startblock: z.number().int().min(0).optional().default(0),
  endblock: z.number().int().min(0).optional().default(99999999),
  page: z.number().int().min(1).optional().default(1),
  offset: z.number().int().min(1).max(10000).optional().default(25),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
};

const routescanAccountTxListSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  ...commonRangeSchema,
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountTxList = async (params: z.infer<typeof routescanAccountTxListSchema>) => {
  const { chain, address, startblock, endblock, page, offset, sort, apiKey, format } = routescanAccountTxListSchema.parse(params);
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "txlist", {
    address,
    startblock,
    endblock,
    page,
    offset,
    sort,
  }, apiKey);
  if (format === "normalized") {
    const items = Array.isArray(result?.result) ? result.result.map((tx: any) => ({
      hash: tx.hash,
      blockNumber: String(tx.blockNumber),
      timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
      from: tx.from,
      to: tx.to,
      valueWei: String(tx.value ?? "0"),
      valueFormatted: (() => { try { return `${formatEther(BigInt(tx.value || 0))}`; } catch { return null; } })(),
      gas: tx.gas ? String(tx.gas) : null,
      gasPrice: tx.gasPrice ? String(tx.gasPrice) : null,
      nonce: tx.nonce !== undefined ? Number(tx.nonce) : null,
      status: tx.txreceipt_status === "1" ? "success" : (tx.txreceipt_status === "0" ? "failed" : null),
      direction: tx.from?.toLowerCase() === address.toLowerCase() ? "out" : (tx.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
    })) : [];
    return { chain, address, endpoint, format, count: items.length, items, raw: result };
  }
  return { chain, address, endpoint, result, format };
};

const routescanAccountTxListInternalSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  ...commonRangeSchema,
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountTxListInternal = async (params: z.infer<typeof routescanAccountTxListInternalSchema>) => {
  const { chain, address, startblock, endblock, page, offset, sort, apiKey, format } = routescanAccountTxListInternalSchema.parse(params);
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "txlistinternal", {
    address,
    startblock,
    endblock,
    page,
    offset,
    sort,
  }, apiKey);
  if (format === "normalized") {
    const items = Array.isArray(result?.result) ? result.result.map((tx: any) => ({
      hash: tx.hash,
      blockNumber: String(tx.blockNumber),
      timestamp: tx.timeStamp ? new Date(Number(tx.timeStamp) * 1000).toISOString() : null,
      from: tx.from,
      to: tx.to,
      valueWei: String(tx.value ?? "0"),
      valueFormatted: (() => { try { return `${formatEther(BigInt(tx.value || 0))}`; } catch { return null; } })(),
      traceId: tx.traceId ?? null,
      type: tx.type ?? null,
      contractAddress: tx.contractAddress ?? null,
      isError: tx.isError === "1",
      direction: tx.from?.toLowerCase() === address.toLowerCase() ? "out" : (tx.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
    })) : [];
    return { chain, address, endpoint, format, count: items.length, items, raw: result };
  }
  return { chain, address, endpoint, result, format };
};

const routescanAccountTokenTxSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  contractAddress: z.string().refine(isAddress, { message: "Invalid contract address" }).optional(),
  ...commonRangeSchema,
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountTokenTx = async (params: z.infer<typeof routescanAccountTokenTxSchema>) => {
  const { chain, address, contractAddress, startblock, endblock, page, offset, sort, apiKey, format } = routescanAccountTokenTxSchema.parse(params);
  const query: Record<string, string | number> = { address, startblock, endblock, page, offset, sort };
  if (contractAddress) query.contractaddress = contractAddress;
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "tokentx", query, apiKey);
  if (format === "normalized") {
    const items = Array.isArray(result?.result) ? result.result.map((ev: any) => {
      const decimals = Number(ev.tokenDecimal || 0);
      let formatted: string | null = null;
      try { formatted = formatUnits(BigInt(ev.value || 0), decimals); } catch { formatted = null; }
      return {
        txHash: ev.hash,
        blockNumber: String(ev.blockNumber),
        timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
        token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName, decimals },
        from: ev.from,
        to: ev.to,
        amount: { raw: String(ev.value ?? "0"), formatted },
        direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
      };
    }) : [];
    return { chain, address, contractAddress: contractAddress || null, endpoint, format, count: items.length, items, raw: result };
  }
  return { chain, address, contractAddress: contractAddress || null, endpoint, result, format };
};

const routescanAccountTokenNftTxSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  contractAddress: z.string().refine(isAddress, { message: "Invalid contract address" }).optional(),
  ...commonRangeSchema,
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountTokenNftTx = async (params: z.infer<typeof routescanAccountTokenNftTxSchema>) => {
  const { chain, address, contractAddress, startblock, endblock, page, offset, sort, apiKey, format } = routescanAccountTokenNftTxSchema.parse(params);
  const query: Record<string, string | number> = { address, startblock, endblock, page, offset, sort };
  if (contractAddress) query.contractaddress = contractAddress;
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "tokennfttx", query, apiKey);
  if (format === "normalized") {
    const items = Array.isArray(result?.result) ? result.result.map((ev: any) => ({
      txHash: ev.hash,
      blockNumber: String(ev.blockNumber),
      timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
      token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName },
      from: ev.from,
      to: ev.to,
      tokenId: ev.tokenID ?? ev.tokenId ?? null,
      amount: { raw: "1", formatted: "1" },
      direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
    })) : [];
    return { chain, address, contractAddress: contractAddress || null, endpoint, format, count: items.length, items, raw: result };
  }
  return { chain, address, contractAddress: contractAddress || null, endpoint, result, format };
};

const routescanAccountToken1155TxSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  contractAddress: z.string().refine(isAddress, { message: "Invalid contract address" }).optional(),
  tokenId: z.union([z.string(), z.number()]).optional(),
  ...commonRangeSchema,
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountToken1155Tx = async (params: z.infer<typeof routescanAccountToken1155TxSchema>) => {
  const { chain, address, contractAddress, tokenId, startblock, endblock, page, offset, sort, apiKey, format } = routescanAccountToken1155TxSchema.parse(params);
  const query: Record<string, string | number> = { address, startblock, endblock, page, offset, sort };
  if (contractAddress) query.contractaddress = contractAddress;
  if (tokenId !== undefined) query.tokenid = tokenId as any;
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "token1155tx", query, apiKey);
  if (format === "normalized") {
    const items = Array.isArray(result?.result) ? result.result.map((ev: any) => ({
      txHash: ev.hash,
      blockNumber: String(ev.blockNumber),
      timestamp: ev.timeStamp ? new Date(Number(ev.timeStamp) * 1000).toISOString() : null,
      token: { address: ev.contractAddress, symbol: ev.tokenSymbol, name: ev.tokenName },
      from: ev.from,
      to: ev.to,
      tokenId: ev.tokenID ?? ev.tokenId ?? null,
      amount: { raw: String(ev.tokenValue ?? ev.value ?? "0"), formatted: String(ev.tokenValue ?? ev.value ?? "0") },
      direction: ev.from?.toLowerCase() === address.toLowerCase() ? "out" : (ev.to?.toLowerCase() === address.toLowerCase() ? "in" : null),
    })) : [];
    return { chain, address, contractAddress: contractAddress || null, tokenId: tokenId ?? null, endpoint, format, count: items.length, items, raw: result };
  }
  return { chain, address, contractAddress: contractAddress || null, tokenId: tokenId ?? null, endpoint, result, format };
};

const routescanAccountTokenBalanceSchema = z.object({
  chain: z.string().optional().default("plasma").refine((val): val is ChainId => Object.keys(CHAINS).includes(val), {
    message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
  }),
  address: z.string().refine(isAddress, { message: "Invalid address" }),
  contractAddress: z.string().refine(isAddress, { message: "Invalid contract address" }),
  tag: z.string().optional().default("latest"),
  decimals: z.number().int().min(0).max(36).optional(),
  format: z.enum(["raw", "normalized"]).optional().default("raw"),
  apiKey: z.string().optional(),
});

export const routescanAccountTokenBalance = async (params: z.infer<typeof routescanAccountTokenBalanceSchema>) => {
  const { chain, address, contractAddress, tag, apiKey, decimals, format } = routescanAccountTokenBalanceSchema.parse(params);
  const { endpoint, result } = await routescanFetch(chain as ChainId, "account", "tokenbalance", {
    address,
    contractaddress: contractAddress,
    tag,
  }, apiKey);
  if (format === "normalized") {
    const raw = result?.result ?? null;
    let formatted: string | null = null;
    if (raw != null && decimals != null) {
      try { formatted = formatUnits(BigInt(raw), decimals); } catch { formatted = null; }
    }
    return { chain, address, contractAddress, endpoint, format, balance: { raw, formatted, decimals: decimals ?? null }, rawResult: result };
  }
  return { chain, address, contractAddress, endpoint, result, format };
};

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

    // Also query Routescan Etherscan-compatible API for cross-check
    const routescan = await routescanFetch(chain as ChainId, "account", "balance", {
      address,
      tag: "latest",
    }).catch((e) => ({ endpoint: null, result: { error: String(e) } } as any));

    return {
      address,
      chain: chainInfo.name,
      balanceWei: balanceWei.toString(),
      balanceFormatted: `${balanceFormatted} ${chainInfo.symbol}`,
      symbol: chainInfo.symbol,
      decimals: chainInfo.decimals,
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Try Routescan getsourcecode (if supported)
    const routescan = await routescanFetch(chain as ChainId, "contract", "getsourcecode", {
      address,
    }).catch((e) => ({ endpoint: null, result: { error: String(e) } } as any));

    return {
      address,
      chain: chainInfo.name,
      isContract,
      bytecodeSize: code ? (code.length - 2) / 2 : 0, // Convert hex string size to bytes
      bytecode: code || "0x",
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Routescan gas oracle
    const routescan = await routescanFetch(chain as ChainId, "gastracker", "gasoracle").catch(
      (e) => ({ endpoint: null, result: { error: String(e) } } as any)
    );

    return {
      chain: chainInfo.name,
      gasPriceWei: gasPriceWei.toString(),
      gasPriceGwei: gasPriceGwei.toFixed(2),
      timestamp: new Date().toISOString(),
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Try Routescan Etherscan-compatible getLogs as well
    const rsParams: Record<string, any> = {};
    if (address) rsParams.address = address;
    if (fromBlock !== undefined) rsParams.fromBlock = fromBlock;
    if (toBlock !== undefined) rsParams.toBlock = toBlock;
    if (topics) {
      // Etherscan expects topics as topic0, topic1, ... optionally with topic0_2_opr
      topics.forEach((t, i) => {
        if (typeof t === "string") rsParams[`topic${i}`] = t;
        else if (Array.isArray(t)) rsParams[`topic${i}`] = t.join(",");
      });
    }
    if (blockHash) rsParams.blockhash = blockHash;
    const routescan = await routescanFetch(chain as ChainId, "logs", "getLogs", rsParams).catch(
      (e) => ({ endpoint: null, result: { error: String(e) } } as any)
    );

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
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Routescan proxy eth_call
    const rsParams: Record<string, any> = { to, data };
    if (from) rsParams.from = from;
    if (gas) rsParams.gas = gas;
    if (gasPrice) rsParams.gasPrice = gasPrice;
    if (value) rsParams.value = value;
    if (blockNumber) rsParams.tag = blockNumber;
    const routescan = await routescanFetch(chain as ChainId, "proxy", "eth_call", rsParams).catch(
      (e) => ({ endpoint: null, result: { error: String(e) } } as any)
    );

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
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Routescan proxy eth_blockNumber
    const routescan = await routescanFetch(chain as ChainId, "proxy", "eth_blockNumber").catch(
      (e) => ({ endpoint: null, result: { error: String(e) } } as any)
    );

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
      rpc: { endpoint: chainInfo.rpc },
      routescan,
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

    // Routescan proxy eth_getTransactionByHash
    const routescan = await routescanFetch(chain as ChainId, "proxy", "eth_getTransactionByHash", {
      txhash: hash,
    }).catch((e) => ({ endpoint: null, result: { error: String(e) } } as any));

    return { ...formattedTx, rpc: { endpoint: chainInfo.rpc }, routescan };
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
  routescan_addresses: {
    handler: listRoutescanAddresses,
    schema: routescanAddressesSchema,
    description: "List recent addresses via Routescan explorer API",
  },
  routescan_etherscan: {
    handler: routescanEtherscanQuery,
    schema: routescanEtherscanSchema,
    description: "Query Routescan's Etherscan-compatible endpoint (module/action)",
  },
  routescan_get: {
    handler: routescanGet,
    schema: routescanGetSchema,
    description: "Generic GET under Routescan API base (arbitrary path+query)",
  },
  routescan_account_txlist: {
    handler: routescanAccountTxList,
    schema: routescanAccountTxListSchema,
    description: "List normal transactions for an address (Etherscan account/txlist)",
  },
  routescan_account_txlistinternal: {
    handler: routescanAccountTxListInternal,
    schema: routescanAccountTxListInternalSchema,
    description: "List internal transactions for an address (Etherscan account/txlistinternal)",
  },
  routescan_account_tokentx: {
    handler: routescanAccountTokenTx,
    schema: routescanAccountTokenTxSchema,
    description: "List ERC20 token transfers for an address (Etherscan account/tokentx)",
  },
  routescan_account_tokennfttx: {
    handler: routescanAccountTokenNftTx,
    schema: routescanAccountTokenNftTxSchema,
    description: "List ERC721 NFT transfers for an address (Etherscan account/tokennfttx)",
  },
  routescan_account_token1155tx: {
    handler: routescanAccountToken1155Tx,
    schema: routescanAccountToken1155TxSchema,
    description: "List ERC1155 token transfers for an address (Etherscan account/token1155tx)",
  },
  routescan_account_tokenbalance: {
    handler: routescanAccountTokenBalance,
    schema: routescanAccountTokenBalanceSchema,
    description: "Get ERC20 token balance for an address (Etherscan account/tokenbalance)",
  },
};
