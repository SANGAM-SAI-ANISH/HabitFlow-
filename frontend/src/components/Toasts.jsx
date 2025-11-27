import React from 'react';

export default function Toasts({ toasts = [] }) {
  return (
    <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`max-w-xs w-full px-4 py-3 rounded-lg shadow-lg border ${t.type === 'error' ? 'bg-red-600/95 border-red-500' : t.type === 'success' ? 'bg-emerald-600/95 border-emerald-500' : 'bg-slate-800 border-slate-700'}`}>
          <div className="text-sm text-white">{t.message}</div>
        </div>
      ))}
    </div>
  );
}
