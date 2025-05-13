# Changelog

## 2.1.4 (2025-05-13)

### Fixed
- Created robust CommonJS script (mcp-think-tank-cjs.cjs) for better compatibility across all Node.js versions
- Updated bin script to use cross-environment dynamic imports with proper error handling
- Fixed global installation issues with proper path resolution
- Improved resilience to module system differences between ESM and CommonJS
- Enhanced npx and global installation reliability

## 2.1.3 (2025-05-13)

### Fixed
- Fixed ESM/CommonJS compatibility issues with the CLI script
- Updated bin script to use dynamic imports to prevent 'require is not defined' errors
- Added notes about Node.js version compatibility
- Improved documentation for dependency warnings

## 2.1.2 (2025-05-13)

### Fixed
- Fixed bin script issues with global installation and npx
- Improved CommonJS compatibility for the CLI
- Enhanced task storage compatibility with test suite
- Fixed TypeScript errors in resource handlers

## 2.1.1 (2025-05-13)

### Fixed
- Ensured compatibility with Claude Desktop and Cursor
- Fixed test issues and added 'bin' directory to package files
- Improved package structure for better npx installation experience
- Fixed version synchronization between package.json and exported config
- Addressed resource URI string format in tests

## 2.1.0 (2025-05-13)

### Fixed
- Connection timeout issues when used with large language models like Claude
- Removed problematic connection check interval that was causing 60-second timeouts
- Simplified logging system to prevent errors
- Fixed FastMCP compatibility issues

## 2.0.5 (2025-04-15)

### Added
- New research tools for web search and information retrieval

### Fixed
- Improved error handling in knowledge graph operations
- Fixed issue with memory store not properly saving observations
- Fixed self-reflection implementation to handle large input strings
- Added proper reflectPrompt parameter handling with appropriate truncation
- Fixed multi-step orchestration tests to work with large content
- Improved string handling in critical sections to prevent RangeError crashes
- Added better documentation for self-reflection feature

## 2.0.4 (2024-07-28)

### Fixed
- Fixed issue with Think Tank server not properly shutting down after completion
- Fixed missing parameters in streaming parser for think tool
- Fixed issue with knowledge graph not retrieving entities with special characters
- Fixed issue in the plan_tasks tool that was causing "Created X" to appear in JSON output
- Updated task storage to use safe error logging

## 2.0.0 (2025-03-01)

### Added
- Complete rewrite using FastMCP for better performance and compatibility
- Added task management and scheduling capabilities
- Simplified API for easier integration
- Improved knowledge graph with better querying capabilities
- Added multi-agent interfaces and orchestration capabilities
- Enhanced think tool with step counter and plan fields

### Changed
- Switched to ESM modules
- Updated all dependencies to latest versions
- Improved documentation and examples

### Removed
- Legacy compatibility for older MCP versions

## 2.1.0 (2025-08-25)

### Improved
- Major code restructuring for better maintainability
- Implemented modular architecture with separation of concerns:
  - Created core module for server lifecycle and state management
  - Created transport module for handling different transport methods
  - Extracted connection management into dedicated module
  - Improved tool registration with centralized registration system
  - Separated resource setup from server implementation
- Reduced main server.ts file from 400+ lines to under 50 lines
- Added comprehensive documentation for all modules
- Improved error handling with better module boundaries
- Enhanced startup sequence with async/await pattern

### Added
- Implemented robust structured logging system
  - Created dedicated logger module with level-based filtering
  - Added context-aware logging for better debugging 
  - Improved error logging with stack trace support
  - Configurable log levels via environment variables
- Streamlined task management with Zod schema validation
  - Type-safe task validation with descriptive error messages
  - Better TypeScript integration with inferred types
  - Enhanced task creation and update workflows
- Improved configuration management with strong typing
  - Consolidated environment variable handling
  - Added type-safe configuration interfaces
  - Better support for command-line arguments
- Dedicated process management module
  - Centralized PID file handling
  - Better cleanup of orphaned processes
  - Improved shutdown handling

## 2.0.11 (2025-08-20)

### Fixed
- Fixed Smithery compatibility issues with tool scanning timeouts
- Implemented proper lazy loading for research tools 
- Added runtime configuration in smithery.yaml for better deployment compatibility
- Increased tool scan timeout in Docker environment
- Optimized memory usage and server response time during initialization
- Updated dockerfile to include smithery.yaml in deployment
- Added memory optimization settings for containerized environments

## 2.0.10 (2025-08-17)

### Fixed
- Fixed critical server timeout issue occurring after exactly 60 seconds
- Added proper HTTP connection tracking to accurately count active connections
- Implemented longer startup grace period (5 minutes) before enforcing connection checks
- Added detailed connection logging to aid in debugging
- Enhanced HTTP server configuration with proper event listeners for connections and requests
- Added compatibility with Node.js 18.x while maintaining FastMCP 1.27.6 support

## 2.0.9 (2025-08-15)

### Improved
- Enhanced streamable-HTTP transport configuration for better Smithery compatibility
- Updated server configuration to use proper host settings with FastMCP 1.27.6
- Added additional configuration options in smithery.yaml for transport flexibility
- Fixed type compatibility issues with latest FastMCP transport definitions

## 2.0.8 (2025-07-31)

### Improved
- Updated FastMCP dependency to version 1.27.6
- Enhanced server configuration with type compatibility for latest FastMCP
- Updated transport configuration to support latest FastMCP conventions

## 2.0.7 (2024-07-31)

### Added
- Updated default transport to "streamable-http" to align with MCP industry standards
- Improved host and port configuration for HTTP transport
- Enhanced error handling for the unsupported transport types

### Improved
- Better warning message for deprecated STDIO transport
- More detailed logging of server startup with transport information
- Improved fallback mechanism for transport configuration
- Enhanced server process management and cleanup

### Fixed
- Fixed transport connection issues with some MCP clients
- Corrected FastMCP type definitions for streamable-http configuration
- Ensured consistent host and port usage across all transport modes

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
- **Reason:** Critical logging bu$g fixed in 1.3.14. Older versions may generate excessive log files and should not be used.

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

