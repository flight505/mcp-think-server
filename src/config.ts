import { existsSync, readFileSync } from 'fs';
import minimist from 'minimist';
import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createDirectory } from './utils/fs.js';


/**
 * Server configuration
 */
export interface ServerConfig {
  // Version info
  version: string;
  
  // Memory path
  memoryPath: string;
  
  // Request handling
  requestTimeout: number;  // in ms
  toolScanTimeout: number; // in ms
  
  // Auto shutdown
  autoShutdownMs: number;  // in ms
  
  // Debugging
  debug: boolean;
}

let config: ServerConfig;

function initializeConfig(): ServerConfig {
  // Parse command line arguments
  const argv = minimist(process.argv.slice(2));
  
  // Show version and exit if --version flag provided
  if (argv.version || argv.v) {
    // We just need the version here
    const version = getVersionFromPackage();
    console.error(`[INFO] [config] mcp-think-tank v${version}`);
    process.exit(0);
  }
  
  // Show memory path and exit if --show-memory-path flag provided
  if (argv['show-memory-path']) {
    const memoryPath = getMemoryPath(argv);
    console.error(`[INFO] [config] Memory path: ${memoryPath}`);
    process.exit(0);
  }
  
  // Get version from package.json
  const version = getVersionFromPackage();
  
  // Get memory path (from args or env or default)
  const memoryPath = getMemoryPath(argv);
  
  // Build configuration object
  return {
    // Version
    version,
    
    // Memory path
    memoryPath,
    
    // Request handling
    requestTimeout: argv['request-timeout'] ? 
                    parseInt(argv['request-timeout'] as string, 10) * 1000 : 
                    process.env.REQUEST_TIMEOUT ? 
                    parseInt(process.env.REQUEST_TIMEOUT, 10) * 1000 : 
                    300000, // 5 minutes
                    
    toolScanTimeout: argv['tool-scan-timeout'] ?
                    parseInt(argv['tool-scan-timeout'] as string, 10) : 
                    process.env.TOOL_SCAN_TIMEOUT ? 
                    parseInt(process.env.TOOL_SCAN_TIMEOUT, 10) : 
                    30000, // 30 seconds
    
    // Debug mode
    debug: !!argv.debug || process.env.MCP_DEBUG === 'true',
    
    // Auto-shutdown
    autoShutdownMs: argv['auto-shutdown-ms'] ? 
                    parseInt(argv['auto-shutdown-ms'] as string, 10) * 1000 :
                    process.env.AUTO_SHUTDOWN_MS ? 
                    parseInt(process.env.AUTO_SHUTDOWN_MS, 10) * 1000 : 
                    process.env.AUTO_SHUTDOWN === 'true' ? 30 * 60 * 1000 : 30 * 60 * 1000, // 30 minutes
  };
}

/**
 * Get version from package.json
 * @returns version string
 */
function getVersionFromPackage(): string {
  try {
    // Get directory path for the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // First try using the root package.json (for when we're installed as a node module)
    let packageJsonPath = resolve(process.cwd(), 'package.json');
    
    // If that doesn't exist, try the development location
    if (!existsSync(packageJsonPath)) {
      packageJsonPath = resolve(__dirname, '../../package.json');
    }
    
    // Read and parse package.json
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      if (packageJson.name === 'mcp-think-tank' && packageJson.version) {
        return packageJson.version;
      }
    }
    
    // Try one more location for npx installs
    const npxPath = resolve(process.env.npm_config_local_prefix || '', 'package.json');
    if (existsSync(npxPath)) {
      const packageJson = JSON.parse(readFileSync(npxPath, 'utf8'));
      if (packageJson.name === 'mcp-think-tank' && packageJson.version) {
        return packageJson.version;
      }
    }
    
    // If we couldn't determine the version from package.json, use a fixed version
    return '2.1.1';
  } catch (error) {
    console.error(`[WARN] [config] Could not read version from package.json: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return '2.1.1';
}

/**
 * Get memory path from args or env or default
 * @param argv Command line arguments
 * @returns Memory path
 */
function getMemoryPath(argv: minimist.ParsedArgs): string {
  // Priority: command line args > env var > default location
  
  // From command line args
  if (argv['memory-path']) {
    return argv['memory-path'] as string;
  }
  
  // From environment variable
  if (process.env.MEMORY_PATH) {
    return process.env.MEMORY_PATH;
  }
  
  // Default location in user's home directory
  const defaultPath = join(homedir(), '.mcp-think-tank/memory.jsonl');
  
  // Ensure directory exists
  createDirectory(dirname(defaultPath));
  
  return defaultPath;
}

// Initialize config on first import
config = initializeConfig();

// Export config object
export { config };