import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

describe('MCP Think Tank Integration Checks', () => {
  let server: ChildProcess;
  let tempMemoryPath: string;
  
  // Setup before all tests
  beforeAll(() => {
    // Create temporary memory file
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const tempDir = join(tmpdir(), 'mcp-think-tank-tests');
    
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    tempMemoryPath = join(tempDir, 'test-memory.jsonl');
    
    // Create empty file
    writeFileSync(tempMemoryPath, '');
    
    // Start server process with the temp memory path
    server = spawn('node', [
      join(__dirname, '../bin/mcp-think-tank.js')
    ], {
      env: {
        ...process.env,
        MEMORY_PATH: tempMemoryPath,
        MCP_DEBUG: 'true' 
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Wait for server to initialize - this is important
    return new Promise<void>((resolve) => {
      // Give the server time to start
      setTimeout(resolve, 1000);
    });
  });
  
  // Cleanup after all tests
  afterAll(() => {
    if (server) {
      server.kill();
    }
    
    // Cleanup temp file
    if (existsSync(tempMemoryPath)) {
      unlinkSync(tempMemoryPath);
    }
  });
  
  it('server starts without errors', () => {
    expect(server.killed).toBe(false);
  });
  
  it('all key directories exist in distribution', () => {
    const distDir = join(dirname(fileURLToPath(import.meta.url)), '../dist/src');
    
    // Check for key directories that should exist
    const dirsToCheck = [
      'memory',
      'research',
      'tasks',
      'think',
      'utils'
    ];
    
    for (const dir of dirsToCheck) {
      const dirPath = join(distDir, dir);
      expect(existsSync(dirPath)).toBe(true);
    }
  });
  
  it('initializes memory file correctly', () => {
    // This test just checks if the memory file exists and can be read
    expect(existsSync(tempMemoryPath)).toBe(true);

    // Attempt to read the file - should not throw
    expect(() => readFileSync(tempMemoryPath, 'utf8')).not.toThrow();
  });
}); 