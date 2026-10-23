import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DAYS } from '../lib/sampleData';
import { Field, SectionTitle, Empty, Spinner } from '../components/ui';
import { cloudEnabled } from '../lib/firebase';

// pdf.js is heavy (~1.3MB) — loaded only when admin opens the importer.
const loadParser = () => import('../lib/pdfParse');

const TYPES = ['Lecture', 'Lab', 'Tutorial'];

export default function Admin({ go }) {
  const { data, publish, prefs, setPref, syncing } = useStore();
  const [step, setStep] = useState('dash'); // dash | uploading | review
  const [progress, setProgress] = useState(0);
  const [parsed, setParsed] = useState(null);
  const [rows, setRows] = useState([]);
  const [newPin, setNewPin] = useState('');
  const [msg, setMsg] = useState('');

  const stats = {
    depts: data.departments?.length || 0,
    sections: data.sections?.length || 0,
    classes: Object.values(data.grid || {}).reduce((n, g) => n + Object.values(g).reduce((m, l) => m + l.length, 0), 0),
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStep('uploading'); setProgress(0); setMsg('');
    try {
      const { extractPages, parseTimetable, toRows } = await loadParser();
      const pages = await extractPages(file, setProgress);
      const p = parseTimetable(pages);
      setParsed(p);
      setRows(toRows(p));
      setStep('review');
    } catch (err) {
      console.error(err);
      setMsg('Could not read this PDF. Make sure it is a text-based PDF (not scanned images).');
      setStep('dash');
    }
  };

  const editRow = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const delRow = (i) => setRows((r) => r.filter((_, j) => j !== i));
  const addRow = () => {
    const s = parsed.sections[0];
    setRows((r) => [...r, { sectionId: s.id, section: s.name, day: 'Mon', start: '09:00', end: '10:00', subject: 'New Subject', teacher: '', room: '', type: 'Lecture' }]);
  };

  const doPublish = async () => {
    if (!rows.length) { setMsg('Nothing to publish — the table is empty.'); return; }
    const { fromRows } = await loadParser();
    const built = fromRows(rows, parsed.departments, parsed.sections);
    await publish(built);
    setMsg(`✅ Published! ${rows.length} classes live for ${parsed.sections.length} sections.` + (cloudEnabled ? ' All students will sync automatically.' : ' (Demo mode — connect Firebase to sync to students.)'));
    setStep('dash');
  };

  const changePin = () => {
    if (newPin.length < 4) { setMsg('PIN must be at least 4 digits.'); return; }
    setPref('adminPin', newPin); setNewPin('');
    setMsg('✅ Admin PIN updated.');
  };

  if (step === 'uploading') {
    return (
      <div className="page">
        <h1 className="text-2xl font-extrabold mb-4">Reading PDF…</h1>
        <div className="neu p-6 text-center">
          <div className="neu-in-sm h-4 overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(progress * 100)}%`, background: 'var(--accent)' }} />
          </div>
          <p className="text-sm font-bold">{Math.round(progress * 100)}%</p>
          <p className="text-soft text-xs mt-1">Extracting text from all pages…</p>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="page" style={{ maxWidth: '44rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold">Review & Fix</h1>
          <button onClick={() => setStep('dash')} className="neu-btn px-4 py-2 text-sm font-bold text-soft">✕ Cancel</button>
        </div>
        {parsed.warnings.map((w, i) => (
          <div key={i} className="neu-in-sm p-3 mb-2 text-xs font-medium" style={{ color: 'var(--amber)' }}>⚠️ {w}</div>
        ))}
        <p className="text-soft text-xs mb-3">
          Found {parsed.pages} pages → {parsed.sections.length} sections, {rows.length} classes.
          Tap any cell to correct it, then <b>Publish</b>.
        </p>
        <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
          <table className="w-full text-xs" style={{ minWidth: '640px' }}>
            <thead>
              <tr className="text-soft text-left">
                {['Section', 'Day', 'Start', 'End', 'Subject', 'Teacher', 'Room', 'Type', ''].map((h) => (
                  <th key={h} className="pb-2 pr-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--bg-deep)' }}>
                  <td className="py-1.5 pr-2 font-semibold whitespace-nowrap">{r.section}</td>
                  <td className="pr-2">
                    <select value={r.day} onChange={(e) => editRow(i, 'day', e.target.value)} className="neu-input px-1 py-1 text-xs">
                      {DAYS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </td>
                  {['start', 'end'].map((k) => (
                    <td key={k} className="pr-2">
                      <input type="time" value={r[k]} onChange={(e) => editRow(i, k, e.target.value)} className="neu-input px-1 py-1 text-xs w-24" />
                    </td>
                  ))}
                  {['subject', 'teacher', 'room'].map((k) => (
                    <td key={k} className="pr-2">
                      <input value={r[k]} onChange={(e) => editRow(i, k, e.target.value)} className="neu-input px-2 py-1 text-xs w-28" />
                    </td>
                  ))}
                  <td className="pr-2">
                    <select value={r.type} onChange={(e) => editRow(i, 'type', e.target.value)} className="neu-input px-1 py-1 text-xs">
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td><button onClick={() => delRow(i)} className="text-lg" style={{ color: 'var(--red)' }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-5 sticky bottom-24">
          <button onClick={addRow} className="neu-btn flex-1 py-3.5 text-sm font-bold">+ Add row</button>
          <button onClick={doPublish} disabled={syncing} className="neu-btn flex-1 py-3.5 text-sm font-extrabold text-accent glow-accent">
            {syncing ? 'Publishing…' : `🚀 Publish ${rows.length} classes`}
          </button>
        </div>
        {msg && <p className="text-sm mt-3 font-semibold">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Admin Panel 🔐</h1>
        <button onClick={() => go('settings')} className="neu-btn px-4 py-2 text-sm font-bold text-soft">← Back</button>
      </div>

      {msg && <div className="neu-sm p-4 mb-4 text-sm font-semibold fade-in">{msg}</div>}

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[['Departments', stats.depts, '🏛️'], ['Sections', stats.sections, '👥'], ['Classes', stats.classes, '📚']].map(([l, v, ic]) => (
          <div key={l} className="neu-sm p-4 text-center">
            <div className="text-2xl">{ic}</div>
            <p className="text-xl font-extrabold mt-1">{v}</p>
            <p className="text-soft text-[11px] font-semibold">{l}</p>
          </div>
        ))}
      </div>

      <SectionTitle>Upload timetable PDF</SectionTitle>
      <label className="neu p-8 block text-center cursor-pointer fade-in">
        <div className="text-4xl mb-2">📄</div>
        <p className="font-bold">Tap to choose PDF</p>
        <p className="text-soft text-xs mt-1">20–25+ pages supported · processed on-device</p>
        <input type="file" accept="application/pdf" className="hidden" onChange={onFile} />
      </label>
      {!cloudEnabled && (
        <p className="text-xs mt-3 p-3 neu-in-sm" style={{ color: 'var(--amber)' }}>
          ⚠️ Demo mode: publishing saves locally on this device only. Connect Firebase (DEPLOY.md) so all students receive updates.
        </p>
      )}

      <SectionTitle>Security</SectionTitle>
      <div className="neu-sm p-4">
        <Field label="Change admin PIN">
          <div className="flex gap-2">
            <input type="password" inputMode="numeric" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="New PIN" className="neu-input px-4 py-3 text-sm" />
            <button onClick={changePin} className="neu-btn px-5 text-sm font-bold text-accent shrink-0">Save</button>
          </div>
        </Field>
      </div>

      <SectionTitle>How updates reach students</SectionTitle>
      <div className="neu-sm p-4 text-xs text-soft leading-relaxed">
        1. Upload PDF → review & fix → <b>Publish</b>.<br />
        2. With Firebase connected, every student's app syncs the new timetable automatically — online instantly, offline on next connection.<br />
        3. Without internet, students keep using the last downloaded timetable.
      </div>
    </div>
  );
}
