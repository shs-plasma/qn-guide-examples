import { z } from "zod";
import { isAddress } from "viem";
import { ChainId, CHAINS } from "./chains";

// Register prompts with the MCP server
export const registerPrompts = (server: any) => {
  // Register check-wallet prompt
  server.prompt(
    "check-wallet",
    checkWalletSchema.shape,
    ({ address, chain = "plasma" }: { address: string; chain?: string }) => ({
      description: "Guide for analyzing a wallet's balance and context",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please analyze this wallet address: ${address} on ${chain} chain.
            
You need to analyze a wallet address on an EVM blockchain.
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

First, use the eth_getBalance tool to check the wallet's balance.
Next, use the eth_getCode tool to verify if it's a regular wallet or a contract.

Once you have this information, provide a summary of:
1. The wallet's address
2. The chain it's on
3. Its balance in the native token
4. Whether it's a regular wallet (EOA) or a contract
5. Any relevant observations about the balance (e.g., if it's empty, has significant funds, etc.)

Aim to be concise but informative in your analysis.`,
          },
        },
      ],
    })
  );

  // Register check-contract prompt
  server.prompt(
    "check-contract",
    checkContractSchema.shape,
    ({ address, chain = "plasma" }: { address: string; chain?: string }) => ({
      description: "Prompt contract code introspection and analysis",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please analyze this contract address: ${address} on ${chain} chain.
            
You need to analyze a contract address on an EVM blockchain.
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

First, use the eth_getCode tool to verify if the address actually contains contract code.
If it's a contract, note the bytecode size as an indicator of complexity.
Then, use the eth_getBalance tool to check if the contract holds any native tokens.

Provide a summary with:
1. Confirmation if it's a contract or not
2. The contract's size in bytes
3. Any balance of native tokens it holds
4. What these findings might indicate (e.g., active contract with funds, abandoned contract, etc.)

Be analytical but accessible in your explanation.`,
          },
        },
      ],
    })
  );

  // Register gas-analysis prompt
  server.prompt("gas-analysis", gasAnalysisSchema.shape, ({ chain = "plasma" }: { chain?: string }) => ({
    description: "Analyze gas price trends and evaluate timing",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the current gas prices on the ${chain} chain.
            
You need to analyze the current gas price on an EVM blockchain.
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

Use the eth_gasPrice tool to retrieve the current gas price.

Provide a short analysis:
1. The current gas price in Gwei
2. What this means for transaction costs
3. Whether this is relatively high, medium, or low based on recent trends
4. Recommendations for users (wait for lower gas, proceed with transactions, etc.)

Keep your analysis concise, focusing on actionable insights.`,
        },
      },
    ],
  }));

  // Register transaction-lookup prompt
  server.prompt(
    "transaction-lookup",
    transactionLookupSchema.shape,
    ({ hash, chain = "plasma" }: { hash: string; chain?: string }) => ({
      description: "Look up and analyze a transaction by its hash",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please look up and analyze this transaction: ${hash} on ${chain} chain.
            
Use the eth_getTransactionByHash tool to retrieve the transaction details.
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

Provide a summary including:
1. Transaction status (pending/confirmed)
2. From and To addresses
3. Value transferred
4. Gas used and gas price
5. Any other relevant details

Make the analysis clear and easy to understand.`,
          },
        },
      ],
    })
  );

  // Register block-info prompt
  server.prompt(
    "block-info",
    blockInfoSchema.shape,
    ({ chain = "plasma" }: { chain?: string }) => ({
      description: "Get current block information for a chain",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please get the current block information for the ${chain} chain.
            
Use the eth_blockNumber tool to retrieve the latest block number.
By default it is going to be on Plasma chain.
<<<<<<< HEAD:AI/evm-mcp-server/prompts.ts
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.
=======
>>>>>>> 29c83d89254999e4a2c61b056967224003779df5:evm-mcp-server/prompts.ts

Provide:
1. The current block number
2. What this means for the chain's activity
3. Approximate block time if known for this chain

Keep the response brief and informative.`,
          },
        },
      ],
    })
  );

  return server;
};

// Schema for check-wallet prompt (with optional chain, defaults to plasma)
const checkWalletSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }
  ),
});

// Schema for check-contract prompt (with optional chain, defaults to plasma)
const checkContractSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "Invalid Ethereum address format",
  }),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }
  ),
});

// Schema for gas-analysis prompt (with optional chain, defaults to plasma)
const gasAnalysisSchema = z.object({
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }
  ),
});

// Schema for transaction-lookup prompt (new)
const transactionLookupSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, {
    message: "Invalid transaction hash format",
  }),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }
  ),
});

// Schema for block-info prompt (new)
const blockInfoSchema = z.object({
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    {
      message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}`,
    }
  ),
});

// New: Cross-check wallet using RPC + Routescan
const crossCheckWalletSchema = z.object({
  address: z.string().refine(isAddress, { message: "Invalid Ethereum address format" }),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
});

