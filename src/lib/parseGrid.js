// Multi-page PDF timetable importer — tuned for aSc-style grid timetables
// (like CS_FA26: section header + 12 time-slot columns + Mo–Fr rows,
// each cell = Subject / Teacher (bold) / Room stacked vertically).
// Falls back to a generic heuristic parser for other layouts.
// All processing happens on-device (free, private).


const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_MAP = { Mo: 'Mon', Tu: 'Tue', We: 'Wed', Th: 'Thu', Fr: 'Fri', Sa: 'Sat', Su: 'Sun' };
const SEC_RE = /^([A-Z]{2,3})-BS\.([A-Z]{2,3})\s+(\d+)\s+([A-Z]+)(?:\s+([A-Z]+))?$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;
const SLOT_RE = /^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/;
const ROOM_RE = /(^\d+\.\w+[\.\w\-]*(\s*\([^)]*\))?(\s+[A-Z])?$|^seminar hall \d+$)/i;
const DEPT_NAMES = { CS: 'Computer Science', EE: 'Electrical Engineering', BBA: 'Business Administration' };

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'x';
}

function to24(h, m) {
  h = Number(h); m = Number(m);
  if (h >= 8 && h <= 12) return { h, m };       // morning 8–12
  if (h < 8) return { h: h + 12, m };           // 1–7 → 13–19 (afternoon)
  return { h, m };
}
function fmt(h, m) { return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }


/** Group items into lines (same baseline). Returns [{y, items:[...], text, font}] */
function toLines(items, yTol = 4) {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x); // top first (y up)
  const lines = [];
  for (const it of sorted) {
    const line = lines.find((l) => Math.abs(l.y - it.y) < yTol);
    if (line) line.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);
    l.text = l.items.map((i) => i.str).join(' ');
    // dominant font of the line
    const counts = {};
    for (const i of l.items) counts[i.font] = (counts[i.font] || 0) + 1;
    l.font = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  return lines;
}

/**
 * Auto-detect the "teacher" font: teachers sit in the vertical middle of cells.
 * Returns the fontName most associated with middle-positioned lines.
 */
