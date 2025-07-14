

# MCP Think Tank

<div align="center">
  
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_dark.png" width="320">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_light.png" width="320">
  <img alt="MCP Think Tank Logo" src="https://raw.githubusercontent.com/flight505/mcp-think-tank/main/assets/MCP_Think_Tank_light.png" width="320">
</picture>

[![npm version](https://img.shields.io/npm/v/mcp-think-tank.svg?style=flat-square)](https://www.npmjs.com/package/mcp-think-tank)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Cursor Compatible](https://img.shields.io/badge/Cursor-Compatible-4B8DF8?logo=cursor&logoColor=white&style=flat-square)](https://www.cursor.so/)
[![Claude Compatibility](https://img.shields.io/badge/Claude-Compatible-9370DB.svg)](https://www.anthropic.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Tank-orange.svg)](https://github.com/modelcontextprotocol)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![smithery badge](https://smithery.ai/badge/@flight505/mcp-think-tank)](https://smithery.ai/server/@flight505/mcp-think-tank)
<a href="https://mseep.ai/app/flight505-mcp-think-tank">
  <img src="https://mseep.net/pr/flight505-mcp-think-tank-badge.png" alt="MseeP.ai Security Assessment Badge" width="50">
</a>

</div>


## Overview

MCP Think Tank is a powerful Model Context Protocol (MCP) server designed to enhance the capabilities of AI assistants like **Cursor** and **Claude @Web**. It provides a structured environment for enhanced reasoning, persistent memory, and responsible tool usage.

Key capabilities include advanced **Sequential Thinking & Chained Reasoning**, a robust **Knowledge Graph Memory** system with versioning, and intelligent **Tool Orchestration with Call-Limit Safeguards**. This platform empowers AI to tackle complex problems through structured analysis, maintain knowledge across sessions, and utilize external resources like web search, all while adhering to configurable usage limits.

## 🎯 Philosophy

MCP Think Tank is built on three core principles:

1.  **Elegant Simplicity**: Minimal, well-designed tools that complement AI capabilities rather than trying to replicate them.
2.  **Enhanced Reflection**: Gentle guidance fosters better reasoning and self-reflection without rigid constraints.
3.  **Persistent Context**: A simple, yet effective knowledge graph provides memory across conversations.

## Key Features

*   💭 **Think Tool**: Dedicated space for structured reasoning and self-reflection.
*   🧩 **Knowledge Graph**: Simple and effective persistent memory system.
*   📝 **Task Management Tools**: Plan, track, and update tasks, integrated with the knowledge graph.
*   🌐 **Web Research Tools (Exa)**: Search the web and get sourced answers using the Exa API.
*   🔍 **Memory Tools**: Easy-to-use tools for storing and retrieving information from the knowledge graph.
*   🤝 **Client Support**: Seamless integration with Cursor, Claude @Web, and other MCP clients.
*   🛡️ **Tool Orchestration & Call Limits**: Built-in safeguards for efficient and responsible tool usage with configurable limits.
*   ⚡ **Content Caching**: Performance optimization for file and URL operations with automatic duplicate detection.
*   🔄 **Sequential Thinking**: Enables multi-step reasoning processes with progress tracking.
*   🔎 **Self-Reflection**: Automated reflection passes to improve reasoning quality.
*   📊 **Structured Outputs**: Automatic formatting of thought processes for better readability.
*   🔗 **Research Integration**: Seamless incorporation of web research findings into reasoning flows.

## Benefits of Structured Thinking

Leveraging the `think` tool provides a dedicated space for systematic reasoning, encouraging:

*   Clear problem definition
*   Relevant context gathering
*   Step-by-step analysis
*   Self-reflection on reasoning
*   Well-formed conclusions

Recent studies highlight significant improvements when using structured thinking:

*   **54% relative improvement** in complex decision-making tasks.
*   **Enhanced consistency** across multiple trials.
*   **Improved performance** on software engineering benchmarks.

## Detailed Features

Beyond the core list, MCP Think Tank offers sophisticated capabilities for advanced AI interaction.

### Structured Thinking (Think Tool)

The `think` tool is the core mechanism for enabling advanced AI reasoning. It provides a dedicated, structured environment where the AI can systematically break down problems, gather context, analyze options, and perform self-reflection. This promotes deeper analysis and higher-quality outputs compared to unstructured responses. It supports sequential steps and integrates seamlessly with research and memory tools.

#### Self-Reflection Feature

The think tool includes a powerful self-reflection capability that can be enabled with the `selfReflect: true` parameter:

```javascript
mcp_think-tool_think({
  structuredReasoning: "...",
  selfReflect: true,
  reflectPrompt: "Optional custom reflection prompt"
})
```

When self-reflection is enabled, the AI receives a prompt to reflect on its own reasoning. This follows the MCP design philosophy of enhancing rather than replacing AI capabilities.

The `reflectPrompt` parameter lets you customize the prompt used for reflection, tailoring it to specific reasoning tasks or domains. When not specified, a default prompt is used that asks for identification of inconsistencies, logical errors, and improvement suggestions.

### Knowledge Graph Memory

The knowledge graph provides persistent memory across different interactions and sessions. It allows the AI to build a growing understanding of the project, its components, and related concepts.

*   **Timestamped Observations**: All memory entries include metadata for tracking.
*   **Duplicate Prevention**: Intelligent entity matching avoids redundant entries.
*   **Automatic Linkage**: Heuristic-based relation creation connects related concepts (configurable).
*   **Advanced Querying**: Filter memory by time, tags, keywords, and more using the powerful `memory_query` tool for historical analysis and tracking concept evolution. Easily find recent entries from the last 48 hours or any specific time period.
*   **Memory Maintenance**: Tools for pruning and managing memory growth are included.
*   **Key Memory Tools**: Tools like `upsert_entities`, `add_observations`, `create_relations`, `search_nodes`, `memory_query`, and `open_nodes` are used to interact with the graph.

### Task Management Tools

A suite of tools allows the AI to manage project tasks directly within the conversation flow. This integrates planning and execution with the knowledge graph, enabling the AI to understand project status and priorities.

#### Key Task Tools

* `plan_tasks`: Create multiple tasks at once with priorities and dependencies
* `list_tasks`: Filter tasks by status and priority
* `next_task`: Get the highest priority task and mark it in-progress
* `complete_task`: Mark tasks as completed
* `update_tasks`: Update existing tasks with new information


### Web Research Tools (Exa)

Leveraging the Exa API, MCP Think Tank provides tools for fetching external information. This allows the AI to access up-to-date information from the web to inform its reasoning and provide sourced answers.

*   `exa_search`: Perform web searches based on a query.
*   `exa_answer`: Get a concise, sourced answer to a factual question.

**Note:** Using these tools requires configuring your Exa API key. See the [Configuration](#configuration) section.

### Tool Orchestration & Safeguards

MCP Think Tank includes comprehensive features to ensure tools are used responsibly and efficiently.

*   **Usage Limits**: A configurable maximum number of tool calls per user interaction (`TOOL_LIMIT`, default: 25). The limit only counts consecutive tool calls within a single user message and resets automatically when the user sends a new message.
*   **Automatic Tracking**: All tool calls are logged and monitored.
*   **Graceful Degradation**: When limits are reached, the system attempts to return partial results.
*   **Intelligent Caching**: Identical tool calls and repeated file/URL content fetches are automatically cached, reducing execution time and resource usage. Caching behavior and size are configurable (`CACHE_TOOL_CALLS`, `CONTENT_CACHE`).
*   **Configurable Access**: Tool whitelisting can restrict available tools in specific contexts.
*   **Error Handling**: Robust error handling provides clear feedback for issues like hitting limits or invalid tool calls.

## 📦 Installation

> ⚠️ **Important Note READ THIS:** 
> When updating to a new version of MCP Think Tank in Cursor or Claude you might create multiple instances of the MCP Think Tank server, causing additional Node.js instances to be created, dragging down your system performance - this is a known issue with MCP servers - kill all mcp-think-tank processes in your system and check you have only one node.js instance running.


> ⚠️  The tasks.jsonl is located in ~/.mcp-think-tank/. The file is separated from the kg file, as the think tank could get confused by previously created tasks in the kg file. Delete the content of the tasks.jsonl file if the file becomes too large, or if you want to start a new project and insure there are no tasks in the file. In a future version tasks might be merged with the kg file to insure compleated tasks and relations are stored in memory and there are no duplicate tasks.


### NPX (Recommended)

The easiest way to use MCP Think Tank is via NPX in Cursor using mcp.json file, which runs the latest version without global installation, 

```bash
npx mcp-think-tank@2.0.7
```

For the latest version (which may have compatibility issues):
```bash
npx mcp-think-tank@latest
```
> some users have issues with npx @latest in Cursor, if so try specifying the version mcp-think-tank@2.0.7 in the .json file, or install it globally:

### Global Installation

For a persistent command-line tool:

```bash
npm install -g mcp-think-tank
mcp-think-tank
```

## ⚙️ Configuration

MCP Think Tank is configured primarily through environment variables or via your MCP client's configuration (like Cursor's `.cursor/mcp.json`).

### Quick Start: Essential Setup

1.  **Install MCP Think Tank** (see Installation above).
2.  **Get your Exa API Key** (required for web search tools):
    *   Sign up at [exa.ai](https://exa.ai/) and copy your API key.
3.  **IMPORTANT STDIO SERVERS ARE DEPRECATED** - The MCP industry is moving toward HTTP-based transports, - FUTURE UPDATES WILL NOT SUPPORT STDIO SERVERS.
4.  **Configure your MCP server** (for Cursor, add to `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "think-tank": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank@2.0.7"],
      "type": "streamable-http",
      "env": {
        "MEMORY_PATH": "/absolute/path/to/your/project/memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here",
      }
    }
  }
}
```

### Essential Variables

*   `MEMORY_PATH`: **Required**. Absolute path to the memory storage file. **Important:** Always set a unique `MEMORY_PATH` for each project to avoid knowledge graph conflicts between projects. If omitted, defaults to `~/.mcp-think-tank/memory.jsonl`.
*   `EXA_API_KEY`: **Required for Exa web search tools**. Your API key from [exa.ai](https://exa.ai/).

### Advanced Configuration

*   `TOOL_LIMIT`: Maximum number of tool calls allowed per user interaction (default: `25`). The counter resets automatically with each new user message, ensuring you can make up to 25 consecutive tool calls within a single interaction.
*   `CACHE_TOOL_CALLS`: Enable/disable caching of identical tool calls (default: `true`).
*   `TOOL_CACHE_SIZE`: Maximum number of cached tool calls (default: `100`).
*   `CACHE_CONTENT`: Enable/disable content-based caching for file/URL operations (default: `true`).
*   `CONTENT_CACHE_SIZE`: Maximum number of items in content cache (default: `50`).
*   `CONTENT_CACHE_TTL`: Time-to-live for cached content in milliseconds (default: `300000` - 5 minutes).
*   `MCP_DEBUG`: Enable debug logging (default: `false`).
*   `MCP_LISTEN_PORT`: Set custom port for MCP server (default: `3399` for TCP servers, not relevant for `stdio`).
*   `LOG_LEVEL`: Set logging level (`debug`, `info`, `warn`, `error`) (default: `info`).
*   `AUTO_LINK`: Enable automatic entity linking in knowledge graph (default: `true`).

### Memory Maintenance

*   `MIN_SIMILARITY_SCORE`: Threshold for entity matching when preventing duplicates (default: `0.85`).
*   `MAX_OPERATION_TIME`: Maximum time for batch memory operations in milliseconds (default: `5000`).

Example configuration with advanced settings in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "think-tank": {
      "command": "npx",
      "args": ["-y", "mcp-think-tank@2.0.7"],
      "env": {
        "MEMORY_PATH": "./project-memory.jsonl",
        "EXA_API_KEY": "your-exa-api-key-here",
        "TOOL_LIMIT": "50",
        "CACHE_CONTENT": "true",
        "CONTENT_CACHE_SIZE": "100",
        "MCP_DEBUG": "false",
        "AUTO_LINK": "true"
      }
    }
  }
}
```

> 💡 **Performance tip:** For large projects, increasing `TOOL_LIMIT` and cache sizes can improve performance at the cost of higher memory usage. Monitor your usage patterns and adjust accordingly.
> But in Cursor, tool limit should be 25 to avoid hitting the limit and getting the resume from the last tool call - currently many cursor users are reporting issues with resuming in Version: 0.49.6. this is not related to MCP Think Tank.

> 💡 **Note:** If you are using Cursor in YOLO mode or Vibe coding I suggest context priming new chats and letting Cursor know that it should use the MCP Think Tank to create entities, observations and relations. This will help you get the best out of the MCP Think Tank.

An example of context priming, is keeping a `Prime.md` file in the `.cursor` folder of your project with the following content:
```markdown
# Context Prime
> Follow the instructions to understand the context of the project.

## Run the following command

eza . --tree --git-ignore

## Read the following files
> Read the files below to get the context of the project. 

> list of files:
README.md
...

## MCP Think Tank Tools
> Test the MCP tools, first use 'show_memory_path' to remind the user of the current memory path file used, then use the 'memory_query' tool to find and read recent entities and observations for the last 48 hours so you are up to date.

> Automatically utilize the MCP Think Tank to autonomously track project context, dynamically adding entities, observations, and relations to the knowledge graph while proactively querying for relevant information and historical insights. Use integrated planning and task management tools to enhance project efficiency. Keep track of the project and its context without the user having to ask for it.

> Dont do anything else.
```


For more details on MCP servers, see [Cursor MCP documentation](https://docs.cursor.com/context/model-context-protocol).


## Project Rule Setup (for Cursor/AI)

To ensure Cursor and other compatible agents effectively utilize MCP Think Tank's tools, you need to provide the AI with guidance. This is typically done via a project rule. Create a **single, Auto Attach project rule** as follows:

### 1. Add a New Rule in Cursor

1.  Open Cursor.
2.  Go to the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
3.  Select **"New Cursor Rule"**.
4.  Name the rule (e.g., `mcp-think-tank.mdc`).
5.  In the rule editor, set the metadata and paste the rule content from the example below.

### 2. Example Rule File (`.cursor/rules/mcp-think-tank.mdc`)

This Markdown file serves as context *for the AI*, guiding it on when and how to use the available tools.

```mdc
rule type: auto attach
use globs: **/*.js,**/*.ts,**/*.jsx,**/*.tsx,**/*.md, **/*.py, **/*.json
```
----- Start of Rule -----
~~~markdown
Regularly utilize MCP Think Tank tools to maintain an updated knowledge graph and maximize its potential. Simply call the tools in your prompt. 

## Quick Decision Tree

1. 🤔 **Complex problem to analyze?**
   → Use `think` to structure reasoning and reflect

2. 🔍 **Need past context or information?**
   → Use `memory_query` (time-based) or `search_nodes` (keyword-based)

3. 📊 **Planning implementation steps?**
   → Use `plan_tasks` to create and track work

4. 🌐 **Need current external information?**
   → Use `exa_search` (general search) or `exa_answer` (factual questions)

## Critical Memory Management (Automatic Use Required)

| When to automatically use memory | Tool to use |
|------------------|------------|
| At session start | `memory_query` with recent time filter (last 24h) |
| After completing significant analysis | `upsert_entities` to store conclusions |
| When context seems missing | `memory_query` with relevant keyword |
| Every ~30 minutes in long sessions | `upsert_entities` to create checkpoint |
| When switching between major topics | `think` + `upsert_entities` to summarize progress |
| Before session end | `upsert_entities` to store session summary |

## Core Workflows

### Workflow 1: Problem Analysis → Solution
1. `memory_query` → Check for relevant past work
2. `think` → Structure reasoning about the problem  
3. `plan_tasks` → Break down implementation steps
4. `upsert_entities` → Store conclusions in memory

### Workflow 2: Research → Knowledge Capture
1. `memory_query` → Check if already researched
2. `exa_search` → Find current information
3. `think` → Analyze findings
4. `upsert_entities` → Document key concepts

### Workflow 3: Context Recovery (Session Resume)
1. `memory_query` → Retrieve recent work (past 24-48h)
2. `open_nodes` → Get details on relevant entities
3. `think` → Synthesize context and plan next steps
4. Continue where left off

### Workflow 4: Task Management
1. `list_tasks` → Review current work status
2. `next_task` → Identify priority task
3. `complete_task` → Mark finished work
4. `upsert_entities` → Document completion

## Trigger Patterns (Automatic Tool Use)

| When user... | Automatically use... |
|--------------|----------------------|
| Asks complex question requiring analysis | `think` |
| Mentions "remember" or refers to past work | `memory_query` with time filter → `open_nodes` |
| Uses "research" or "find latest" | `memory_query` (check if already known) → `exa_search` |
| Asks factual questions needing citations | `exa_answer` |
| Mentions planning or implementation | `plan_tasks` |
| Refers to continuing previous work | `memory_query` → `list_tasks` → `next_task` |
| Seems to have lost context from earlier | `memory_query` with recent time filter |
| Makes significant conceptual progress | `upsert_entities` without being asked |
| Connects related concepts | `create_relations` |
| Completes major section of work | `think` + `upsert_entities` to summarize |

### When To Use Each Memory Tool

- `memory_query`: For time-based searches and recent context recovery
- `search_nodes`: For finding specific concepts by keyword
- `open_nodes`: For retrieving full details of known entities
- `upsert_entities`: For creating new knowledge or updating existing entities
- `add_observations`: For adding facts to existing entities
- `create_relations`: For connecting related concepts

## Other Tools Reference

### Thinking
- `think`: Structured reasoning with optional reflection

### Tasks
- `plan_tasks`: Create task list
- `list_tasks`: View current tasks
- `next_task`: Get priority task
- `complete_task`: Mark task done

### Research
- `exa_search`: Web search
- `exa_answer`: Get cited answers

## AI Behavior Requirements

1. ALWAYS check memory at session start with `memory_query`
2. AUTOMATICALLY store important conclusions with `upsert_entities`
3. CREATE periodic memory checkpoints during long sessions
4. PROACTIVELY check memory when context seems missing
5. CHAIN tools together following the workflows
6. PRIORITIZE memory tools before web research
7. SUMMARIZE progress before ending major work segments
~~~
----- End of Rule -----

## ⚡ Performance Optimization

MCP Think Tank incorporates built-in optimizations to ensure efficient operation:

### Content Caching

*   Automatic caching of file and URL content based on cryptographic hashing.
*   Prevents redundant file reads and network requests.
*   Significantly speeds up repeated operations on the same content.
*   Cache size and TTL are configurable via environment variables (`CONTENT_CACHE_SIZE`, `CONTENT_CACHE_TTL`).

### Tool Call Optimization

*   Identical tool calls within a session are automatically detected and served from a cache.
*   Prevents counting duplicate calls against the interaction limit.
*   Improves responsiveness for repetitive tool requests.
*   Cache size is configurable (`TOOL_CACHE_SIZE`).

## Best Practices

For optimal use of MCP Think Tank with Cursor/Claude on large projects:

*   Utilize the `think` tool for all non-trivial reasoning and decision-making processes.
*   Always persist important thoughts, conclusions, and architectural decisions to the knowledge graph using memory tools.
*   Integrate web research and task management into your workflow to keep the AI informed and focused.
*   Regularly review and update your project's knowledge graph to ensure its accuracy and relevance.
*   Reference existing knowledge and past decisions to maintain consistency in code and design.
*   Be aware of tool call limits, especially in complex automated workflows. Monitor usage if necessary.
*   Adjust configuration variables (`TOOL_LIMIT`, cache settings) based on your project's needs and complexity for better performance.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📚 Reference Links

*   [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
*   [MCP Model Context Protocol](https://docs.cursor.com/context/model-context-protocol)
*   [Exa API](https://exa.ai/)
*   [Anthropic's Research on Structured Thinking](https://www.anthropic.com/research)
*   [Model Context Protocol](https://github.com/modelcontextprotocol/typescript-sdk)
*   [FastMCP](https://github.com/jlowin/fastmcp)

---

<div align="center">
  <p>Developed by <a href="https://github.com/flight505">flight505</a></p>
  <p>Give a ⭐️ if this project helped you!</p>
</div>
