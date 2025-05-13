import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import { createDirectory } from "./fs.js";

/**
 * Information about the current process
 */
export interface ProcessInfo {
  pid: number;
  startTime: number;
  pidFilePath: string;
}

/**
 * Initialize process tracking
 * @returns Process information
 */
export function initializeProcess(): ProcessInfo {
  const processInfo: ProcessInfo = {
    pid: process.pid,
    startTime: Date.now(),
    pidFilePath: getProcessFilePath()
  };
  
  // Write PID file
  try {
    const dir = path.dirname(processInfo.pidFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(processInfo.pidFilePath, process.pid.toString(), "utf8");
    console.error(`[INFO] [process] Server process started with PID: ${processInfo.pid}`);
  } catch (error) {
    console.error(`[ERROR] [process] Failed to create PID file: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return processInfo;
}

/**
 * Clean up process resources
 * @param processInfo Process information
 */
export function cleanupProcess(processInfo: ProcessInfo): void {
  try {
    // Clean up PID file
    if (fs.existsSync(processInfo.pidFilePath)) {
      fs.unlinkSync(processInfo.pidFilePath);
      console.error(`[DEBUG] [process] Removed PID file: ${processInfo.pidFilePath}`);
    }
  } catch (error) {
    console.error(`[ERROR] [process] Failed to remove PID file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the path for the PID file
 * @returns Path to the PID file
 */
function getProcessFilePath(): string {
  const dir = path.join(homedir(), ".mcp-think-tank");
  return path.join(dir, `${process.pid}.pid`);
}

/**
 * Create a cleanup script to kill orphaned processes
 */
export function createCleanupScript(): void {
  try {
    const dir = path.join(homedir(), ".mcp-think-tank");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const cleanupScriptPath = path.join(dir, "cleanup.sh");
    const script = `#!/bin/bash\n\nkill -9 ${process.pid} 2>/dev/null || true\nrm ${path.join(dir, `${process.pid}.pid`)} 2>/dev/null || true\n`;
    
    fs.writeFileSync(cleanupScriptPath, script, { mode: 0o755 });
    console.error(`[INFO] [process] Created cleanup script: ${cleanupScriptPath}`);
  } catch (error) {
    console.error(`[ERROR] [process] Failed to create cleanup script: ${error instanceof Error ? error.message : String(error)}`);
  }
}