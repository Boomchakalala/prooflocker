"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getCurrentUser, onAuthStateChange } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Failsafe: force loading to false after 3 seconds max
    const failsafeTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("[AuthContext] Auth initialization timed out, continuing without auth");
        setLoading(false);
      }
    }, 3000);

    // Get initial user
    getCurrentUser().then((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    }).catch((error) => {
      console.error("[AuthContext] Error getting user:", error);
      if (mounted) {
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    });

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(failsafeTimeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
