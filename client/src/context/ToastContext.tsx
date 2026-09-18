import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertNotification } from '../types/index.js';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContextType {
  alerts: AlertNotification[];
  showAlert: (alert: Omit<AlertNotification, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback(
    (alert: Omit<AlertNotification, 'id' | 'timestamp'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newAlert: AlertNotification = {
        ...alert,
        id,
        timestamp: Date.now(),
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 4)]); // max 5 alerts

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        dismissAlert(id);
      }, 5000);
    },
    [dismissAlert]
  );

  return (
    <ToastContext.Provider value={{ alerts, showAlert, dismissAlert }}>
      {children}

      {/* Floating Alert Chips Container */}
      <aside
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
      >
        {alerts.map((alert) => {
          const isSuccess = alert.type === 'success';
          const isError = alert.type === 'error';
          const isWarning = alert.type === 'warning';

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-loopr-500 shrink-0" />
          );

          const borderStyle = isSuccess
            ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950 dark:bg-emerald-950/80 dark:border-emerald-800'
            : isError
            ? 'border-rose-200 bg-rose-50/95 text-rose-950 dark:bg-rose-950/80 dark:border-rose-800'
            : isWarning
            ? 'border-amber-200 bg-amber-50/95 text-amber-950 dark:bg-amber-950/80 dark:border-amber-800'
            : 'border-loopr-200 bg-loopr-50/95 text-loopr-950 dark:bg-loopr-950/80 dark:border-loopr-800';

          return (
            <div
              key={alert.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-up ${borderStyle}`}
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{alert.title}</p>
                <p className="text-xs text-slateNavy-600 dark:text-slateNavy-300 mt-0.5 leading-normal">
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slateNavy-400 hover:text-slateNavy-700 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
