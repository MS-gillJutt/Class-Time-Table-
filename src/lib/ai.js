// ClassTime on-device "AI" assistant — 100% free, works offline, no API keys.
// Rule-based natural-language understanding over the student's own timetable.
import { DAYS } from './sampleData';
import { toMin, nowMin, todayKey, fmt12, dayLabel, DOW } from './time';

const DAY_WORDS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function allClasses(grid) {
  const out = [];
  for (const d of DAYS) for (const c of (grid[d] || [])) out.push({ ...c, day: d });
  return out;
}

function fmtClass(c) {
  return `${c.subject} — ${dayLabel(c.day || '')} ${fmt12(c.start)}–${fmt12(c.end)}, ${c.room}${c.teacher ? ' · ' + c.teacher : ''}`;
}

export function answer(question, grid, sectionName) {
  const q = question.toLowerCase().trim();
  const classes = allClasses(grid);
  if (!classes.length) return "I couldn't find any classes for your section yet.";

  const dayHit = Object.keys(DAY_WORDS).find((w) => q.includes(w));
  const wantsToday = q.includes('today') || (!dayHit && (q.includes('do i have') || q.includes('my classes') || q.includes('schedule')));
  const day = dayHit ? DAY_WORDS[dayHit] : (wantsToday ? todayKey() : null);

  // next class
  if (q.includes('next class') || q.includes('upcoming') || q.includes('what\'s next')) {
    const tk = todayKey();
    const now = nowMin();
    const todays = (grid[tk] || []).filter((c) => toMin(c.start) > now).sort((a, b) => toMin(a.start) - toMin(b.start));
    if (todays.length) {
      const c = todays[0];
      const mins = toMin(c.start) - now;
      return `Your next class is ${c.subject} at ${fmt12(c.start)} in ${c.room} — in about ${mins} min.`;
    }
    return 'No more classes today. Enjoy your free time! 🎉';
  }

  // free periods today
  if (q.includes('free') && (q.includes('period') || q.includes('time') || q.includes('gap') || q.includes('break'))) {
    const tk = day || todayKey();
    const list = [...(grid[tk] || [])].sort((a, b) => toMin(a.start) - toMin(b.start));
    if (list.length < 2) return `Not enough classes on ${dayLabel(tk)} to find a gap.`;
    const gaps = [];
    for (let i = 0; i < list.length - 1; i++) {
      const gap = toMin(list[i + 1].start) - toMin(list[i].end);
      if (gap >= 30) gaps.push(`${fmt12(list[i].end)}–${fmt12(list[i + 1].start)} (${gap} min)`);
    }
    return gaps.length ? `Free gaps on ${dayLabel(tk)}: ${gaps.join(', ')}.` : `No long gaps on ${dayLabel(tk)} — packed day!`;
  }

  // when is <subject>
  const subjHit = classes.find((c) => q.includes(c.subject.toLowerCase().split(' ')[0]) && c.subject.toLowerCase().split(' ')[0].length > 2);
  if (q.includes('when') && subjHit) {
    const matches = classes.filter((c) => c.subject === subjHit.subject);
    return `${subjHit.subject} is on: ` + matches.map((c) => `${dayLabel(c.day)} ${fmt12(c.start)} (${c.room})`).join(', ') + '.';
  }

  // teacher of <subject> / who teaches
  if ((q.includes('teacher') || q.includes('who teaches')) && subjHit) {
    const t = [...new Set(classes.filter((c) => c.subject === subjHit.subject).map((c) => c.teacher).filter(Boolean))];
    return t.length ? `${subjHit.subject} is taught by ${t.join(' and ')}.` : `No teacher listed for ${subjHit.subject}.`;
  }

  // day schedule
  if (day) {
    const list = [...(grid[day] || [])].sort((a, b) => toMin(a.start) - toMin(b.start));
    if (!list.length) return `${dayLabel(day)} is a holiday for ${sectionName || 'you'} — no classes! 🏖️`;
    return `${dayLabel(day)} — ${list.length} classes:\n` + list.map((c, i) => `${i + 1}. ${c.subject}, ${fmt12(c.start)}–${fmt12(c.end)}, ${c.room}`).join('\n');
  }

  // how many classes this week
  if (q.includes('how many') && q.includes('week')) {
    return `You have ${classes.length} classes this week across ${DAYS.filter((d) => (grid[d] || []).length).length} days.`;
  }

  // fallback: capabilities
  return `I can help with your timetable — try:\n• "When is my next class?"\n• "What do I have on Monday?"\n• "When is Data Structures?"\n• "Any free periods today?"\n• "Who teaches Physics?"`;
}

export const SUGGESTIONS = [
  'When is my next class?',
  "What's on Monday?",
  'Any free periods today?',
  'Who teaches Data Structures?',
];
