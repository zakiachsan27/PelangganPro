// AI Agent Module - Picoclaw-style Architecture
// Exports for the new agent system

// Tool System (selective export to avoid conflicts)
export type {
  Tool,
  ToolContext,
  ToolDefinition,
  ToolResult,
} from "./tools/types";
export {
  getToolRegistry,
  ToolRegistry,
} from "./tools/registry";
export {
  successResult,
  errorResult,
  progressResult,
} from "./tools/types";
export {
  allTools,
} from "./tools/crm-tools";

// LLM Providers
export type { LLMProvider, LLMResponse, Message } from "./providers/types";
export type { ToolCall } from "./providers/types";
export { DeepSeekProvider } from "./providers/deepseek";

// Agent Loop (new architecture)
export * from "./agent-loop";

// New Agent Service
export * from "./agent-service-new";
