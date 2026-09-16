// // require("dotenv").config();
// // const express = require("express");
// // const cors = require("cors");
// // const path = require("path");
// // const { GoogleGenAI } = require("@google/genai");
// // const { functionDeclarations, handlerByName } = require("./mcp/geminiTools");

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // // --- The MCP server itself (same code that goes in your real project, and
// // // what the MCP Inspector connects to for the no-AI-needed test) ---
// // app.use("/mcp", require("./mcp/router"));

// // app.get("/health", (req, res) => res.json({ status: "ok" }));

// // // Serve the test chat UI at http://localhost:PORT/
// // app.use(express.static(path.join(__dirname, "..", "frontend")));

// // // --- Chat bridge, powered by Google Gemini (free tier, no credit card) ---
// // // This calls your tool functions directly in-process — no MCP protocol hop,
// // // no public URL, no ngrok needed for this endpoint.
// // const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// // const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// // const SYSTEM_INSTRUCTION =
// //   "You are the website assistant for Erith. Answer questions about products, industries, blogs, jobs and success stories using the provided tools — never invent product specs, prices, or job details. If you don't have the information, say so.";

// // app.post("/api/chat", async (req, res) => {
// //   try {
// //     const { message, history = [] } = req.body;
// //     if (!message) return res.status(400).json({ error: "message is required" });
// //     if (!ai) {
// //       return res.status(500).json({
// //         error:
// //           "GEMINI_API_KEY is not set on the server. Get a free key at https://aistudio.google.com/apikey and add it to .env, then restart the server.",
// //       });
// //     }

// //     // Gemini's "contents" format: alternating user/model turns.
// //     const contents = [
// //       ...history.map((h) => ({
// //         role: h.role === "assistant" ? "model" : "user",
// //         parts: [{ text: h.content }],
// //       })),
// //       { role: "user", parts: [{ text: message }] },
// //     ];

// //     const config = {
// //       systemInstruction: SYSTEM_INSTRUCTION,
// //       tools: [{ functionDeclarations }],
// //     };

// //     const toolCallLog = [];

// //     // Function-calling loop: keep going while Gemini asks to call tools,
// //     // capped so a runaway loop can't hang the request forever.
// //     for (let turn = 0; turn < 5; turn++) {
// //       const response = await ai.models.generateContent({
// //         model: "gemini-2.5-flash",
// //         contents,
// //         config,
// //       });

// //       const calls = response.functionCalls || [];
// //       if (!calls.length) {
// //         return res.json({ reply: response.text || "(no text response)", tool_calls: toolCallLog });
// //       }

// //       // Echo the model's turn (including its function call) back into history...
// //       contents.push({ role: "model", parts: response.candidates[0].content.parts });

// //       // ...then run each requested tool and feed the results back.
// //       const responseParts = [];
// //       for (const call of calls) {
// //         toolCallLog.push({ name: call.name, args: call.args });
// //         const handler = handlerByName[call.name];
// //         let result;
// //         try {
// //           result = handler ? await handler(call.args || {}) : { error: `Unknown tool: ${call.name}` };
// //         } catch (err) {
// //           result = { error: err.message };
// //         }
// //         responseParts.push({
// //           functionResponse: { name: call.name, response: { result } },
// //         });
// //       }
// //       contents.push({ role: "user", parts: responseParts });
// //     }

// //     res.json({ reply: "(stopped after several tool calls — try a more specific question)", tool_calls: toolCallLog });
// //   } catch (err) {
// //     console.error("Chat error:", err);
// //     res.status(500).json({ error: err.message || "Something went wrong." });
// //   }
// // });

// // const PORT = process.env.PORT || 5050;
// // app.listen(PORT, () => {
// //   console.log(`Test backend listening on http://localhost:${PORT}`);
// //   console.log(`MCP endpoint:            http://localhost:${PORT}/mcp`);
// //   console.log(`Chat endpoint:           http://localhost:${PORT}/api/chat`);
// // });


// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const { GoogleGenAI } = require("@google/genai");
// const { functionDeclarations, handlerByName } = require("./mcp/geminiTools");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // --- The MCP server itself (same code that goes in your real project, and
// // what the MCP Inspector connects to for the no-AI-needed test) ---
// app.use("/mcp", require("./mcp/router"));

// app.get("/health", (req, res) => res.json({ status: "ok" }));

// // Serve the test chat UI at http://localhost:PORT/
// app.use(express.static(path.join(__dirname, "..", "frontend")));

// // --- Chat bridge, powered by Google Gemini (free tier, no credit card) ---
// // This calls your tool functions directly in-process — no MCP protocol hop,
// // no public URL, no ngrok needed for this endpoint.
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// const SYSTEM_INSTRUCTION =
//   "You are the website assistant for Erith. Answer questions about products, industries, blogs, jobs and success stories using the provided tools — never invent product specs, prices, or job details. If you don't have the information, say so.";

// app.post("/api/chat", async (req, res) => {
//   try {
//     const { message, history = [] } = req.body;
//     if (!message) return res.status(400).json({ error: "message is required" });
//     if (!ai) {
//       return res.status(500).json({
//         error:
//           "GEMINI_API_KEY is not set on the server. Get a free key at https://aistudio.google.com/apikey and add it to .env, then restart the server.",
//       });
//     }

