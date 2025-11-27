import React from 'react';
import { SunMoon } from 'lucide-react';

export default function Navbar({ dark, setDark, onContact }) {
  return (
    <header className="w-full max-w-3xl flex items-center justify-between mt-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93 4.93l2.83 2.83" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 16.24l2.83 2.83" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div className="text-sm text-slate-400">Pulse</div>
          <div className="font-semibold">Habit Flow</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg bg-[#0f1724] hover:bg-[#111827] border border-slate-700"
          aria-label="Toggle dark"
        >
          <SunMoon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
