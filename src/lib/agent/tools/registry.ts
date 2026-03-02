import { Tool, ToolDefinition, ToolContext, ToolResult, ToolCall, errorResult } from "./types";

// Tool Registry - Manages all available tools
export class ToolRegistry {
  private tools = new Map<string, Tool>();

  // Register a new tool
  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Tool "${tool.name}" already registered, overwriting`);
    }
    this.tools.set(tool.name, tool);
    console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
  }

  // Get a tool by name
  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  // Check if tool exists
  has(name: string): boolean {
    return this.tools.has(name);
  }

  // Get all tool definitions for LLM
  getDefinitions(): ToolDefinition[] {
    const definitions: ToolDefinition[] = [];
    
    // Sort by name for deterministic order (important for KV cache stability)
    const sortedTools = Array.from(this.tools.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    for (const tool of sortedTools) {
      try {
        // Convert Zod schema to JSON schema
        const jsonSchema = zodToJsonSchema(tool.parameters);
        
        definitions.push({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: jsonSchema,
          },
        });
      } catch (error) {
        console.error(`[ToolRegistry] Failed to convert schema for ${tool.name}:`, error);
      }
    }
    
    return definitions;
  }

  // Execute a tool call
  async execute(toolCall: ToolCall, context: ToolContext): Promise<ToolResult> {
    const toolName = toolCall.function.name;
    const tool = this.get(toolName);
    
    if (!tool) {
      console.error(`[ToolRegistry] Tool not found: ${toolName}`);
      return errorResult(`Tool "${toolName}" tidak ditemukan`);
    }
    
    try {
      // Parse arguments
      let args: any;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error(`[ToolRegistry] Failed to parse arguments for ${toolName}:`, parseError);
        return errorResult("Format argumen tidak valid");
      }
      
      // Validate arguments
      const validation = tool.parameters.safeParse(args);
      if (!validation.success) {
        console.error(`[ToolRegistry] Validation failed for ${toolName}:`, validation.error);
        return errorResult(`Argumen tidak valid: ${validation.error.message}`);
      }
      
      // Execute with timing
      console.log(`[ToolRegistry] Executing tool: ${toolName}`);
      const startTime = Date.now();
      const result = await tool.execute(validation.data, context);
      const duration = Date.now() - startTime;
      
      console.log(`[ToolRegistry] Tool ${toolName} executed in ${duration}ms`);
      return result;
      
    } catch (error: any) {
      console.error(`[ToolRegistry] Error executing ${toolName}:`, error);
      return errorResult(error.message || "Terjadi kesalahan saat mengeksekusi tool");
    }
  }

  // Execute with timeout
  async executeWithTimeout(
    toolCall: ToolCall, 
    context: ToolContext, 
    timeoutMs: number = 10000
  ): Promise<ToolResult> {
    return Promise.race([
      this.execute(toolCall, context),
      new Promise<ToolResult>((_, reject) => 
        setTimeout(() => reject(new Error(`Tool execution timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  // Get list of registered tool names
  getToolNames(): string[] {
    return Array.from(this.tools.keys()).sort();
  }
}

// Helper: Convert Zod schema to JSON schema
function zodToJsonSchema(schema: any): any {
  // This is a simplified conversion
  // In production, use zod-to-json-schema library
  
  // Handle ZodObject
  if (schema._def?.typeName === "ZodObject") {
    const shape = schema._def.shape();
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodSchemaToProperty(value as any);
      // Check if field is required (not optional)
      if (!(value as any).isOptional?.()) {
        required.push(key);
      }
    }
    
    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }
  
  // Default fallback
  return {
    type: "object",
    properties: {},
  };
}

function zodSchemaToProperty(schema: any): any {
  const typeName = schema._def?.typeName;
  
  switch (typeName) {
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodEnum":
      return { 
        type: "string", 
        enum: schema._def.values 
      };
    case "ZodOptional":
      return zodSchemaToProperty(schema._def.innerType);
    case "ZodNullable":
      return zodSchemaToProperty(schema._def.innerType);
    case "ZodDefault":
      return zodSchemaToProperty(schema._def.innerType);
    default:
      return { type: "string" };
  }
}

// Singleton instance
let globalRegistry: ToolRegistry | null = null;

export function getToolRegistry(): ToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new ToolRegistry();
  }
  return globalRegistry;
}

// Reset registry (useful for testing)
export function resetToolRegistry(): void {
  globalRegistry = null;
}
