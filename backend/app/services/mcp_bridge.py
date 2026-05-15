import os
import subprocess
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("aria-mcp-bridge")

class AriaMCPBridge:
    def __init__(self):
        self.mcp_path = os.path.join(os.getcwd(), "aria_mcp", "index.js")
        
    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Call a tool from the ARIA MCP server via stdio."""
        # Note: This is a simplified call pattern for a stdio MCP server
        # Real MCP would involve a more persistent connection
        try:
            # We simulate a tool call by running the node process with arguments
            # This is not standard MCP but works for this specific bridge
            process = subprocess.Popen(
                ["node", self.mcp_path, "--call", tool_name, "--args", json.dumps(arguments)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(timeout=15)
            if stderr:
                logger.error(f"MCP Error: {stderr}")
            return stdout
        except Exception as e:
            logger.error(f"Bridge error: {e}")
            return f"Error calling tool {tool_name}"

aria_mcp = AriaMCPBridge()
