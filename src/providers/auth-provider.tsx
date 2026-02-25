"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Get initial session
    async function getSession() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setSupabaseUser(authUser);
        await fetchProfile(authUser.id);
      }
      setLoading(false);
    }

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, org_id, email, full_name, avatar_url, role")
      .eq("id", userId)
      .single();

    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        orgId: profile.org_id,
        role: profile.role,
        avatarUrl: profile.avatar_url,
      });
    } else {
      // Fallback: use auth user_metadata if profile query fails
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          fullName: authUser.user_metadata?.full_name || authUser.email || "",
          orgId: authUser.user_metadata?.org_id || null,
          role: authUser.user_metadata?.role || "agent",
          avatarUrl: null,
        });
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
