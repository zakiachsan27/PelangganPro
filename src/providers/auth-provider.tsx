"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  orgId: string | null;
  role: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// Helper to safely get user with timeout
async function getUserWithTimeout(supabase: any, timeoutMs = 3000): Promise<User | null> {
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
      )
    ]) as any;
    return result?.data?.user || null;
  } catch (err) {
    console.log("[Auth] getUser timeout or error:", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userCache = useRef<AuthUser | null>(null);
  
  const supabase = createSupabaseBrowserClient();

  const fetchProfile = useCallback(async (userId: string, authUser: User) => {
    // Use cached user if available to avoid repeated timeouts
    if (userCache.current && userCache.current.id === userId) {
      console.log("[Auth] Using cached profile:", userCache.current.fullName);
      setUser(userCache.current);
      return;
    }

    try {
      // Try to get profile with short timeout
      const { data: profile, error } = await Promise.race([
        supabase
          .from("profiles")
          .select("id, org_id, email, full_name, avatar_url, role")
          .eq("id", userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 3000)
        )
      ]) as any;

      if (profile && !error) {
        console.log("[Auth] Profile loaded:", profile.full_name);
        const userData = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || "User",
          orgId: profile.org_id,
          role: profile.role,
          avatarUrl: profile.avatar_url,
        };
        userCache.current = userData;
        setUser(userData);
        return;
      }
    } catch (err) {
      console.log("[Auth] Profile fetch failed, using metadata fallback");
    }
    
    // Fallback: use auth user_metadata
    const fullName = authUser.user_metadata?.full_name || 
                    authUser.email?.split('@')[0] || 
                    "User";
    const userData = {
      id: authUser.id,
      email: authUser.email || "",
      fullName: fullName,
      orgId: authUser.user_metadata?.org_id || null,
      role: authUser.user_metadata?.role || "agent",
      avatarUrl: null,
    };
    userCache.current = userData;
    setUser(userData);
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const authUser = await getUserWithTimeout(supabase);
    if (authUser) {
      setSupabaseUser(authUser);
      await fetchProfile(authUser.id, authUser);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const authUser = await getUserWithTimeout(supabase);
      
      if (!mounted) return;

      if (authUser) {
        setSupabaseUser(authUser);
        await fetchProfile(authUser.id, authUser);
      }
      
      if (mounted) {
        setLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] State change:", event);
        if (session?.user) {
          setSupabaseUser(session.user);
          // Don't await here to avoid blocking
          fetchProfile(session.user.id, session.user);
        } else {
          setUser(null);
          setSupabaseUser(null);
          userCache.current = null;
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  async function signOut() {
    try {
      // Clear local state immediately
      setUser(null);
      setSupabaseUser(null);
      userCache.current = null;
      
      // Try to sign out from Supabase (with timeout)
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('signout timeout')), 3000)
        )
      ]);
    } catch (err) {
      console.log("[Auth] Sign out error (ignored):", err);
    } finally {
      // Always redirect to login
      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
