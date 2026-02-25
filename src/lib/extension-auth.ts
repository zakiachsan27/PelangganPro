import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

/**
 * Verify extension token using service role key
 * This is needed because extension sends Supabase JWT tokens
 */
export async function verifyExtensionToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    console.log("[Extension Auth] No bearer token");
    return { user: null, error: "Missing token" };
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("[Extension Auth] Token received, length:", token.length);

  try {
    // Use service role key to verify token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role, not anon!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log("[Extension Auth] Invalid token:", error?.message);
      return { user: null, error: "Invalid token" };
    }

    console.log("[Extension Auth] User verified:", user.id);
    return { user, error: null };
  } catch (err) {
    console.error("[Extension Auth] Verification error:", err);
    return { user: null, error: "Verification failed" };
  }
}

/**
 * Get org_id from user
 */
export async function getUserOrg(supabase: any, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile.org_id;
}
