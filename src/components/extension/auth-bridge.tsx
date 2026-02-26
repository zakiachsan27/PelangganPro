"use client";

import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Auth Bridge Component
 * Sends authentication data to Chrome Extension
 */
export function ExtensionAuthBridge() {
  const [mounted, setMounted] = useState(false);
  const hasSent = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sendAuthToExtension = async () => {
      try {
        console.log("[AuthBridge] Checking session...");
        const supabase = createSupabaseBrowserClient();
        
        // Get session with short timeout
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]) as any;
        
        const session = sessionResult?.data?.session;
        
        if (!session) {
          console.log("[AuthBridge] No session found");
          return;
        }

        console.log("[AuthBridge] Session found");
        
        // Don't block on profile query - use session data directly
        const authData = {
          type: "PELANGGANPRO_AUTH",
          token: session.access_token,
          refreshToken: session.refresh_token,
          orgId: session.user.user_metadata?.org_id || null,
          userId: session.user.id,
          expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000).getTime()
            : Date.now() + 3600 * 1000,
        };

        console.log("[AuthBridge] Sending auth to extension");

        // Send to extension
        window.postMessage(authData, window.location.origin);
        
        // Also try sending multiple times with delay (in case extension not ready)
        setTimeout(() => window.postMessage(authData, window.location.origin), 1000);
        setTimeout(() => window.postMessage(authData, window.location.origin), 3000);

        console.log("[AuthBridge] ✅ Auth sent to extension");
      } catch (error) {
        console.error("[AuthBridge] ❌ Failed to send auth:", error);
      }
    };

    // Only send once per mount
    if (!hasSent.current) {
      hasSent.current = true;
      sendAuthToExtension();
    }

    // Also send on message from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PELANGGANPRO_REFRESH_AUTH" || 
          event.data?.type === "PELANGGANPRO_REFRESH_AUTH_REQUEST") {
        console.log("[AuthBridge] Refresh requested by extension");
        hasSent.current = false; // Reset to allow resend
        sendAuthToExtension();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [mounted]);

  return null;
}
