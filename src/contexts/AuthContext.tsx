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
  const [loading, setLoading] = useState(false); // Start as false - don't block page load

  useEffect(() => {
    let mounted = true;

    // Get initial user in background, don't block the UI
    getCurrentUser().then((user) => {
      if (mounted) {
        setUser(user);
      }
    }).catch((error) => {
      console.error("[AuthContext] Error getting user:", error);
    });

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
      }
    });

    return () => {
      mounted = false;
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
