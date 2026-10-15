import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => showToast(title, message, "success"), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast(title, message, "error"), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast(title, message, "warning"), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast(title, message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-glass border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-navy-900/90 border-emerald-500/40 text-emerald-300"
                : toast.type === "error"
                ? "bg-navy-900/90 border-rose-500/40 text-rose-300"
                : toast.type === "warning"
                ? "bg-navy-900/90 border-amber-500/40 text-amber-300"
                : "bg-navy-900/90 border-electric-500/40 text-electric-300"
            }`}
          >
            <div className="mr-3 mt-0.5">
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-electric-400" />}
            </div>
            <div className="flex-1 text-sm">
              <h4 className="font-semibold">{toast.title}</h4>
              {toast.message && <p className="text-slate-300 text-xs mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
