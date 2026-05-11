"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { X, ShoppingBag, Tag } from "lucide-react";

interface ToastPayment {
  id: string;
  customer_name: string;
  customer_email: string;
  grand_total: number;
  voucher_code: string | null;
  created_at: string;
}

interface Toast extends ToastPayment {
  toastId: string;
}

const formatIDR = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

/* Single toast card */
function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.toastId), 8000);
    return () => clearTimeout(t);
  }, [toast.toastId, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 120, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative w-80 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(96,165,250,0.3)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px -8px rgba(96,165,250,0.3), 0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Blue top accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #60a5fa, #3b82f6, #10b981)" }} />

      {/* Progress bar */}
      <motion.div
        className="absolute top-1 left-0 h-0.5"
        style={{ background: "rgba(96,165,250,0.4)" }}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 8, ease: "linear" }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}>
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-success uppercase tracking-widest">New Payment 🎉</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {toast.customer_name || "Anonymous"}
              </p>
              <p className="text-xs text-foreground/50 truncate max-w-[160px]">{toast.customer_email}</p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.toastId)}
            className="p-1 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-black/5 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-foreground">{formatIDR(toast.grand_total)}</span>
          {toast.voucher_code ? (
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
              style={{ background: "rgba(96,165,250,0.1)", color: "#2563eb", border: "1px solid rgba(96,165,250,0.25)" }}>
              <Tag className="w-3 h-3" /> {toast.voucher_code}
            </span>
          ) : (
            <span className="text-xs text-success font-medium px-2 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)" }}>
              Full price ✓
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* Main live notification component — mount once in layout */
export default function LiveNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.toastId !== id));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("live-payments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lynk_payments",
        },
        (payload) => {
          const row = payload.new as ToastPayment;
          const newToast: Toast = { ...row, toastId: `${row.id}-${Date.now()}` };
          setToasts(prev => [newToast, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3"
      style={{ pointerEvents: toasts.length ? "auto" : "none" }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastCard key={toast.toastId} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
