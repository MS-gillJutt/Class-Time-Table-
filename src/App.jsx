import React, { useState } from 'react';
import { StoreProvider } from './lib/store';
import Nav from './components/Nav';
import Home from './pages/Home';
import Grid from './pages/Grid';
import Assistant from './pages/Assistant';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import './theme.css';

function Shell() {
  const [tab, setTab] = useState('home');
  const go = (t) => { setTab(t); window.scrollTo(0, 0); };

  return (
    <>
      <div key={tab} className="fade-in">
        {tab === 'home' && <Home go={go} />}
        {tab === 'grid' && <Grid />}
        {tab === 'ai' && <Assistant />}
        {tab === 'settings' && <Settings go={go} />}
        {tab === 'admin' && <Admin go={go} />}
      </div>
      {tab !== 'admin' && <Nav tab={tab} setTab={setTab} />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
