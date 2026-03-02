// Test script untuk AI Agent
import { createSupabaseServiceClient } from "./src/lib/supabase/server.js";
import { processMessage } from "./src/lib/agent/agent-service-new.js";

async function testAIAgent() {
  console.log("Testing AI Agent...\n");
  
  try {
    // Test 1: Get tickets for Bu Yani
    console.log("Test 1: Apa tiketnya Bu Yani?");
    const result1 = await processMessage({
      message: "Apa tiketnya Bu Yani?",
      sessionId: "test_session_001",
      userId: "a3d2d358-6d1e-4b72-b639-6e3f00f3b01f", // ID dari profiles
      orgId: "f741c3d7-2a10-4c0a-9b2b-f5030273df07",
    });
    
    console.log("\n=== Result 1 ===");
    console.log("Reply:", result1.reply);
    console.log("Tool Results:", JSON.stringify(result1.toolResults, null, 2));
    
    // Test 2: Get ticket detail if we have a ticket ID
    if (result1.toolResults && result1.toolResults.length > 0) {
      const ticketData = result1.toolResults[0]?.data;
      if (ticketData?.tickets?.length > 0) {
        const ticketId = ticketData.tickets[0].id;
        console.log(`\n\nTest 2: Detail tiket ${ticketId}`);
        
        const result2 = await processMessage({
          message: `Lihat detail tiket ${ticketId}`,
          sessionId: "test_session_001",
          userId: "a3d2d358-6d1e-4b72-b639-6e3f00f3b01f",
          orgId: "f741c3d7-2a10-4c0a-9b2b-f5030273df07",
          conversationHistory: [
            { role: "user", content: "Apa tiketnya Bu Yani?" },
            { role: "assistant", content: result1.reply }
          ]
        });
        
        console.log("\n=== Result 2 ===");
        console.log("Reply:", result2.reply);
        console.log("Tool Results:", JSON.stringify(result2.toolResults, null, 2));
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testAIAgent();
