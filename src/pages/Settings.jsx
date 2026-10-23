import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Field, SectionTitle, Toggle } from '../components/ui';
import { ensurePermission } from '../lib/notify';
import { cloudEnabled } from '../lib/firebase';

export default function Settings({ go }) {
  const { prefs, setPref, data, cloud } = useStore();
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState('');

  const tryAdmin = () => {
    if (pin === prefs.adminPin) { setPinErr(''); go('admin'); }
    else setPinErr('Wrong PIN. Default is 1234 — change it after login.');
  };

  return (
    <div className="page">
      <h1 className="text-2xl font-extrabold tracking-tight mb-4">Settings</h1>

      <SectionTitle>Appearance</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {['light', 'dark'].map((t) => (
          <button
            key={t}
            onClick={() => setPref('theme', t)}
            className={`p-4 text-center ${prefs.theme === t ? 'neu-btn-active' : 'neu-btn'}`}
          >
            <div className="text-2xl mb-1">{t === 'light' ? '☀️' : '🌙'}</div>
            <p className="text-sm font-bold capitalize">{t}</p>
          </button>
        ))}
      </div>

      <SectionTitle>Notifications</SectionTitle>
      <Toggle
        label={`Class reminders ${prefs.notify ? 'on' : 'off'}`}
        on={prefs.notify}
        onChange={async (v) => {
          if (v) {
            const ok = await ensurePermission();
            if (!ok) { alert('Please allow notifications in your browser settings.'); return; }
          }
          setPref('notify', v);
        }}
      />
      <div className="mt-3">
        <Field label="Remind me before class">
          <select
            value={prefs.notifyBefore}
            onChange={(e) => setPref('notifyBefore', Number(e.target.value))}
            className="neu-input px-4 py-3 text-sm font-semibold"
          >
            {[5, 10, 15, 30, 60].map((m) => (
              <option key={m} value={m}>{m} minutes before</option>
            ))}
          </select>
        </Field>
      </div>

      <SectionTitle>Sync</SectionTitle>
      <div className="neu-sm p-4 text-sm">
        <p className="font-bold">{cloudEnabled ? (cloud ? '🟢 Cloud sync on' : '🟡 Cloud configured') : '⚪ Demo mode (no cloud)'}</p>
        <p className="text-soft text-xs mt-1">
          {cloudEnabled
            ? 'Timetables sync automatically. Works offline — changes apply when you reconnect.'
            : 'Add your free Firebase keys (see DEPLOY.md) to sync timetables across all students.'}
        </p>
        <p className="text-soft text-xs mt-2">Data version {data.version || 1} · updated {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : '—'}</p>
      </div>

      <SectionTitle>Admin</SectionTitle>
      <div className="neu-sm p-4">
        <p className="text-sm font-semibold mb-3">🔐 Admin panel — upload & publish timetables</p>
        <div className="flex gap-2">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryAdmin()}
            placeholder="Admin PIN"
            className="neu-input px-4 py-3 text-sm"
          />
          <button onClick={tryAdmin} className="neu-btn px-6 text-sm font-bold text-accent shrink-0">Open</button>
        </div>
        {pinErr && <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>{pinErr}</p>}
      </div>

      <SectionTitle>About</SectionTitle>
      <div className="neu-sm p-4 text-sm text-soft">
        <p className="font-bold text-base" style={{ color: 'var(--text)' }}>ClassTime 📚</p>
        <p className="text-xs mt-1">Beautiful timetable PWA · neumorphic design · free forever · your data stays yours.</p>
      </div>
    </div>
  );
}