function detectTeacherFont(cells) {
  const stats = {};
  for (const cell of cells) {
    if (cell.lines.length < 3) continue;
    const ys = cell.lines.map((l) => l.y);
    const top = Math.max(...ys), bot = Math.min(...ys);
    const span = (top - bot) || 1;
    for (const l of cell.lines) {
      const rel = (top - l.y) / span; // 0=top, 1=bottom
      const s = (stats[l.font] = stats[l.font] || { mid: 0, total: 0 });
      s.total++;
      if (rel > 0.28 && rel < 0.78) s.mid++;
    }
  }
  let best = null, bestScore = -1;
  for (const [f, s] of Object.entries(stats)) {
    if (s.total < 5) continue;
    const score = s.mid / s.total;
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return best;
}

function parseSectionHeader(text) {
  const m = text.match(SEC_RE);
  if (!m) return null;
  const [, deptCode, prog, sem, sec, extra] = m;
  const deptName = DEPT_NAMES[deptCode] || deptCode;
  const sectionName = `BS.${prog} ${sem} ${sec}${extra ? ' ' + extra : ''}`;
  return { deptCode, deptName, sectionName };
}

function parseGridPage(pg) {
  const lines = toLines(pg.items);
  // section header: big line near top matching SEC_RE
  let sec = null;
  for (const l of lines.slice(0, 6)) {
    const s = parseSectionHeader(l.text);
    if (s) { sec = s; break; }
  }
  if (!sec) return null;

  // time slots: items like "8:00 - 9:00" in the header row
  const slotItems = pg.items
    .filter((it) => SLOT_RE.test(it.str))
    .sort((a, b) => a.x - b.x);
  if (slotItems.length < 2) return null;

  const slots = slotItems.map((it) => {
    const m = it.str.match(SLOT_RE);
    let s = to24(m[1], m[2]), e = to24(m[3], m[4]);
    if (e.h * 60 + e.m <= s.h * 60 + s.m) e = { h: e.h + 12, m: e.m };
    return { start: fmt(s.h, s.m), end: fmt(e.h, e.m), x: it.x };
  });
  const headerY = slotItems[0].y;

  // day rows: Mo/Tu/We/Th/Fr labels at left
  const dayLabels = [];
  for (const l of lines) {
    const t = l.text.trim();
    if (DAY_MAP[t] && l.items[0].x < 90 && l.y < headerY - 20) {
      dayLabels.push({ day: DAY_MAP[t], y: l.y });
    }
  }
  dayLabels.sort((a, b) => b.y - a.y); // top first
  if (!dayLabels.length) return null;

  // Row boundaries: the grid is regular. Day labels sit mid-row; cell content
  // is centered ~10px above the label. Boundaries = midpoints between
  // consecutive (label.y + 10). Fixed per page — more robust than per-column clustering.
  const rowCenters = dayLabels.map((d) => d.y + 10);
  const bounds = []; // bounds[i] = {top, bot} for dayLabels[i]
  for (let i = 0; i < dayLabels.length; i++) {
    const top = i === 0 ? headerY - 8 : (rowCenters[i - 1] + rowCenters[i]) / 2;
    const bot = i + 1 < dayLabels.length ? (rowCenters[i] + rowCenters[i + 1]) / 2 : 28;
    bounds.push({ top, bot });
  }

  const rawCells = [];
  for (let si = 0; si < slots.length; si++) {
    const s = slots[si];
    const xL = s.x - 40;
    const xR = si + 1 < slots.length ? slots[si + 1].x - 40 : 1e9;
    const colItems = pg.items.filter(
      (it) =>
        it.x >= xL && it.x < xR &&
        it.y < headerY - 8 && it.y > 28 && // skip footer zone
        !/timetable generated|asc timetables/i.test(it.str)
    );
    if (!colItems.length) continue;
    const colLines = toLines(colItems);
    const byDay = dayLabels.map(() => []);
    for (const l of colLines) {
      for (let i = 0; i < bounds.length; i++) {
        if (l.y < bounds[i].top && l.y >= bounds[i].bot) { byDay[i].push(l); break; }
      }
    }
    byDay.forEach((dl, di) => {
      if (!dl.length) return;
      dl.sort((a, b) => b.y - a.y);
      rawCells.push({ day: dayLabels[di].day, slot: si, lines: dl, slots });
    });
  }

  const teacherFont = detectTeacherFont(rawCells);

  // final parse per cell
  const grid = {};
  for (const cell of rawCells) {
    const teacherLines = [], regularLines = [];
    for (const l of cell.lines) {
      if (teacherFont && l.font === teacherFont) teacherLines.push(l.text);
      else regularLines.push(l.text);
    }
    let room = '';
    // room = last regular line if room-like
    if (regularLines.length && ROOM_RE.test(regularLines[regularLines.length - 1])) {
      room = regularLines.pop();
    }
    const subject = regularLines.join(' ').replace(/\s+/g, ' ').trim();
    const teacher = teacherLines.join(' ').replace(/\s+/g, ' ').trim();
    if (!subject && !teacher) continue;
    const sl = cell.slots[cell.slot];
    (grid[cell.day] = grid[cell.day] || []).push({
      subject: subject || teacher, // fallback
      teacher: subject ? teacher : '',
      room,
      start: sl.start, end: sl.end,
      type: /lab/i.test(subject + ' ' + room) ? 'Lab' : 'Lecture',
    });
  }
  for (const d of Object.keys(grid)) grid[d].sort((a, b) => a.start.localeCompare(b.start));
  return { sec, grid };
}

export function parseTimetable(pages) {
  const departments = [];
  const sections = [];
  const grid = {};
  const warnings = [];

  const ensureDept = (name) => {
    let d = departments.find((x) => x.name === name);
    if (!d) { d = { id: slug(name), name }; departments.push(d); }
    return d;
  };

  let gridPages = 0;
  for (const pg of pages) {
    const r = parseGridPage(pg);
    if (!r) continue;
    gridPages++;
    const dept = ensureDept(r.sec.deptName);
    const sid = slug(r.sec.deptCode + '-' + r.sec.sectionName);
    if (!sections.find((s) => s.id === sid)) {
      sections.push({ id: sid, deptId: dept.id, name: r.sec.sectionName });
    }
    grid[sid] = r.grid;
  }

  if (!gridPages) {
    warnings.push('Grid layout not detected — try the manual review to fix parsing.');
  }
  const totalClasses = Object.values(grid).reduce((n, g) => n + Object.values(g).reduce((m, l) => m + l.length, 0), 0);
  if (!totalClasses) warnings.push('Could not detect any classes — is this a text-based (not scanned) PDF?');

  return { departments, sections, grid, holidays: [], warnings, pages: pages.length };
}

/** Flatten parsed data into editable rows for the admin review table. */
export function toRows(parsed) {
  const rows = [];
  for (const s of parsed.sections) {
    const g = parsed.grid[s.id] || {};
    for (const day of Object.keys(g))
      for (const c of g[day])
        rows.push({ sectionId: s.id, section: s.name, day, ...c });
  }
  return rows;
}

export function fromRows(rows, departments, sections) {
  const grid = {};
  for (const r of rows) {
    (grid[r.sectionId] = grid[r.sectionId] || {});
    (grid[r.sectionId][r.day] = grid[r.sectionId][r.day] || []).push({
      subject: r.subject, teacher: r.teacher, room: r.room,
      start: r.start, end: r.end, type: r.type,
    });
  }
  for (const sid of Object.keys(grid))
    for (const d of Object.keys(grid[sid]))
      grid[sid][d].sort((a, b) => a.start.localeCompare(b.start));
  return { departments, sections, grid, holidays: [] };
}
