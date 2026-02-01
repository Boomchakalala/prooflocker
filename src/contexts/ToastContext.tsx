"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer, ToastMessage } from "@/components/Toast";

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  showScoreToast: (points: number, message: string, breakdown?: string[]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showScoreToast = useCallback(
    (points: number, message: string, breakdown?: string[]) => {
      showToast({
        message,
        points,
        breakdown,
        type: points > 0 ? "success" : points < 0 ? "warning" : "info",
        duration: breakdown && breakdown.length > 0 ? 7000 : 5000,
      });
    },
    [showToast]
  );

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showScoreToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
