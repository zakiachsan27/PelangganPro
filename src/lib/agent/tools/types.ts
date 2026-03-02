// Tool System - Base Types and Interfaces
// Picoclaw-style architecture for PelangganPro AI Agent

import { z } from "zod";

// Context passed to tools during execution
export interface ToolContext {
  orgId: string;
  userId: string;
  sessionId: string;
}

// Result returned by tool execution
export interface ToolResult {
  // Content for LLM context (what the AI sees)
  forLLM: string;
  
  // Optional content for user (immediate feedback)
  forUser?: string;
  
  // Whether this is an error result
  isError: boolean;
  
  // Optional structured data
  data?: any;
}

// Tool definition for LLM (OpenAI/DeepSeek format)
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

// Tool call from LLM
export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

// Base tool interface
export interface Tool {
  // Tool name (must be unique)
  name: string;
  
  // Description for LLM
  description: string;
  
  // Zod schema for parameter validation
  parameters: z.ZodSchema<any>;
  
  // Execute the tool
  execute: (args: any, context: ToolContext) => Promise<ToolResult>;
}

// Helper functions to create tool results
export function successResult(forLLM: string, forUser?: string, data?: any): ToolResult {
  return {
    forLLM,
    forUser,
    isError: false,
    data,
  };
}

export function errorResult(message: string): ToolResult {
  return {
    forLLM: `Error: ${message}`,
    forUser: `Maaf, terjadi kesalahan: ${message}`,
    isError: true,
  };
}

export function progressResult(message: string): ToolResult {
  return {
    forLLM: message,
    forUser: message,
    isError: false,
  };
}
