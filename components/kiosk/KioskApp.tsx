"use client";

import { useEffect, useState, useRef } from 'react';
import { Mission, Settings } from '../../lib/types';
import { ChevronLeft, Home, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';

type ViewMode = 'splash' | 'home' | 'detail';

export default function KioskApp({
  initialMissions,
  initialSettings
}: {
  initialMissions: Mission[];
  initialSettings: Settings;
}) {
  const [mode, setMode] = useState<ViewMode>('splash');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [activeQr, setActiveQr] = useState<string | null>(null);

  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const qrTimeout = useRef<NodeJS.Timeout | null>(null);
  // Keeps last QR URL alive during fade-out so content doesn't vanish mid-transition
  const lastQr = useRef<string | null>(null);
  if (activeQr) lastQr.current = activeQr;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', initialSettings.theme);
  }, [initialSettings.theme]);

  const resetIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setMode('splash');
      setSelectedMission(null);
      setActiveQr(null);
      if (qrTimeout.current) clearTimeout(qrTimeout.current);

      if (initialSettings.sheetUrl) {
        fetch('/api/sync', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.ok && Array.isArray(data.data)) setMissions(data.data);
          }).catch(err => console.warn('Background sync failed:', err));
      }
    }, initialSettings.idleMs || 60000);
  };

  const showQr = (url: string) => {
    setActiveQr(url);
    if (qrTimeout.current) clearTimeout(qrTimeout.current);
    qrTimeout.current = setTimeout(() => setActiveQr(null), 60000);
    resetIdle();
  };

  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'touchstart'];
    const handler = () => resetIdle();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    if (mode !== 'splash') resetIdle();
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [mode, initialSettings.idleMs]);

  const handleStart = () => { setMode('home'); resetIdle(); };
  const handleMissionSelect = (mission: Mission) => { setSelectedMission(mission); setMode('detail'); };

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--color-text-base)]">

      {/* SPLASH SCREEN */}
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-opacity duration-300 ${mode === 'splash' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={handleStart}
      >
        <div className="glass-panel animate-floaty rounded-[3rem] p-12 md:p-16 flex flex-col items-center gap-8 max-w-2xl relative z-10">
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden glass-panel border border-[var(--color-brand-700)] shadow-2xl p-4 flex items-center justify-center bg-white/5">
            <img
              src={initialSettings.splashImage || '/images/general/logo.png'}
              alt="Splash Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              {initialSettings.splashTitle}
            </h1>
            <p className="text-xl md:text-2xl text-[var(--color-text-subtle)] font-medium">
              {initialSettings.splashSubtitle}
            </p>
          </div>

          <button
            className="mt-4 px-10 py-5 text-2xl font-bold rounded-full btn-premium shadow-[0_0_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform"
            onClick={(e) => { e.stopPropagation(); handleStart(); }}
          >
            Touch to Begin
          </button>
        </div>
      </div>

      {/* MAIN APP */}
      <div className={`absolute inset-0 flex flex-col pt-16 transition-opacity duration-200 ${mode !== 'splash' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* HEADER */}
        <header className="fixed top-0 inset-x-0 z-40 bg-[var(--color-surface)]/95 border-b border-[var(--color-brand-900)]/40 p-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            {mode === 'detail' && (
              <button
                onClick={() => setMode('home')}
                className="flex items-center gap-2 px-5 py-3 rounded-full btn-premium font-semibold text-lg"
              >
                <ChevronLeft className="w-6 h-6" /> Back
              </button>
            )}
            <button
              onClick={() => setMode('splash')}
              className="flex items-center gap-2 px-5 py-3 rounded-full glass-panel active:scale-95 transition-transform font-semibold text-lg text-[var(--color-on-surface)]"
            >
              <Home className="w-6 h-6" /> Home
            </button>
            <div className="flex-1" />
            <div className="text-lg font-bold text-[var(--color-text-subtle)] mr-2">
              Imagine Kiosk
            </div>
          </div>
        </header>

        {/* HOME GRID */}
        <main className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-6 md:p-8 relative">
          <div className={`transition-opacity duration-200 ${mode === 'home' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
              <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-8 text-center mt-4">
                <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter drop-shadow-md">
                  imagine serving others
                </h2>
                <p className="text-xl md:text-2xl text-[var(--color-text-subtle)]">
                  Tap a card to learn how you can pray, give, or serve.
                </p>
              </div>

              {missions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => handleMissionSelect(mission)}
                  className="glass-panel rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex flex-col"
                >
                  <div className="h-48 md:h-56 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                    <img
                      src={mission.image}
                      alt={mission.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-end bg-gradient-to-t from-[var(--color-surface)] to-transparent">
                    <h3 className="text-2xl font-bold leading-tight mb-2">{mission.title}</h3>
                    <p className="text-[var(--color-text-subtle)] text-base line-clamp-2">{mission.focus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL OVERLAY */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pt-24 bg-black/90 transition-opacity duration-200 ${mode === 'detail' && selectedMission ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {selectedMission && (
          <div className="relative w-full max-w-4xl max-h-full overflow-y-auto glass-panel rounded-[2rem] shadow-2xl border border-[var(--color-brand-700)]/50 bg-[var(--color-surface)]">
            <div className="flex flex-col md:flex-row min-h-[400px]">
              <div className="md:w-2/5 md:min-h-full bg-white/5 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[var(--color-brand-900)]/30">
                <img
                  src={selectedMission.image}
                  alt={selectedMission.title}
                  className="w-full max-h-[300px] object-contain"
                />
              </div>

              <div className="p-8 md:p-10 flex-1 flex flex-col gap-6">
                <h2 className="text-3xl md:text-5xl font-black">{selectedMission.title}</h2>

                <div className="space-y-6 text-lg">
                  <div>
                    <h4 className="text-[var(--color-brand)] font-bold text-sm uppercase tracking-wider mb-2">Mission Focus</h4>
                    <p className="text-[var(--color-text-base)] leading-relaxed">{selectedMission.focus}</p>
                  </div>
                  <div>
                    <h4 className="text-[var(--color-brand)] font-bold text-sm uppercase tracking-wider mb-2">How to Get Involved</h4>
                    <p className="text-[var(--color-text-base)] leading-relaxed">{selectedMission.involved}</p>
                  </div>
                  <div>
                    <h4 className="text-[var(--color-brand)] font-bold text-sm uppercase tracking-wider mb-2">About this Mission</h4>
                    <p className="text-[var(--color-text-subtle)] leading-relaxed">{selectedMission.body}</p>
                  </div>
                  {selectedMission.contact && (
                    <div>
                      <h4 className="text-[var(--color-brand)] font-bold text-sm uppercase tracking-wider mb-2">Contact</h4>
                      <p className="text-[var(--color-text-base)] break-all">{selectedMission.contact}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                  {selectedMission.links?.map((link: any, j: number) => (
                    <button
                      key={j}
                      onClick={() => showQr(link.href)}
                      className="btn-premium px-6 py-3 rounded-full font-bold flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMode('home')}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* QR CODE OVERLAY */}
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 cursor-pointer transition-opacity duration-200 ${activeQr ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setActiveQr(null)}
      >
        {lastQr.current && (
          <div
            className="glass-panel p-10 md:p-14 rounded-[3rem] flex flex-col items-center gap-6 max-w-sm text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold">Scan to visit</h3>
            <div className="bg-white p-6 rounded-[2rem] shadow-xl w-64 h-64 flex-shrink-0">
              <QRCode value={lastQr.current} size={256} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} />
            </div>
            <p className="text-[var(--color-text-subtle)] text-sm break-all px-2 opacity-80 font-medium">
              {lastQr.current}
            </p>
            <button
              onClick={() => setActiveQr(null)}
              className="btn-premium px-10 py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform"
            >
              Done
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-0 inset-x-0 bg-[var(--color-surface)]/95 border-t border-[var(--color-brand-900)]/40 p-3 flex items-center justify-between text-sm text-[var(--color-text-muted)] z-40">
        <div>
          {initialSettings.announcement && <span className="mr-4 font-medium text-[var(--color-brand)]">{initialSettings.announcement}</span>}
          <span>Screen resets after {Math.round(initialSettings.idleMs / 1000)}s of inactivity</span>
        </div>
        <a href="/admin" className="px-4 py-2 rounded-lg glass-panel hover:bg-white/10 transition-colors font-semibold shadow-inner">
          Admin Dashboard (Network Only)
        </a>
      </footer>

    </div>
  );
}
