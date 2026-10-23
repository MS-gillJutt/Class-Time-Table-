// Local class reminders — 100% free, works fully offline.
// Schedules a browser Notification X minutes before each of today's classes.
import { toMin, nowMin, todayKey, fmt12 } from './time';

let timers = [];

export function clearReminders() {
  timers.forEach(clearTimeout);
  timers = [];
}

export async function ensurePermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/** Schedule reminders for today's classes. Call on app start + when prefs/data change. */
export async function scheduleToday(classes, beforeMin = 15) {
  clearReminders();
  const ok = await ensurePermission();
  if (!ok || !classes?.length) return 0;
  const now = nowMin();
  let n = 0;
  for (const c of classes) {
    const at = toMin(c.start) - beforeMin;
    const ms = (at - now) * 60 * 1000;
    if (ms <= 0) continue;
    // cap: browsers throttle very long timers; fine for same-day use
    timers.push(setTimeout(() => {
      try {
        const reg = navigator.serviceWorker?.ready;
        const title = `Class in ${beforeMin} min — ${c.subject}`;
        const body = `${fmt12(c.start)} · ${c.room}${c.teacher ? ' · ' + c.teacher : ''}`;
        if (reg) reg.then((r) => r.showNotification(title, { body, icon: '/icon-192.png', tag: `class-${c.start}` }));
        else new Notification(title, { body });
      } catch {}
    }, Math.min(ms, 2_147_483_647)));
    n++;
  }
  return n;
}

/** One-shot "next class" check used by the AI assistant + home hero. */
export function describeNext(classes, date = new Date()) {
  const now = nowMin(date);
  const sorted = [...classes].sort((a, b) => toMin(a.start) - toMin(b.start));
  const next = sorted.find((c) => toMin(c.start) > now);
  if (!next) return null;
  const mins = toMin(next.start) - now;
  return { ...next, mins };
}

export { todayKey };
