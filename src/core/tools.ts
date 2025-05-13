import { FastMCP } from 'fastmcp';
import { registerMemoryTools } from '../memory/tools.js';
import { registerThinkTools } from '../think/tools.js';
import { registerTaskTools } from '../tasks/tools.js';
import { registerUtilityTools } from '../utils/tools.js';
import { registerResearchTools } from '../research/index.js';

/**
 * Register all tools with the server
 * @param server FastMCP server instance
 */
export async function registerAllTools(server: FastMCP): Promise<void> {
  try {
    // Register memory tools
    console.error('[INFO] [tools] Registering memory tools...');
    registerMemoryTools(server);
    
    // Register think tools
    console.error('[INFO] [tools] Registering think tools...');
    registerThinkTools(server);
    
    // Register task tools
    console.error('[INFO] [tools] Registering task tools...');
    registerTaskTools(server);
    
    // Register utility tools
    console.error('[INFO] [tools] Registering utility tools...');
    registerUtilityTools(server);
    
    // Register research tools
    console.error('[INFO] [tools] Registering research tools...');
    registerResearchTools(server);
    
    console.error('[INFO] [tools] All tools registered successfully');
  } catch (error) {
    console.error(`[ERROR] [tools] Error registering tools: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 