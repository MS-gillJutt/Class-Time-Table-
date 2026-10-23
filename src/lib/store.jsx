import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { SAMPLE } from './sampleData';
import { cloudEnabled, fetchLive, subscribeLive, publishLive } from './firebase';

const LS_DATA = 'classtime.data.v1';
const LS_PREF = 'classtime.prefs.v1';

function readLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function writeLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => readLS(LS_DATA, SAMPLE));
  const [prefs, setPrefs] = useState(() => readLS(LS_PREF, {
    theme: 'light', deptId: 'cs', sectionId: 'cs-3a',
    notify: false, notifyBefore: 15, adminPin: '1234',
  }));
  const [cloud, setCloud] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // theme -> <html class>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',
      prefs.theme === 'dark' ? '#17191f' : '#e0e5ec');
    writeLS(LS_PREF, prefs);
  }, [prefs]);

  // initial load: cache first, then cloud
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!cloudEnabled) return;
      setSyncing(true);
      const live = await fetchLive();
      if (alive && live && (live.version || 0) >= (readLS(LS_DATA, SAMPLE).version || 0)) {
        setData(live); writeLS(LS_DATA, live); setCloud(true);
      }
      setSyncing(false);
    })();
    const unsub = subscribeLive((live) => {
      setData((prev) => {
        if ((live.version || 0) > (prev.version || 0)) {
          writeLS(LS_DATA, live);
          return live;
        }
        return prev;
      });
      setCloud(true);
    });
    return () => { alive = false; unsub(); };
  }, []);

  const setPref = useCallback((k, v) => setPrefs((p) => ({ ...p, [k]: v })), []);

  const publish = useCallback(async (next) => {
    setData(next); writeLS(LS_DATA, next);
    if (cloudEnabled) {
      setSyncing(true);
      try {
        const saved = await publishLive(next);
        setData(saved); writeLS(LS_DATA, saved);
      } finally { setSyncing(false); }
    }
  }, []);

  const value = useMemo(() => ({
    data, prefs, setPref, publish, cloud: cloudEnabled && cloud, syncing, cloudEnabled,
    departments: data.departments || [],
    sections: (deptId) => (data.sections || []).filter((s) => s.deptId === deptId),
    gridFor: (sectionId) => (data.grid || {})[sectionId] || {},
  }), [data, prefs, cloud, syncing, setPref, publish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore outside provider');
  return ctx;
}
