import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash2, RotateCcw } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import Toasts from './components/Toasts.jsx';
import Celebration from './components/Celebration.jsx';

const API_URL = 'http://localhost:5000';

export default function App() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [toasts, setToasts] = useState([]);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('dark') === 'true';
    } catch { return true }
  });
  const toastId = React.useRef(0);
  const prevHabitsRef = React.useRef([]);
  const [celebration, setCelebration] = useState(null);

  const showToast = React.useCallback((message, type = 'info', ms = 4000) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ms);
  }, []);

  const fetchHabits = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/habits`);
      if (res.ok) {
        const data = await res.json();
        // detect newly completed habits (progress >= target)
        try {
          const prev = prevHabitsRef.current || [];
          data.forEach(h => {
            const p = prev.find(x => x.id === h.id);
            const wasIncomplete = !p || (p.progress < p.target);
            const nowComplete = h.progress >= h.target;
            if (nowComplete && wasIncomplete) {
              // trigger celebration for this habit
              setCelebration({ id: h.id, name: h.name });
              showToast(`🎉 ${h.name} complete!`, 'success', 5000);
              // clear celebration after a short moment
              setTimeout(() => setCelebration(null), 3800);
            }
          });
        } catch (e) { console.error(e) }
        setHabits(data);
        prevHabitsRef.current = data.map(d => ({ id: d.id, progress: d.progress, target: d.target }));
      }
    } catch (error) {
      console.error('fetchHabits failed', error);
    }
  }, [showToast]);

  useEffect(() => { (async () => { await fetchHabits(); })(); }, [fetchHabits]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('dark', dark); } catch (e) { console.error(e) }
  }, [dark]);


  

  const handleAdd = async () => {
    if (!name.trim()) { showToast('Please add a habit name', 'error'); return; }
    try {
      await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, target: target || null })
      });
      setName("");
      setTarget("");
      fetchHabits();
      showToast('Added habit', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to add habit (backend)', 'error');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'delete') {
        await fetch(`${API_URL}/habits/${id}`, { method: 'DELETE' });
        showToast('Deleted', 'info');
      } else {
        await fetch(`${API_URL}/habits/${id}/${action}`, { method: 'PUT' });
        showToast(action === 'check' ? 'Marked done' : 'Reset', 'success');
      }
      fetchHabits();
    } catch (err) {
      console.error(err);
      showToast('Action failed', 'error');
    }
  };

  // Circular Progress Component
  const CircularProgress = ({ percentage, color }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="24" cy="24" r={radius} stroke="#334155" strokeWidth="5" fill="transparent" />
          <circle 
            cx="24" cy="24" r={radius} 
            stroke={color} 
            strokeWidth="5" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pulse-900 text-white flex flex-col items-center justify-start p-4">
      <Navbar dark={dark} setDark={setDark} />

      <div className="w-full max-w-3xl bg-pulse-800 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden mt-6">
        {/* Background Glow */}
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-gradient-to-r from-blue-600 to-indigo-600/20 rounded-full blur-3xl pointer-events-none opacity-30"></div>

        {/* Header */}
        <div className="flex justify-between items-end mb-6 relative z-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 animate-text">
            Habit Flow
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Sort</span>
            <span className="bg-[#1e2742] text-white px-3 py-1 rounded-lg border border-slate-700">Progress</span>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-12 gap-3 mb-8 bg-[#161e32] p-2 rounded-2xl border border-slate-800 relative z-10">
          <div className="col-span-7">
            <input 
              className="w-full bg-transparent p-3 text-white placeholder-slate-500 focus:outline-none"
              placeholder="Habit Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-span-3 border-l border-slate-700">
             <input 
              className="w-full bg-transparent p-3 text-white placeholder-slate-500 focus:outline-none text-center"
              placeholder="Target (30)"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <button 
              onClick={handleAdd}
              className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4 relative z-10">
          {habits.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No habits yet. Add one above.
            </div>
          ) : (
            habits.map((habit, index) => {
              const color = index % 2 === 0 ? '#3b82f6' : '#8b5cf6'; 
              return (
                <div key={habit.id} className="bg-[#161e32] border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-4">
                    <CircularProgress percentage={habit.percentage} color={color} />
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">{habit.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">
                        <span style={{color: color}}>{habit.progress}</span> / {habit.target} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-bold text-slate-400 text-sm w-10 text-right">{habit.percentage}%</span>
                    <button 
                      onClick={() => handleAction(habit.id, 'check')}
                      disabled={habit.completed_today}
                      className={`p-2 rounded-full border transition-all ${
                        habit.completed_today 
                        ? 'border-transparent text-emerald-400 bg-emerald-500/10 cursor-not-allowed' 
                        : 'border-slate-600 text-slate-400 hover:border-white hover:text-white'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => handleAction(habit.id, 'reset')}
                      className="text-slate-500 hover:text-blue-400 transition-colors"
                      title="Reset Status"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    <button 
                      onClick={() => handleAction(habit.id, 'delete')}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {celebration && <Celebration />}

      <Toasts toasts={toasts} />
    </div>
  );
}