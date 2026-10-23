import React, { useEffect, useMemo } from 'react';
import { useStore } from '../lib/store';
import { todayKey, currentAndNext, isHoliday, dayLabel, greeting } from '../lib/time';
import { ensurePermission, scheduleToday } from '../lib/notify';
import { Greeting, SectionTitle, Empty } from '../components/ui';
import NextClass from '../components/NextClass';
import DeptPick from '../components/DeptPick';
import DayList from '../components/DayList';

export default function Home({ go }) {
  const { data, prefs, setPref, gridFor, syncing } = useStore();
  const tk = todayKey();
  const grid = gridFor(prefs.sectionId);
  const classes = useMemo(() => (grid[tk] || []).slice().sort((a, b) => a.start.localeCompare(b.start)), [grid, tk]);
  const { current, next } = currentAndNext(classes);
  const holiday = isHoliday(data);

  useEffect(() => {
    if (prefs.notify) scheduleToday(classes, prefs.notifyBefore);
  }, [prefs.notify, prefs.notifyBefore, classes]);

  const toggleNotify = async () => {
    if (!prefs.notify) {
      const ok = await ensurePermission();
      if (!ok) { alert('Please allow notifications in your browser to get class reminders.'); return; }
      setPref('notify', true);
      scheduleToday(classes, prefs.notifyBefore);
    } else setPref('notify', false);
  };

  const sectionName = (data.sections || []).find((s) => s.id === prefs.sectionId)?.name;

  return (
    <div className="page">
      <div className="flex items-start justify-between mb-5">
        <Greeting />
        <div className="flex items-center gap-2">
          {syncing && <span className="text-soft text-xs">syncing…</span>}
          <button
            onClick={() => setPref('theme', prefs.theme === 'dark' ? 'light' : 'dark')}
            className="neu-circle w-11 h-11 flex items-center justify-center text-lg"
            aria-label="Toggle theme"
          >
            {prefs.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {holiday ? (
        <div className="neu-lg glow-accent p-6 text-center fade-in">
          <div className="text-4xl mb-2">🏖️</div>
          <p className="font-extrabold text-lg">Holiday today!</p>
          <p className="text-soft text-sm mt-1">No classes scheduled. Relax. 😌</p>
        </div>
      ) : (
        <NextClass current={current} next={next} onNotify={toggleNotify} notifyOn={prefs.notify} />
      )}

      <div className="mt-5"><DeptPick /></div>

      <SectionTitle right={<span className="text-soft text-xs font-semibold">{sectionName}</span>}>
        {dayLabel(tk)}'s Classes
      </SectionTitle>
      {classes.length
        ? <DayList classes={classes} />
        : <Empty icon="🛋️" title="No classes today" hint="Pick another day in the Grid tab to see the full week." />}

      <button onClick={() => go('grid')} className="neu-btn w-full py-3.5 mt-2 text-sm font-bold text-accent">
        📊 View full week grid
      </button>
    </div>
  );
}
