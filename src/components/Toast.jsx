import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const icons = {
    warning: <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-error flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-primary flex-shrink-0" />
  };

  const borderColors = {
    warning: 'border-warning/30 bg-white/95 shadow-warning/10',
    error: 'border-error/30 bg-white/95 shadow-error/10',
    success: 'border-success/30 bg-white/95 shadow-success/10',
    info: 'border-primary/30 bg-white/95 shadow-primary/10'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-slide-up ${borderColors[toast.type] || borderColors.info}`}
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 text-xs">
            <h5 className="font-bold text-textPrimary text-sm mb-0.5">{toast.title}</h5>
            <p className="text-textSecondary leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-textSecondary hover:text-textPrimary p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
