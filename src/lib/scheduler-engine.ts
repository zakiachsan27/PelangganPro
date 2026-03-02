// Scheduler Engine - Background message sender
// This runs periodically to process pending scheduler messages

import { createClient } from "@supabase/supabase-js";
import { sendWahaMessage } from "./waha";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get random interval between min and max (in seconds)
function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Process a single pending message
async function processPendingMessage(logId: string, phone: string, message: string, wahaSession: string) {
  try {
    // Update status to sending
    await supabase
      .from("message_scheduler_logs")
      .update({ status: 'retrying' })
      .eq("id", logId);

    // Send message via WAHA
    const result = await sendWahaMessage(wahaSession, phone, message);

    if (result.success) {
      // Update log as sent
      await supabase
        .from("message_scheduler_logs")
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          waha_response: result.data,
        })
        .eq("id", logId);

      return { success: true };
    } else {
      throw new Error(result.error || "Failed to send message");
    }
  } catch (error: any) {
    // Update log as failed
    await supabase
      .from("message_scheduler_logs")
      .update({
        status: 'failed',
        error_message: error.message,
        retry_count: supabase.rpc('increment_retry_count'),
      })
      .eq("id", logId);

    return { success: false, error: error.message };
  }
}

// Update scheduler progress
async function updateSchedulerProgress(schedulerId: string) {
  const { data: stats } = await supabase
    .from("message_scheduler_logs")
    .select('status')
    .eq("scheduler_id", schedulerId);

  const sentCount = stats?.filter((l: any) => l.status === 'sent').length || 0;
  const failedCount = stats?.filter((l: any) => l.status === 'failed').length || 0;
  const pendingCount = stats?.filter((l: any) => l.status === 'pending').length || 0;

  // Check if all messages are processed
  if (pendingCount === 0) {
    await supabase
      .from("message_schedulers")
      .update({
        status: failedCount > 0 ? 'completed' : 'completed',
        sent_count: sentCount,
        failed_count: failedCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", schedulerId);
  } else {
    await supabase
      .from("message_schedulers")
      .update({
        sent_count: sentCount,
        failed_count: failedCount,
      })
      .eq("id", schedulerId);
  }
}

// Main scheduler engine function
export async function runSchedulerEngine() {
  console.log("[SchedulerEngine] Starting scheduler check...");

  try {
    // Get all active schedulers (status = 'sending')
    const { data: schedulers, error } = await supabase
      .from("message_schedulers")
      .select("*")
      .eq("status", 'sending');

    if (error) {
      console.error("[SchedulerEngine] Error fetching schedulers:", error);
      return;
    }

    if (!schedulers || schedulers.length === 0) {
      console.log("[SchedulerEngine] No active schedulers found");
      return;
    }

    console.log(`[SchedulerEngine] Found ${schedulers.length} active scheduler(s)`);

    for (const scheduler of schedulers) {
      // Get pending logs for this scheduler
      const { data: pendingLogs, error: logsError } = await supabase
        .from("message_scheduler_logs")
        .select("*")
        .eq("scheduler_id", scheduler.id)
        .eq("status", 'pending')
        .order("created_at", { ascending: true })
        .limit(1);

      if (logsError) {
        console.error(`[SchedulerEngine] Error fetching logs for scheduler ${scheduler.id}:`, logsError);
        continue;
      }

      if (!pendingLogs || pendingLogs.length === 0) {
        console.log(`[SchedulerEngine] No pending messages for scheduler ${scheduler.id}`);
        await updateSchedulerProgress(scheduler.id);
        continue;
      }

      // Process the first pending message
      const log = pendingLogs[0];
      console.log(`[SchedulerEngine] Processing message ${log.id} for scheduler ${scheduler.id}`);

      const result = await processPendingMessage(
        log.id,
        log.phone,
        log.message,
        scheduler.waha_session
      );

      console.log(`[SchedulerEngine] Message ${log.id} result:`, result.success ? "sent" : "failed");

      // Update scheduler progress
      await updateSchedulerProgress(scheduler.id);

      // Wait random interval before next message
      const minInterval = scheduler.min_interval || Math.floor(scheduler.interval_seconds * 0.75);
      const maxInterval = scheduler.max_interval || scheduler.interval_seconds;
      const waitSeconds = getRandomInterval(minInterval, maxInterval);

      console.log(`[SchedulerEngine] Waiting ${waitSeconds}s before next message...`);

      // Only wait if there are more pending messages
      const { count: remainingCount } = await supabase
        .from("message_scheduler_logs")
        .select("*", { count: "exact", head: true })
        .eq("scheduler_id", scheduler.id)
        .eq("status", 'pending');

      if (remainingCount && remainingCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
      }
    }

    console.log("[SchedulerEngine] Scheduler check completed");
  } catch (error) {
    console.error("[SchedulerEngine] Unexpected error:", error);
  }
}

// Start the scheduler engine (call this from a cron job or background task)
export function startSchedulerEngine(intervalMs: number = 5000) {
  console.log(`[SchedulerEngine] Starting engine with ${intervalMs}ms interval`);

  // Run immediately
  runSchedulerEngine();

  // Then run periodically
  setInterval(runSchedulerEngine, intervalMs);
}
