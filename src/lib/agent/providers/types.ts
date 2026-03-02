// LLM Provider Interface - Picoclaw-style architecture
// Abstraction layer over DeepSeek/OpenAI APIs

import { ToolDefinition } from "../tools/types";

// Message format (OpenAI/DeepSeek compatible)
export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

// Tool call from LLM
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

// LLM Response
export interface LLMResponse {
  content?: string;
  toolCalls?: ToolCall[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

// LLM Provider interface
export interface LLMProvider {
  name: string;
  
  chat(options: {
    messages: Message[];
    tools?: ToolDefinition[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<LLMResponse>;
}

// Provider configuration
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
  timeout?: number;
}
