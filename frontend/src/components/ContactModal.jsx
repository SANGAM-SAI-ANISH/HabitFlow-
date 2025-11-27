import React, { useState } from 'react';

export default function ContactModal({ open, onClose, apiUrl = '', onToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!name.trim() || !email.includes('@') || !message.trim()) {
      onToast?.('Please fill name, valid email, and message', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (res.ok) {
        onToast?.('Message sent — thanks!', 'success');
        setName(''); setEmail(''); setMessage('');
        onClose?.();
      } else {
        onToast?.('Failed to send — backend error', 'error');
      }
    } catch (err) {
      console.error(err);
      onToast?.('Failed to send — network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#0f152a] rounded-2xl w-full max-w-lg p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contact</h3>
          <button onClick={onClose} className="text-slate-400">Close</button>
        </div>

        <div className="space-y-3">
          <input className="w-full p-3 bg-transparent border border-slate-700 rounded" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full p-3 bg-transparent border border-slate-700 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <textarea className="w-full p-3 bg-transparent border border-slate-700 rounded" placeholder="Message" rows={4} value={message} onChange={e => setMessage(e.target.value)} />
          <div className="flex justify-end">
            <button onClick={submit} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
