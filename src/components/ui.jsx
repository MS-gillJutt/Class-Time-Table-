import React from 'react';

export function Greeting({ name = 'Student' }) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <div>
      <p className="text-soft text-sm font-medium">{g},</p>
      <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
    </div>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-3">
      <h2 className="text-base font-bold">{children}</h2>
      {right}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`neu-btn flex items-center gap-3 px-4 py-3 w-full text-left ${on ? '' : ''}`}
      aria-pressed={on}
    >
      <span className={`neu-in-sm w-11 h-6 relative shrink-0 transition-all`}>
        <span
          className="absolute top-1 w-4 h-4 rounded-full transition-all"
          style={{
            left: on ? '1.4rem' : '0.25rem',
            background: on ? 'var(--accent)' : 'var(--text-soft)',
            boxShadow: '0 1px 4px rgba(0,0,0,.3)',
          }}
        />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="text-soft text-xs font-semibold uppercase tracking-wider ml-1">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function Empty({ icon = '📅', title, hint }) {
  return (
    <div className="neu-in p-8 text-center fade-in">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-bold">{title}</p>
      {hint && <p className="text-soft text-sm mt-1">{hint}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="neu-circle w-12 h-12 animate-pulse" />
    </div>
  );
}
