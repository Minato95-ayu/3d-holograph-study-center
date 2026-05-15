const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const axios = require("axios");
const cheerio = require("cheerio");

const server = new Server(
  {
    name: "aria-research-hub",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Tool: Deep Scientific Search
 */
const scientificSearchTool = {
  name: "deep_scientific_search",
  description: "Scrapes the web for deep scientific research papers, formulas, and structural data.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The scientific topic to research" },
    },
    required: ["query"],
  },
};

/**
 * Tool: Find 3D Blueprint
 */
const find3DBlueprintTool = {
  name: "find_3d_blueprint",
  description: "Finds references to 3D models (GLB/GLTF) on repositories like Sketchfab.",
  inputSchema: {
    type: "object",
    properties: {
      topic: { type: "string", description: "The object to find a 3D model for" },
    },
    required: ["topic"],
  },
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [scientificSearchTool, find3DBlueprintTool],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "deep_scientific_search") {
    const { query } = args;
    try {
      const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query + " scientific research paper formula")}`);
      const $ = cheerio.load(response.data);
      let results = [];
      $('div.g').each((i, el) => {
        if (i < 3) {
          const title = $(el).find('h3').text();
          const snippet = $(el).find('div.VwiC3b').text();
          results.append({ title, snippet });
        }
      });
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error searching: ${error.message}` }],
        isError: true,
      };
    }
  }

  if (name === "find_3d_blueprint") {
    const { topic } = args;
    try {
      const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(topic + " 3d model sketchfab gltf")}`);
      const $ = cheerio.load(response.data);
      let links = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('sketchfab.com/3d-models/')) {
          links.push(href);
        }
      });
      return {
        content: [{ type: "text", text: `Possible 3D Blueprints for ${topic}:\n${links.slice(0, 5).join('\n')}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error finding 3D assets: ${error.message}` }],
        isError: true,
      };
    }
  }

  throw new Error(`Tool not found: ${name}`);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ARIA Research Hub MCP Server running on stdio");
}

run().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
