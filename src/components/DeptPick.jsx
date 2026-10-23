import React from 'react';
import { useStore } from '../lib/store';

/** Department → Section cascading dropdowns (neumorphic inset). */
export default function DeptPick() {
  const { prefs, setPref, departments, sections } = useStore();
  const deptSections = sections(prefs.deptId);

  const pickDept = (id) => {
    const first = sections(id)[0];
    setPref('deptId', id);
    if (first) setPref('sectionId', first.id);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <p className="text-soft text-xs font-semibold uppercase tracking-wider ml-1 mb-1.5">Department</p>
        <div className="relative">
          <select
            value={prefs.deptId}
            onChange={(e) => pickDept(e.target.value)}
            className="neu-input appearance-none px-4 py-3 pr-9 text-sm font-semibold"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-soft pointer-events-none">▾</span>
        </div>
      </div>
      <div>
        <p className="text-soft text-xs font-semibold uppercase tracking-wider ml-1 mb-1.5">Section</p>
        <div className="relative">
          <select
            value={prefs.sectionId}
            onChange={(e) => setPref('sectionId', e.target.value)}
            className="neu-input appearance-none px-4 py-3 pr-9 text-sm font-semibold"
          >
            {deptSections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-soft pointer-events-none">▾</span>
        </div>
      </div>
    </div>
  );
}
