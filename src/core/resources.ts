import { FastMCP } from "fastmcp";

/**
 * Set up FastMCP resources and templates
 * 
 * @param server FastMCP server instance
 */
export function setupResources(server: FastMCP): void {
  try {
    // Add basic resources
    server.addResource({
      uri: 'status://health',
      name: "Health Check",
      mimeType: "text/plain",
      load: async () => ({ text: "ok" })
    });

    // Add resource templates - using 'any' to bypass type checking issues with FastMCP
    const template: any = {
      uriTemplate: 'task://{id}',
      name: "Task",
      mimeType: "application/json",
      load: async (args: any) => {
        return {
          json: {
            id: args.id,
            status: "example",
            description: "Example task resource"
          }
        };
      }
    };
    server.addResourceTemplate(template);

    console.error("[INFO] [resources] Resources and templates set up successfully");
  } catch (error) {
    console.error(`[ERROR] [resources] Error setting up resources: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}