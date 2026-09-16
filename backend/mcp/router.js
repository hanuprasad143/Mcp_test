const express = require("express");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { registerTools } = require("./tools");

const router = express.Router();

// Shared-secret auth so random people on the internet can't query/write to your DB.
// Whatever calls this endpoint (your chatbot backend, Claude via the MCP connector, etc.)
// must send this header on every request:
//   x-api-key: <MCP_API_KEY>
const API_KEY = process.env.MCP_API_KEY;

function checkAuth(req, res, next) {
  if (!API_KEY) return next(); // no key configured -> auth disabled (dev only, NOT for production)
  const provided =
    req.header("x-api-key") || (req.header("authorization") || "").replace(/^Bearer\s+/i, "");
  if (provided !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Stateless mode: a fresh McpServer + transport per request. Simplest, most
 * robust setup for a server whose only job is answering tool calls — no
 * session/cookie state to manage, and it plays nicely with Render's
 * autoscaling / cold starts.
 */
async function handleMcpRequest(req, res) {
  const server = new McpServer({ name: "erith-website-mcp", version: "1.0.0" });
  registerTools(server);

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

router.post("/", checkAuth, handleMcpRequest);

// Stateless mode doesn't use GET/DELETE — respond cleanly instead of hanging.
router.get("/", (req, res) => {
  res.status(405).json({ error: "Method not allowed. This server is stateless: use POST /mcp." });
});
router.delete("/", (req, res) => {
  res.status(405).json({ error: "Method not allowed. This server is stateless: use POST /mcp." });
});

module.exports = router;
