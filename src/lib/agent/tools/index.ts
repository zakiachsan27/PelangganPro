// Tool System - Main Export
export * from "./types";
export * from "./registry";
export * from "./crm-tools";
export * from "./query-tools";
export * from "./detail-tools";

import { getToolRegistry } from "./registry";
import { allTools } from "./crm-tools";
import { queryTools } from "./query-tools";
import { detailTools } from "./detail-tools";

// Initialize and register all tools
export function initializeTools(): void {
  const registry = getToolRegistry();
  
  // Register CRM tools
  for (const tool of allTools) {
    registry.register(tool);
  }
  
  // Register query tools
  for (const tool of queryTools) {
    registry.register(tool);
  }
  
  // Register detail tools
  for (const tool of detailTools) {
    registry.register(tool);
  }
  
  console.log(`[ToolSystem] Initialized with ${allTools.length + queryTools.length + detailTools.length} tools`);
}

// Auto-initialize on import
initializeTools();
