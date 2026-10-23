import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { answer, SUGGESTIONS } from '../lib/ai';

export default function Assistant() {
  const { prefs, gridFor, data } = useStore();
  const grid = gridFor(prefs.sectionId);
  const sectionName = (data.sections || []).find((s) => s.id === prefs.sectionId)?.name;
  const [msgs, setMsgs] = useState([
    { from: 'ai', text: `Hi! I'm your timetable assistant 🤖\nAsk me about your classes for ${sectionName || 'your section'} — no internet needed.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, typing]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = answer(q, grid, sectionName);
      setMsgs((m) => [...m, { from: 'ai', text: reply }]);
      setTyping(false);
    }, 450);
  };

  return (
    <div className="page flex flex-col" style={{ minHeight: '100dvh' }}>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Ask AI ✨</h1>
      <p className="text-soft text-sm mb-4">On-device · free forever · works offline</p>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-3">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-4 py-3 text-sm whitespace-pre-line fade-in ${m.from === 'me' ? 'neu-btn-active self-end rounded-2xl' : 'neu-sm self-start'}`}>
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="neu-sm self-start px-4 py-3 text-sm text-soft animate-pulse">typing…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="neu-btn shrink-0 px-3 py-2 text-xs font-semibold text-soft">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pb-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about your timetable…"
          className="neu-input px-4 py-3 text-sm"
        />
        <button onClick={() => send()} className="neu-btn px-5 text-accent font-bold shrink-0" aria-label="Send">
          ➤
        </button>
      </div>
    </div>
  );
}
