import { z } from "zod";

export const registerRoutescanTypedPrompts = (server: any) => {
  server.prompt(
    "wallet-activity",
    z.object({ address: z.string(), chain: z.string().optional().default("plasma") }).shape,
    ({ address, chain = "plasma" }: { address: string; chain?: string }) => ({
      description: "Summarize recent wallet activity using Routescan tx lists",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze recent activity for ${address} on ${chain}:
- Call routescan_account_txlist for normal transactions (desc, offset=25).
- Call routescan_account_txlistinternal for internal transactions (desc, offset=25).
- Summarize counts, most recent actions, counterparties, and notable patterns.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "token-balance",
    z.object({ address: z.string(), contractAddress: z.string(), chain: z.string().optional().default("plasma") }).shape,
    ({ address, contractAddress, chain = "plasma" }: { address: string; contractAddress: string; chain?: string }) => ({
      description: "Check ERC20 token balance via Routescan",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Get ERC20 balance for ${address} on ${chain}:
- Use routescan_account_tokenbalance with contractAddress=${contractAddress}.
- If decimals/symbol are needed, query routescan_etherscan (module=contract, action=getsourcecode) or call contract via eth_call for decimals/symbol.
- Present the raw balance and a human-readable estimate if decimals are known.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "token-transfers",
    z.object({
      address: z.string(),
      contractAddress: z.string().optional(),
      chain: z.string().optional().default("plasma"),
      type: z.enum(["erc20", "erc721", "erc1155"]).optional().default("erc20"),
    }).shape,
    ({ address, contractAddress, chain = "plasma", type = "erc20" }: { address: string; contractAddress?: string; chain?: string; type?: "erc20"|"erc721"|"erc1155" }) => ({
      description: "Fetch recent token transfers for an address via Routescan",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Get recent ${type.toUpperCase()} transfers for ${address} on ${chain}:
- If erc20: use routescan_account_tokentx${contractAddress ? ` with contractAddress=${contractAddress}` : ""}.
- If erc721: use routescan_account_tokennfttx${contractAddress ? ` with contractAddress=${contractAddress}` : ""}.
- If erc1155: use routescan_account_token1155tx${contractAddress ? ` with contractAddress=${contractAddress}` : ""}.
- Summarize transfer counts, top tokens/collections, and largest transfers.`,
          },
        },
      ],
    })
  );

  return server;
};

