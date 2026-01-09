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
    let completed = false;

    // Failsafe: force loading to false after 500ms max
    const failsafeTimeout = setTimeout(() => {
      if (mounted && !completed) {
        console.warn("[AuthContext] Auth initialization timed out, continuing without auth");
        setLoading(false);
        completed = true;
      }
    }, 500);

    // Get initial user
    getCurrentUser().then((user) => {
      if (mounted && !completed) {
        setUser(user);
        setLoading(false);
        completed = true;
        clearTimeout(failsafeTimeout);
      }
    }).catch((error) => {
      console.error("[AuthContext] Error getting user:", error);
      if (mounted && !completed) {
        setLoading(false);
        completed = true;
        clearTimeout(failsafeTimeout);
      }
    });

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        if (!completed) {
          setLoading(false);
          completed = true;
        }
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
