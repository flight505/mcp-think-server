# Changelog

## 2.0.7 (2025-05-13)

### Fixed
- Fixed fs mocking in tests to support ESM imports properly
- Enhanced Smithery tool scanning compatibility with 2025 standards
- Implemented asynchronous scanning for better performance
- Added compatibility headers for improved Smithery interaction
- Increased tool scan timeout to 60 seconds for more reliable tool discovery
- Added retry mechanisms for tool scanning to improve reliability

## 2.0.6 (2024-07-30)

### Added
- Support for HTTP transport protocol alongside STDIO
- Added environment variables for HTTP transport configuration (MCP_TRANSPORT, MCP_HOST, MCP_PORT, MCP_PATH)
- Updated server to dynamically choose transport method based on configuration

### Improved
- Enhanced Smithery compatibility by supporting streamable-http transport
- Fixed tool visibility issues when published on Smithery
- Updated documentation with transport configuration examples and best practices
- Updated configuration to support phased migration from STDIO to HTTP transport

## 2.0.3 (2024-07-28)

### Improved
- Added better documentation for memory_query tool in README
- Enhanced tool description in rule files to highlight memory_query capabilities
- Added practical example showing how to query recent observations from the last 48 hours
- Fixed Dockerfile paths for better container compatibility
- Improved smithery.yaml for better display on deployment platforms

## 2.0.1 (2024-07-26)

### Fixed
- Fixed critical console logging issues that were causing JSON parsing errors
- Completely suppressed console.log output in production to prevent interference with JSON responses
- Implemented safer error logging directly to stderr
- Fixed issue in the plan_tasks tool that was causing "Created X" to appear in JSON output
- Updated task storage to use safe error logging

## 1.4.1 (2024-07-11)

### Fixed
- Fixed bug in the memory query tool that was causing incorrect results when filtering by time
- Fixed task completion tool to properly mark dependent tasks as completed
- Updated error messages to be more descriptive and helpful
- Improved type checking in memory store implementations

## 1.4.0 (2024-07-11)

### Added & Improved
- Major documentation update: clarified and expanded instructions for using MCP Think Tank in Cursor and Claude, with a new coherent section on tool groups (think, research, task manager, memory).
- Clearly documented the `storeInMemory` workflow: users/agents can simply say "Please save this reasoning in memory for future reference" and the tool will persist the thought in the knowledge graph.
- Improved Readme for large project development and agent/IDE integration.

### Fixed
- Ensured all documentation and workflow changes are reflected in the Readme and project rule setup.
- This version supersedes all previous deprecated versions and is ready for production use.

## 1.3.14 (2024-06-11)
- All versions of `mcp-think-tank` less than or equal to 1.3.14 have been deprecated on npm.
- **Reason:** Critical logging bug fixed in 1.3.14. Older versions may generate excessive log files and should not be used.

## 1.3.13 (2024-07-10)

### Added
- Made `context` a first-class feature in the think tool: when `storeInMemory` is true, the context is stored as an observation in the knowledge graph and optionally linked to an associated entity.
- Extended validation and entity schema to support context for future extensibility.

### Fixed
- Updated FastMCP tool context usage to resolve TypeScript errors and ensure compatibility with latest FastMCP versions.

## 1.3.12 (2024-07-10)

### Fixed
- Changed logger to opt-in model: file logging now requires explicit MCP_LOG_FILE=true
- Added automatic cleanup of old log files, keeping only the 5 most recent backups
- Reduced disk usage and system load from excessive logging
- Fixed performance issues caused by rapid log file growth

## 1.3.11 (2024-07-07)

### Fixed
- Critical fix: Console redirection now happens immediately at the top of files, before any imports
- Fixed path resolution in bin/mcp-think-tank.js to correctly point to dist/src/server.js
- Simplified version detection logic to be more robust across different environments
- Added --show-memory-path CLI flag for better diagnostics and testing
- Improved error handling in binary launcher and server startup
- Added smoke-test and verify-publish npm scripts to prevent releasing broken packages
- Restructured memory path handling for better error reporting
- Followed all checkpoint fixes from the fix.md document

