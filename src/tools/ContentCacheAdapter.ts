/**
 * ContentCacheAdapter.ts
 * 
 * Adapter for file/URL operations that enables content-based caching
 * Part of Story 3-G: Execution cache for file/URL reads
 */
import fs from 'fs/promises';
import path from 'path';
import axios, { AxiosRequestConfig } from 'axios';
import { toolManager } from './ToolManager.js';

/**
 * Read a file with content-based caching
 * 
 * @param filePath Path to the file to read
 * @param options Options for fs.readFile
 * @returns The file contents
 */
export async function readFile(filePath: string, options?: any): Promise<string | Buffer> {
  return toolManager.readFileWithCache(filePath, options);
}

/**
 * Read a JSON file with content-based caching
 * 
 * @param filePath Path to the JSON file
 * @returns Parsed JSON object
 */
export async function readJsonFile(filePath: string): Promise<any> {
  const content = await toolManager.readFileWithCache(filePath, 'utf8');
  if (typeof content !== 'string') {
    throw new Error('Expected string content when reading JSON file');
  }
  return JSON.parse(content);
}

/**
 * Fetch content from a URL with content-based caching
 * 
 * @param url URL to fetch
 * @returns Response content as string
 */
export async function fetchUrl(url: string): Promise<string> {
  return toolManager.fetchUrlWithCache(url);
}

/**
 * Fetch JSON from a URL with content-based caching
 * 
 * @param url URL to fetch JSON from
 * @param config Optional axios config
 * @returns Parsed JSON object
 */
export async function fetchJson(url: string, config?: AxiosRequestConfig): Promise<any> {
  try {
    // For JSON APIs, we should use axios to properly handle headers and request config
    // We'll use a workaround to integrate with our caching system

    // First check if the URL is already cached
    const cachedContent = await toolManager.fetchUrlWithCache(url)
      .catch(() => null); // Ignore cache errors and proceed to fresh fetch
    
    if (cachedContent) {
      try {
        // Try to parse the cached content as JSON
        return JSON.parse(cachedContent);
      } catch (e) {
        // If parsing fails, proceed with fresh fetch
        console.log(`[ContentCacheAdapter] Cached content not valid JSON, fetching fresh`);
      }
    }
    
    // Perform a fresh fetch with axios
    const response = await axios.get(url, config);

    // Return the data directly; fetchUrlWithCache handles caching when this
    // function is called again
    return response.data;
  } catch (error) {
    console.error(`[ContentCacheAdapter] Error fetching JSON: ${error}`);
    throw error;
  }
}

/**
 * List files in a directory with caching based on directory stats
 * 
 * @param dirPath Directory path to list
 * @returns Array of file names
 */
export async function listDirectory(dirPath: string): Promise<string[]> {
  try {
    // Get directory stats to check for changes
    const stats = await fs.stat(dirPath);
    const dirKey = `dir:${dirPath}:${stats.mtime.getTime()}`;
    
    // Check cache first
    const cachedEntries = toolManager.getContentCacheItem(dirKey);
    if (cachedEntries) {
      console.log(`[ContentCacheAdapter] Cache hit for directory listing ${dirPath}`);
      return cachedEntries as string[];
    }
    
    // Read directory entries
    const entries = await fs.readdir(dirPath);
    
    // Cache the result
    toolManager.setContentCacheItem(dirKey, entries);
    
    return entries;
  } catch (error) {
    console.error(`[ContentCacheAdapter] Error listing directory: ${error}`);
    // Fall back to regular readdir
    return fs.readdir(dirPath);
  }
}

/**
 * Check if the content cache is accessible and working
 * 
 * @returns True if the content cache is available
 */
export function isContentCacheAvailable(): boolean {
  try {
    const stats = toolManager.getContentCacheStats();
    return stats.enabled;
  } catch (e: any) {
    return false;
  }
}

/**
 * Get stats about the content cache
 * 
 * @returns Object with cache stats
 */
export function getContentCacheStats(): any {
  try {
    return toolManager.getContentCacheStats();
  } catch (e: any) {
    return { available: false, error: e.message };
  }
} 