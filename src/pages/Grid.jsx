import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DAYS } from '../lib/sampleData';
import { todayKey, dayLabel } from '../lib/time';
import { SectionTitle, Empty } from '../components/ui';
import DeptPick from '../components/DeptPick';
import DayList from '../components/DayList';

export default function Grid() {
  const { prefs, gridFor, data } = useStore();
  const [day, setDay] = useState(todayKey());
  const grid = gridFor(prefs.sectionId);
  const sectionName = (data.sections || []).find((s) => s.id === prefs.sectionId)?.name;

  // collect all unique time slots for the mini week-overview
  const weekDays = DAYS.filter((d) => (grid[d] || []).length);

  return (
    <div className="page">
      <h1 className="text-2xl font-extrabold tracking-tight mb-1">Week Grid</h1>
      <p className="text-soft text-sm mb-4">{sectionName}</p>

      <DeptPick />

      {/* day pills */}
      <div className="flex gap-2 mt-5 mb-4 overflow-x-auto no-scrollbar pb-1">
        {DAYS.map((d) => {
          const active = day === d;
          const has = (grid[d] || []).length > 0;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`shrink-0 px-4 py-2.5 text-sm font-bold ${active ? 'neu-btn-active' : 'neu-btn text-soft'} ${!has ? 'opacity-40' : ''}`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <SectionTitle>{dayLabel(day)}</SectionTitle>
      {(grid[day] || []).length ? (
        <DayList classes={[...grid[day]].sort((a, b) => a.start.localeCompare(b.start))} />
      ) : (
        <Empty icon="🏖️" title={`No classes on ${dayLabel(day)}`} hint="Holiday — enjoy!" />
      )}

      <SectionTitle>Week overview</SectionTitle>
      <div className="neu p-4">
        {weekDays.length === 0 && <p className="text-soft text-sm">No classes this week.</p>}
        {weekDays.map((d) => (
          <button key={d} onClick={() => setDay(d)} className="w-full text-left py-2.5 border-b last:border-0 flex items-center justify-between" style={{ borderColor: 'var(--bg-deep)' }}>
            <span className={`text-sm font-bold w-12 ${d === todayKey() ? 'text-accent' : ''}`}>{d}</span>
            <span className="text-soft text-xs flex-1 truncate px-2">
              {(grid[d] || []).map((c) => c.subject).join(' · ')}
            </span>
            <span className="badge badge-accent">{(grid[d] || []).length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