## 1.3.10 (2024-07-07)

### Fixed
- Fixed CLI launcher to directly import server.js
- Updated package.json to correctly point to the compiled server.js file
- Added validation during build to ensure all artifacts are present
- Dynamically read version from package.json to ensure consistency
- Added error handling around server startup
- Improved robustness in FastMCP 1.2.4+ handshake protocol
- Removed dependency on bootstrap.mjs to simplify startup flow

## 1.3.9 (2024-07-07)

### Fixed
- Critical fix: Corrected import paths in bootstrap.mjs to properly resolve compiled files
- Ensured compatibility with FastMCP 1.2.4+ handshake requirements
- Fixed npm package structure to work correctly when installed via npx

## 1.3.8 (2024-07-07)

### Fixed
- Fixed compatibility with FastMCP 1.2.4+ by adding proper resource and resourceTemplate handshake support
- Fixed import paths in bootstrap.mjs to correctly locate compiled files in the dist directory
- Pinned FastMCP dependency to version 1.2.4 for stability
- Fixed console output redirection to prevent JSON message corruption
- Improved error handling for the Exa API integration

## 1.3.5 (2024-07-01)

### Fixed
- Fixed memory initialization: the memory.jsonl file is now properly created at startup if it doesn't exist
- Updated mcp.json to use the latest version of the package
- Fixed integration tests to handle protocol format updates correctly
- Fixed various minor bugs and improved error handling

## 1.3.1

- Published to NPM as mcp-think-tank@1.3.1
- Logging system simplified and dependencies removed
- Fully committed to JSONL for knowledge graph and tasks
- Lint and test suite cleaned up
- Version fields updated for consistency

## 1.3.0 (2024-06-13)

### Added
- Exa API Integration for web research
  - Added `exa_search` tool for searching the web
  - Added `exa_answer` tool for getting sourced answers
  - Prepared optional streaming answer implementation (commented out by default)
- Added unit tests for Exa API tools
- Added environment variable checks and improved error handling

### Improved
- Enhanced integration between tools for cross-communication
- Added debounced saving for better performance on batch operations
- Improved error handling and logging for task operations

## 1.2.0 (2024-04-16)

### Added
- Task Management System with Knowledge Graph integration
  - Added `plan_tasks` tool for creating multiple tasks at once
  - Added `list_tasks` tool for filtering tasks by status and priority
  - Added `next_task` tool to get the highest priority task and mark it in-progress
  - Added `complete_task` tool to mark tasks as done
  - Added `update_tasks` tool for batch updates
- Implemented persistent task storage with append-only JSONL format
- Added `show_memory_path` utility tool to help locate knowledge graph file
- Added comprehensive test suite with Vitest

## 1.1.1 (2024-04-14)

### Fixed
- Fixed JSON parsing errors caused by console.log interference with FastMCP stdio
- Implemented proper logging system using stderr and file output
- Added MCP_DEBUG environment variable for controlling debug output
- Improved error handling with better stack traces
- Updated all logging calls to use the new logger utility

## 1.1.0 (2024-04-10)

### Improved
- Updated documentation to recommend npx installation method for Cursor
- Enhanced installation instructions for better clarity
- Added more detailed configuration examples

## 1.0.4 (2024-04-10)

### Fixed
- Improved warning message handling for "FastMCP could not infer client capabilities"
- Added detailed instructions for Cursor integration
- Updated server version to match package version
- Added more troubleshooting steps for Cursor integration

## 1.0.3 (2024-04-10)

### Fixed
- Fixed global installation issues by removing problematic postinstall script
- Enhanced bin script to handle missing compiled files, with fallbacks to compile on demand
- Added better error handling and fallback to ts-node when TypeScript compilation fails

## 1.0.2 (Previous release)

### Features
- Initial public release
- Added support for the "think" tool
- Added compatibility with Cursor and Claude Desktop 