// New: Cross-check transaction using RPC + Routescan
const crossCheckTxSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
});

// New: Routescan explore prompt
const routescanExploreSchema = z.object({
  chain: z.string().optional().default("plasma").refine(
    (val): val is ChainId => Object.keys(CHAINS).includes(val),
    { message: `Unsupported chain. Use one of: ${Object.keys(CHAINS).join(", ")}` }
  ),
  module: z.string().optional(),
  action: z.string().optional(),
});

// Register new prompts
export const registerRoutescanPrompts = (server: any) => {
  server.prompt(
    "cross-check-wallet",
    crossCheckWalletSchema.shape,
    ({ address, chain = "plasma" }: { address: string; chain?: string }) => ({
      description: "Compare balance via QuickNode RPC and Routescan",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Cross-check this wallet on ${chain}: ${address}.

Steps:
- Use eth_getBalance for on-chain RPC balance.
- Use routescan_etherscan with module=account, action=balance for explorer balance.
- If mismatched, explain possible reasons (indexing lag, pending state, tags).
Provide a concise summary with both values and your conclusion.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "cross-check-transaction",
    crossCheckTxSchema.shape,
    ({ hash, chain = "plasma" }: { hash: string; chain?: string }) => ({
      description: "Compare transaction details via RPC and Routescan",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Cross-check this transaction on ${chain}: ${hash}.

Steps:
- Use eth_getTransactionByHash to pull on-chain details (and receipt if available).
- Use routescan_etherscan with module=proxy, action=eth_getTransactionByHash.
- Compare status, gas, value, and logs if present. Call out differences and likely causes.
Return a short, clear comparison table in text.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "routescan-explore",
    routescanExploreSchema.shape,
    ({ chain = "plasma", module, action }: { chain?: string; module?: string; action?: string }) => ({
      description: "Use Routescan explorer APIs to browse data",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Explore Plasma data via Routescan on ${chain}.

Suggestions:
- To browse fresh addresses, call routescan_addresses with a limit.
- For Etherscan-style queries, call routescan_etherscan with module/action${module ? ` (module=${module})` : ""}${action ? ` (action=${action})` : ""}.
- For other endpoints, call routescan_get with an appropriate path and query params.
Return a brief summary and include raw JSON snippets if helpful.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "routescan-logs",
    z.object({
      chain: z.string().optional().default("plasma"),
      address: z.string().optional(),
    }).shape,
    ({ chain = "plasma", address }: { chain?: string; address?: string }) => ({
      description: "Fetch logs from both RPC and Routescan",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Get recent logs${address ? ` for ${address}` : ""} on ${chain} using both:
- eth_getLogs (RPC)
- routescan_etherscan (module=logs, action=getLogs)
Compare counts and sample a couple entries. Note any differences.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "routescan-contract",
    z.object({ address: z.string(), chain: z.string().optional().default("plasma") }).shape,
    ({ address, chain = "plasma" }: { address: string; chain?: string }) => ({
      description: "Inspect contract via Routescan and verify status",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `For ${address} on ${chain}:
- Use eth_getCode to determine if it's a contract.
- Use routescan_etherscan (module=contract, action=getsourcecode) to check explorer metadata.
- If sources absent but you have metadata/sources, consider contract_verify tool.
Summarize findings and next steps.`,
          },
        },
      ],
    })
  );

  return server;
};

// Original prompts object kept for reference
export const prompts = {
  'check-wallet': {
    schema: checkWalletSchema,
    prompt: `## Network policy: Plasma mainnet only
- Unless the user explicitly specifies a different network, you must assume and reference **only Plasma mainnet**.
- Do **NOT** use, suggest, or reference other networks such as Polygon, BSC/BNB Chain, Base, Arbitrum, Optimism, Avalanche, Solana, etc.
- If a user explicitly asks for a non‑Plasma chain, acknowledge the request and switch context; otherwise remain strictly on Plasma mainnet.
- When a chain is unspecified in inputs or addresses, default to Plasma mainnet.
- If an address/contract appears to be from a different network, ask for the Plasma mainnet equivalent or explicit permission to switch networks.\n\n
You need to analyze a wallet address on an EVM blockchain.
By default it is going to be on Plasma chain.
<<<<<<< HEAD:AI/evm-mcp-server/prompts.ts
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.
=======
>>>>>>> 29c83d89254999e4a2c61b056967224003779df5:evm-mcp-server/prompts.ts

First, use the eth_getBalance tool to check the wallet's balance.
Next, use the eth_getCode tool to verify if it's a regular wallet or a contract.

Once you have this information, provide a summary of:
1. The wallet's address
2. The chain it's on (defaults to Plasma if not specified)
3. Its balance in the native token
4. Whether it's a regular wallet (EOA) or a contract
5. Any relevant observations about the balance (e.g., if it's empty, has significant funds, etc.)

Aim to be concise but informative in your analysis.
    `,
  },
  
  'check-contract': {
    schema: checkContractSchema,
    prompt: `## Network policy: Plasma mainnet only
- Unless the user explicitly specifies a different network, you must assume and reference **only Plasma mainnet**.
- Do **NOT** use, suggest, or reference other networks such as Polygon, BSC/BNB Chain, Base, Arbitrum, Optimism, Avalanche, Solana, etc.
- If a user explicitly asks for a non‑Plasma chain, acknowledge the request and switch context; otherwise remain strictly on Plasma mainnet.
- When a chain is unspecified in inputs or addresses, default to Plasma mainnet.
- If an address/contract appears to be from a different network, ask for the Plasma mainnet equivalent or explicit permission to switch networks.\n\n
You need to analyze a contract address on an EVM blockchain.
By default it is going to be on Plasma chain.
<<<<<<< HEAD:AI/evm-mcp-server/prompts.ts
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.
=======
>>>>>>> 29c83d89254999e4a2c61b056967224003779df5:evm-mcp-server/prompts.ts

First, use the eth_getCode tool to verify if the address actually contains contract code.
If it's a contract, note the bytecode size as an indicator of complexity.
Then, use the eth_getBalance tool to check if the contract holds any native tokens.

Provide a summary with:
1. Confirmation if it's a contract or not
2. The contract's size in bytes
3. Any balance of native tokens it holds (in XPL for Plasma chain)
4. What these findings might indicate (e.g., active contract with funds, abandoned contract, etc.)

Be analytical but accessible in your explanation.
    `,
  },
  
  'gas-analysis': {
    schema: gasAnalysisSchema,
    prompt: `## Network policy: Plasma mainnet only
- Unless the user explicitly specifies a different network, you must assume and reference **only Plasma mainnet**.
- Do **NOT** use, suggest, or reference other networks such as Polygon, BSC/BNB Chain, Base, Arbitrum, Optimism, Avalanche, Solana, etc.
- If a user explicitly asks for a non‑Plasma chain, acknowledge the request and switch context; otherwise remain strictly on Plasma mainnet.
- When a chain is unspecified in inputs or addresses, default to Plasma mainnet.
- If an address/contract appears to be from a different network, ask for the Plasma mainnet equivalent or explicit permission to switch networks.\n\n
You need to analyze the current gas price on an EVM blockchain (defaults to Plasma).
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

Use the eth_gasPrice tool to retrieve the current gas price.

Provide a short analysis:
1. The current gas price in Gwei
2. What this means for transaction costs
3. Whether this is relatively high, medium, or low based on recent trends
4. Recommendations for users (wait for lower gas, proceed with transactions, etc.)

Keep your analysis concise, focusing on actionable insights.
    `,
  },

  'transaction-lookup': {
    schema: transactionLookupSchema,
    prompt: `## Network policy: Plasma mainnet only
- Unless the user explicitly specifies a different network, you must assume and reference **only Plasma mainnet**.
- Do **NOT** use, suggest, or reference other networks such as Polygon, BSC/BNB Chain, Base, Arbitrum, Optimism, Avalanche, Solana, etc.
- If a user explicitly asks for a non‑Plasma chain, acknowledge the request and switch context; otherwise remain strictly on Plasma mainnet.
- When a chain is unspecified in inputs or addresses, default to Plasma mainnet.
- If an address/contract appears to be from a different network, ask for the Plasma mainnet equivalent or explicit permission to switch networks.\n\n
You need to look up a transaction by its hash on an EVM blockchain (defaults to Plasma).
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

Use the eth_getTransactionByHash tool to retrieve the transaction details.

Provide a summary including:
1. Transaction status (pending/confirmed)
2. From and To addresses
3. Value transferred in the native token
4. Gas used and gas price
5. Any other relevant details

Make the analysis clear and easy to understand.
    `,
  },

  'block-info': {
    schema: blockInfoSchema,
    prompt: `## Network policy: Plasma mainnet only
- Unless the user explicitly specifies a different network, you must assume and reference **only Plasma mainnet**.
- Do **NOT** use, suggest, or reference other networks such as Polygon, BSC/BNB Chain, Base, Arbitrum, Optimism, Avalanche, Solana, etc.
- If a user explicitly asks for a non‑Plasma chain, acknowledge the request and switch context; otherwise remain strictly on Plasma mainnet.
- When a chain is unspecified in inputs or addresses, default to Plasma mainnet.
- If an address/contract appears to be from a different network, ask for the Plasma mainnet equivalent or explicit permission to switch networks.\n\n
You need to get the current block information for an EVM blockchain (defaults to Plasma).
By default it is going to be on Plasma chain.
Do not use Polygon, BSC, Base, or any other network unless the user explicitly specifies it. If unspecified, always assume Plasma mainnet.

Use the eth_blockNumber tool to retrieve the latest block number.

Provide:
1. The current block number
2. What this means for the chain's activity
3. Approximate block time if known for this chain

Keep the response brief and informative.
    `,
  },
};
