import React from 'react';
import { fmt12, toMin, nowMin } from '../lib/time';

/** Today's vertical timeline of classes. */
export default function DayList({ classes, highlightNow = true }) {
  if (!classes?.length) return null;
  const now = nowMin();
  return (
    <div className="relative">
      {classes.map((c, i) => {
        const s = toMin(c.start), e = toMin(c.end);
        const isNow = highlightNow && now >= s && now < e;
        const done = now >= e;
        return (
          <div key={i} className="flex gap-3 mb-3 fade-in" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex flex-col items-center shrink-0 w-14">
              <span className={`neu-in-sm px-2 py-1.5 text-xs font-bold ${isNow ? 'text-accent' : ''}`}>
                {c.start}
              </span>
              {i < classes.length - 1 && <span className="w-px flex-1 bg-deep my-1" style={{ background: 'var(--bg-deep)' }} />}
            </div>
            <div className={`neu-sm flex-1 p-4 ${isNow ? 'glow-amber' : ''} ${done ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-[15px]">{c.subject}</p>
                {isNow && <span className="badge badge-amber shrink-0">Now</span>}
                {c.type === 'Lab' && !isNow && <span className="badge badge-accent shrink-0">Lab</span>}
              </div>
              <p className="text-soft text-xs mt-1 font-medium">
                {fmt12(c.start)} – {fmt12(c.end)} · {c.room}
                {c.teacher ? ` · ${c.teacher}` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
