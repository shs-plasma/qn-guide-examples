"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const tools_1 = require("./tools");
const prompts_1 = require("./prompts");
const resources_1 = require("./resources");
async function main() {
    try {
        // Create the MCP server
        const server = new mcp_js_1.McpServer({
            name: "EVM MCP Server",
            version: "0.1.0",
            description: "A server for LLM agents to access EVM blockchain data",
        });
        // Register all tools, prompts, and resources
        (0, tools_1.registerTools)(server);
        (0, prompts_1.registerPrompts)(server);
        (0, resources_1.registerResources)(server);
        // Start the MCP server
        const transport = new stdio_js_1.StdioServerTransport();
        await server.connect(transport);
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
// Run the main function
main().catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
});
