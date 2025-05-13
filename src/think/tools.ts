import { FastMCP } from "fastmcp";
import { ExtendedThinkSchema } from "../agents/BasicAgent.js";

/**
 * Register thinking tools with the server
 * 
 * @param server FastMCP server instance
 */
export function registerThinkTools(server: FastMCP): void {
  server.addTool({
    name: "think",
    description: "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed. Consider including: problem definition, relevant context, analysis steps, self-reflection on your reasoning, and conclusions. Adapt this structure as needed for your specific thought process.",
    parameters: ExtendedThinkSchema,
    execute: async (params: any) => {
      const { structuredReasoning, selfReflect = false } = params;
      
      // Step counter logic
      // Initialize or estimate plannedSteps if not provided
      if (!params.plannedSteps) {
        // Roughly estimate based on content length
        const contentLength = structuredReasoning.length;
        params.plannedSteps = Math.max(1, Math.min(5, Math.ceil(contentLength / 300)));
      }
      
      // Initialize currentStep if not provided
      if (!params.currentStep) {
        params.currentStep = 1;
      } else {
        // Increment the current step
        params.currentStep += 1;
      }
      
      // Ensure current step doesn't exceed planned steps
      params.currentStep = Math.min(params.currentStep, params.plannedSteps);
      
      // Format output with step counter
      return `# Structured Reasoning (Step ${params.currentStep} of ${params.plannedSteps})\n\n${structuredReasoning}\n\n(Step ${params.currentStep} of ${params.plannedSteps})`;
    }
  });
}