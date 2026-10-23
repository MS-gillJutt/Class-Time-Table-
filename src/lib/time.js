// Small time helpers for the timetable.
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function todayKey(date = new Date()) {
  return DOW[date.getDay()];
}

export function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function nowMin(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function fmt12(hhmm) {
  let [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Find current & next class for a day's sorted class list. */
export function currentAndNext(classes, date = new Date()) {
  const now = nowMin(date);
  const sorted = [...classes].sort((a, b) => toMin(a.start) - toMin(b.start));
  let current = null, next = null;
  for (const c of sorted) {
    const s = toMin(c.start), e = toMin(c.end);
    if (now >= s && now < e) current = c;
    else if (now < s && !next) next = c;
  }
  return { current, next, all: sorted };
}

export function minsUntil(hhmm, date = new Date()) {
  return toMin(hhmm) - nowMin(date);
}

export function isHoliday(data, date = new Date()) {
  const iso = date.toISOString().slice(0, 10);
  return (data.holidays || []).includes(iso);
}

export function dayLabel(key) {
  return { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[key] || key;
}
