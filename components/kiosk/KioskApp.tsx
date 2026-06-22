"use client";

import { useEffect, useState, useRef } from 'react';
import { Mission, Settings } from '../../lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Home, QrCode } from 'lucide-react';
import Image from 'next/image';
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

  // Apply visual theme from settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', initialSettings.theme);
  }, [initialSettings.theme]);

  // Idle reset logic
  const resetIdle = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setMode('splash');
      setSelectedMission(null);
      setActiveQr(null);
      if (qrTimeout.current) clearTimeout(qrTimeout.current);
      
      // Auto-sync Google Sheet silently in the background when falling back to idle
      if (initialSettings.sheetUrl) {
        fetch('/api/sync', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.ok && Array.isArray(data.data)) {
              setMissions(data.data);
            }
          }).catch(err => console.warn('Background sync failed:', err));
      }
    }, initialSettings.idleMs || 60000);
  };

  const showQr = (url: string) => {
    setActiveQr(url);
    if (qrTimeout.current) clearTimeout(qrTimeout.current);
    qrTimeout.current = setTimeout(() => {
      setActiveQr(null);
    }, 60000);
    resetIdle();
  };

  useEffect(() => {
    // Attach user activity listeners
    const events = ['pointerdown', 'keydown', 'touchstart'];
    const handler = () => resetIdle();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    
    // Start initial timer if not in splash
    if ((mode as string) !== 'splash') resetIdle();

    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [mode, initialSettings.idleMs]);

  const handleStart = () => {
    setMode('home');
    resetIdle();
  };

  const handleMissionSelect = (mission: Mission) => {
    setSelectedMission(mission);
    setMode('detail');
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--color-text-base)]">
      
      <AnimatePresence mode="sync">

        {/* --- SPLASH SCREEN --- */}
        {mode === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center cursor-pointer"
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
                className="mt-4 px-10 py-5 text-2xl font-bold rounded-full btn-premium shadow-[0_0_30px_rgba(0,0,0,0.3)] shadow-[var(--color-brand)]/20 active:scale-95 transition-transform"
                onClick={(e) => { e.stopPropagation(); handleStart(); }}
              >
                Touch to Begin
              </button>
            </div>
          </motion.div>
        )}

        {/* --- MAIN APP (Header + Content) --- */}
        {mode !== 'splash' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col pt-16"
          >
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
                {(mode as string) !== 'splash' && (
                  <button 
                    onClick={() => setMode('splash')}
                    className="flex items-center gap-2 px-5 py-3 rounded-full glass-panel active:scale-95 transition-transform font-semibold text-lg text-[var(--color-on-surface)]"
                  >
                    <Home className="w-6 h-6" /> Home
                  </button>
                )}
                <div className="flex-1" />
                <div className="text-lg font-bold text-[var(--color-text-subtle)] mr-2">
                  Imagine Kiosk
                </div>
              </div>
            </header>

            {/* HOME GRID */}
            <main className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto p-6 md:p-8 relative">
              <AnimatePresence>
                {mode === 'home' && (
                  <motion.div
                    key="home-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32"
                  >
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 pb-8 text-center mt-4">
                       <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter shadow-black drop-shadow-md">
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
                        className="glass-panel rounded-3xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform flex flex-col"
                      >
                        <div className="h-48 md:h-56 bg-white/5 overflow-hidden flex items-center justify-center p-4">
                           <motion.img
                             src={mission.image}
                             alt={mission.title}
                             className="w-full h-full object-contain"
                           />
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-end bg-gradient-to-t from-[var(--color-surface)] to-transparent">
                          <h3 className="text-2xl font-bold leading-tight mb-2">
                            {mission.title}
                          </h3>
                          <p className="text-[var(--color-text-subtle)] text-base line-clamp-2">
                            {mission.focus}
                          </p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* DETAIL MODAL OVERLAY */}
            <AnimatePresence>
              {mode === 'detail' && selectedMission && (
                <motion.div
                  key="detail-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pt-24 bg-black/90"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-4xl max-h-full overflow-y-auto glass-panel rounded-[2rem] shadow-2xl border border-[var(--color-brand-700)]/50 bg-[var(--color-surface)]"
                  >
                    <div className="flex flex-col md:flex-row min-h-[400px]">
                      {/* Image side */}
                      <div className="md:w-2/5 md:min-h-full bg-white/5 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[var(--color-brand-900)]/30">
                        <img
                          src={selectedMission.image}
                          alt={selectedMission.title}
                          className="w-full max-h-[300px] object-contain"
                        />
                      </div>
                      
                      {/* Content side */}
                      <div className="p-8 md:p-10 flex-1 flex flex-col gap-6">
                        <h2 className="text-3xl md:text-5xl font-black">
                          {selectedMission.title}
                        </h2>

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

                        {/* Actions block */}
                        <div className="mt-4 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                          {selectedMission.links?.map((link: any, j: number) => (
                             <button 
                               key={j} 
                               onClick={() => showQr(link.href)} 
                               className="btn-premium px-6 py-3 rounded-full font-bold flex items-center justify-center text-center shadow-lg active:scale-95 transition-transform"
                             >
                                <QrCode className="w-5 h-5 mr-2" />
                                {link.label}
                             </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Close button top right of modal */}
                    <button 
                      onClick={() => setMode('home')}
                      className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* QR CODE OVERLAY */}
            <AnimatePresence>
              {activeQr && (
                <motion.div
                  key="qr-overlay"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 cursor-pointer"
                  onClick={() => setActiveQr(null)}
                >
                  <div className="glass-panel p-10 md:p-14 rounded-[3rem] flex flex-col items-center gap-6 max-w-sm text-center shadow-2xl border-[var(--color-brand)]/50" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Scan to visit</h3>
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl w-64 h-64 flex-shrink-0">
                      <QRCode value={activeQr} size={256} className="w-full h-full" style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                    </div>
                    <p className="text-[var(--color-text-subtle)] text-sm mb-4 break-all px-2 opacity-80 font-medium">
                      {activeQr}
                    </p>
                    <button 
                      onClick={() => setActiveQr(null)} 
                      className="btn-premium px-10 py-4 rounded-full font-bold text-lg shadow-lg active:scale-95 transition-transform"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

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