//     // Gemini's "contents" format: alternating user/model turns.
//     const contents = [
//       ...history.map((h) => ({
//         role: h.role === "assistant" ? "model" : "user",
//         parts: [{ text: h.content }],
//       })),
//       { role: "user", parts: [{ text: message }] },
//     ];

//     const config = {
//       systemInstruction: SYSTEM_INSTRUCTION,
//       tools: [{ functionDeclarations }],
//     };

//     const toolCallLog = [];

//     // Function-calling loop: keep going while Gemini asks to call tools,
//     // capped so a runaway loop can't hang the request forever.
//     for (let turn = 0; turn < 5; turn++) {
//       const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents,
//         config,
//       });

//       const calls = response.functionCalls || [];
//       if (!calls.length) {
//         return res.json({ reply: response.text || "(no text response)", tool_calls: toolCallLog });
//       }

//       // Echo the model's turn (including its function call) back into history...
//       contents.push({ role: "model", parts: response.candidates[0].content.parts });

//       // ...then run each requested tool and feed the results back.
//       const responseParts = [];
//       for (const call of calls) {
//         toolCallLog.push({ name: call.name, args: call.args });
//         const handler = handlerByName[call.name];
//         let result;
//         try {
//           result = handler ? await handler(call.args || {}) : { error: `Unknown tool: ${call.name}` };
//         } catch (err) {
//           result = { error: err.message };
//         }
//         responseParts.push({
//           functionResponse: { name: call.name, response: { result } },
//         });
//       }
//       contents.push({ role: "user", parts: responseParts });
//     }

//     res.json({ reply: "(stopped after several tool calls — try a more specific question)", tool_calls: toolCallLog });
//   } catch (err) {
//     console.error("Chat error:", err);
//     res.status(500).json({ error: err.message || "Something went wrong." });
//   }
// });

// const PORT = process.env.PORT || 5050;
// app.listen(PORT, () => {
//   console.log(`Test backend listening on http://localhost:${PORT}`);
//   console.log(`MCP endpoint:            http://localhost:${PORT}/mcp`);
//   console.log(`Chat endpoint:           http://localhost:${PORT}/api/chat`);
// });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const { functionDeclarations, handlerByName } = require("./mcp/geminiTools");

const app = express();
app.use(cors());
app.use(express.json());

// --- The MCP server itself (same code that goes in your real project, and
// what the MCP Inspector connects to for the no-AI-needed test) ---
app.use("/mcp", require("./mcp/router"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Serve the test chat UI at http://localhost:PORT/
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- Chat bridge, powered by Google Gemini (free tier, no credit card) ---
// This calls your tool functions directly in-process — no MCP protocol hop,
// no public URL, no ngrok needed for this endpoint.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const SYSTEM_INSTRUCTION =
  "You are the website assistant for Erith. Answer questions about products, industries, blogs, jobs and success stories using the provided tools — never invent product specs, prices, or job details. If you don't have the information, say so. Be efficient: call only the tools you need to answer the specific question asked, and give a final answer as soon as you have enough information rather than exploring every available tool.";

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });
    if (!ai) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY is not set on the server. Get a free key at https://aistudio.google.com/apikey and add it to .env, then restart the server.",
      });
    }

    // Gemini's "contents" format: alternating user/model turns.
    const contents = [
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const config = {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations }],
    };

    const toolCallLog = [];

    // Function-calling loop: keep going while Gemini asks to call tools,
    // capped so a runaway loop can't hang the request or blow through quota.
    const MAX_TURNS = 8;
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents,
        config,
      });

      const calls = response.functionCalls || [];
      if (!calls.length) {
        return res.json({ reply: response.text || "(no text response)", tool_calls: toolCallLog });
      }

      // Echo the model's turn (including its function call) back into history...
      contents.push({ role: "model", parts: response.candidates[0].content.parts });

      // ...then run each requested tool and feed the results back.
      const responseParts = [];
      for (const call of calls) {
        toolCallLog.push({ name: call.name, args: call.args });
        const handler = handlerByName[call.name];
        let result;
        try {
          result = handler ? await handler(call.args || {}) : { error: `Unknown tool: ${call.name}` };
        } catch (err) {
          result = { error: err.message };
        }
        responseParts.push({
          functionResponse: { name: call.name, response: { result } },
        });
      }
      contents.push({ role: "user", parts: responseParts });
    }

    // Hit MAX_TURNS without a final answer — rather than leaving the user
    // with nothing, force one last call with tools disabled so Gemini must
    // summarize using whatever it already gathered.
    contents.push({
      role: "user",
      parts: [{ text: "Please give your best answer now, in plain text, using only the information already gathered above. Do not call any more tools." }],
    });
    const finalResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION }, // no tools this time
    });
    return res.json({
      reply: finalResponse.text || "I gathered some information but couldn't finish summarizing it — try asking a narrower question.",
      tool_calls: toolCallLog,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Something went wrong." });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Test backend listening on http://localhost:${PORT}`);
  console.log(`MCP endpoint:            http://localhost:${PORT}/mcp`);
  console.log(`Chat endpoint:           http://localhost:${PORT}/api/chat`);
});