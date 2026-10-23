import React from 'react';
import { fmt12, minsUntil } from '../lib/time';

/** Big "next / current class" hero card, neumorphic. */
export default function NextClass({ current, next, onNotify, notifyOn }) {
  const cls = current || next;
  if (!cls) {
    return (
      <div className="neu-lg glow-accent p-6 text-center fade-in">
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-extrabold text-lg">No more classes today</p>
        <p className="text-soft text-sm mt-1">Enjoy your free time!</p>
      </div>
    );
  }
  const isNow = !!current;
  const mins = minsUntil(cls.start);
  return (
    <div className={`neu-lg p-6 fade-in ${isNow ? 'glow-amber' : 'glow-accent'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest text-soft uppercase">
          {isNow ? '● Happening now' : 'Next class'}
        </span>
        <span className={`badge ${isNow ? 'badge-amber' : 'badge-accent'}`}>
          {isNow ? 'Now' : mins <= 0 ? 'Starting' : `in ${mins} min`}
        </span>
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight">{cls.subject}</h2>
      <div className="flex items-center gap-4 mt-3 text-sm text-soft font-medium">
        <span>🕘 {fmt12(cls.start)} – {fmt12(cls.end)}</span>
        <span>📍 {cls.room}</span>
      </div>
      {cls.teacher && <p className="text-sm mt-1 text-soft">👩‍🏫 {cls.teacher}</p>}
      {!isNow && (
        <button
          onClick={onNotify}
          className={`neu-btn mt-4 w-full py-3 text-sm font-bold ${notifyOn ? 'text-accent' : ''}`}
        >
          {notifyOn ? '🔔 Reminder on' : '🔕 Remind me before class'}
        </button>
      )}
    </div>
  );
}
