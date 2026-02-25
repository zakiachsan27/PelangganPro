"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Auth Bridge Component
 * Sends authentication data to Chrome Extension
 */
export function ExtensionAuthBridge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sendAuthToExtension = async () => {
      try {
        console.log("[AuthBridge] Checking session...");
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("[AuthBridge] No session found");
          return;
        }

        console.log("[AuthBridge] Session found, getting profile...");
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", session.user.id)
          .single();

        if (!profile) {
          console.log("[AuthBridge] No profile found");
          return;
        }

        const authData = {
          type: "PELANGGANPRO_AUTH",
          token: session.access_token,
          refreshToken: session.refresh_token,
          orgId: profile.org_id,
          userId: session.user.id,
          expiresAt: session.expires_at
            ? new Date(session.expires_at * 1000).getTime()
            : Date.now() + 3600 * 1000,
        };

        console.log("[AuthBridge] Sending auth to extension:", {
          hasToken: !!authData.token,
          orgId: authData.orgId,
          userId: authData.userId,
        });

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

    // Send immediately
    sendAuthToExtension();

    // Also send on message from extension
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "PELANGGANPRO_REFRESH_AUTH") {
        console.log("[AuthBridge] Refresh requested by extension");
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
