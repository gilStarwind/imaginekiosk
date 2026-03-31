"use client";

import { useEffect, useState } from 'react';
import { Mission, Settings } from '../../lib/types';

export default function AdminDashboard() {
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
    fetch('/api/missions').then(r => r.json()).then(setMissions);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '112200') setLocked(false);
    else alert('Incorrect PIN');
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
    await fetch('/api/missions', {
      method: 'POST',
      body: JSON.stringify(missions)
    });
    setSaving(false);
    alert('Saved successfully!');
  };

  const uploadImage = async (file: File, target: 'general' | 'missions') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', target);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.ok) return data.url;
    throw new Error(data.error);
  };

  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4 text-center">
        <form onSubmit={handleUnlock} className="glass-panel p-8 rounded-3xl max-w-sm w-full space-y-6">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <input 
            type="password" 
            value={pin} onChange={e => setPin(e.target.value)} 
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-center text-xl tracking-widest"
            placeholder="••••"
          />
          <button type="submit" className="w-full btn-premium py-3 rounded-lg font-bold">Unlock</button>
        </form>
      </div>
    );
  }

  if (!settings) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center glass-panel p-4 rounded-2xl sticky top-4 z-50 shadow-2xl">
          <h1 className="text-2xl font-bold">Kiosk Admin Dashboard</h1>
          <div className="flex gap-4">
            <a href="/" className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition">View Kiosk</a>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 rounded-lg btn-premium font-bold disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold border-b border-slate-700 pb-2">Global Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="space-y-2 block">
              <span className="text-sm text-slate-400">Theme</span>
              <select 
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.theme} 
                onChange={e => setSettings({...settings, theme: e.target.value})}
              >
                <option value="evergreen">Evergreen</option>
                <option value="ocean">Ocean</option>
                <option value="ember">Ember</option>
                <option value="sunrise">Sunrise</option>
                <option value="lagoon">Lagoon</option>
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm text-slate-400">Top Announcement Banner</span>
              <input 
                type="text" 
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.announcement} 
                onChange={e => setSettings({...settings, announcement: e.target.value})}
              />
            </label>
            
            <label className="space-y-2 block">
              <span className="text-sm text-slate-400">Idle Reset (ms)</span>
              <input 
                type="number" 
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.idleMs} 
                onChange={e => setSettings({...settings, idleMs: Number(e.target.value)})}
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm text-slate-400 flex justify-between">
                <span>Google Sheets CSV URL</span>
                {settings.sheetUrl && <button type="button" onClick={() => fetch('/api/sync', {method:'POST'}).then(() => alert('Manual Sync triggered! Check kiosk.')).catch(e=>alert('Sync failed'))} className="text-emerald-400 text-xs hover:underline">Force Sync Now</button>}
              </span>
              <input 
                type="url" 
                placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.sheetUrl || ''} 
                onChange={e => setSettings({...settings, sheetUrl: e.target.value})}
              />
            </label>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold border-b border-slate-700 pb-2">Splash Screen (Attract Loop)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <label className="space-y-2 block">
              <span className="text-sm text-slate-400">Title</span>
              <input 
                type="text" 
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.splashTitle} 
                onChange={e => setSettings({...settings, splashTitle: e.target.value})}
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm text-slate-400">Subtitle</span>
              <input 
                type="text" 
                className="w-full bg-slate-800 rounded-lg p-3 border border-slate-700"
                value={settings.splashSubtitle} 
                onChange={e => setSettings({...settings, splashSubtitle: e.target.value})}
              />
            </label>
            <label className="space-y-2 block">
              <span className="text-sm text-slate-400 flex items-center justify-between">
                <span>Splash Logo Image</span>
                {settings.splashImage && <img src={settings.splashImage} className="h-8 rounded" alt="" />}
              </span>
              <input 
                 type="file" 
                 accept="image/*"
                 className="w-full bg-slate-800 rounded-lg p-2 border border-slate-700 file:bg-slate-700 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3"
                 onChange={async e => {
                   if (e.target.files?.[0]) {
                     const url = await uploadImage(e.target.files[0], 'general');
                     setSettings({...settings, splashImage: url});
                   }
                 }}
              />
            </label>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h2 className="text-xl font-bold">Missions</h2>
            <button 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-sm"
              onClick={() => {
                setMissions([{
                  id: 'new-' + Date.now(), title: 'New Mission', subtitle: '', focus: '', involved: '', contact: '', body: '', image: '', links: []
                }, ...missions]);
              }}
            >
              + Add Mission
            </button>
          </div>
          
          <div className="space-y-6">
            {missions.map((mission, idx) => (
              <div key={mission.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{mission.title || 'Untitled Mission'}</h3>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this mission?')) setMissions(missions.filter((_, i) => i !== idx));
                    }}
                    className="text-red-400 hover:text-red-300 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <label className="space-y-1 block">
                    <span className="text-xs text-slate-400">Title</span>
                    <input type="text" value={mission.title} onChange={e => {
                      const m = [...missions]; m[idx].title = e.target.value; setMissions(m);
                    }} className="w-full bg-slate-900 rounded p-2 border border-slate-700 text-sm" />
                   </label>
                   <label className="space-y-1 block">
                    <span className="text-xs text-slate-400">Focus / Tagline</span>
                    <input type="text" value={mission.focus} onChange={e => {
                      const m = [...missions]; m[idx].focus = e.target.value; setMissions(m);
                    }} className="w-full bg-slate-900 rounded p-2 border border-slate-700 text-sm" />
                   </label>
                   <label className="space-y-1 block md:col-span-2">
                    <span className="text-xs text-slate-400">About (Body Text)</span>
                    <textarea rows={3} value={mission.body} onChange={e => {
                      const m = [...missions]; m[idx].body = e.target.value; setMissions(m);
                    }} className="w-full bg-slate-900 rounded p-2 border border-slate-700 text-sm" />
                   </label>
                   <label className="space-y-1 block">
                    <span className="text-xs text-slate-400">How to Get Involved</span>
                    <textarea rows={2} value={mission.involved} onChange={e => {
                      const m = [...missions]; m[idx].involved = e.target.value; setMissions(m);
                    }} className="w-full bg-slate-900 rounded p-2 border border-slate-700 text-sm" />
                   </label>
                   <label className="space-y-1 block">
                    <span className="text-xs text-slate-400">Contact / Email</span>
                    <input type="text" value={mission.contact} onChange={e => {
                      const m = [...missions]; m[idx].contact = e.target.value; setMissions(m);
                    }} className="w-full bg-slate-900 rounded p-2 border border-slate-700 text-sm" />
                   </label>
                   <label className="space-y-1 block md:col-span-2">
                    <span className="text-xs text-slate-400 flex items-center gap-4">
                      <span>Card Image File</span>
                      {mission.image && <img src={mission.image} className="h-6 rounded bg-slate-900" alt="" />}
                    </span>
                    <input type="file" accept="image/*" onChange={async e => {
                       if (e.target.files?.[0]) {
                         const url = await uploadImage(e.target.files[0], 'missions');
                         const m = [...missions]; m[idx].image = url; setMissions(m);
                       }
                    }} className="w-full bg-slate-900 rounded p-1 border border-slate-700 text-sm file:text-xs file:bg-slate-700 file:border-none file:text-white file:px-2 file:py-1 file:rounded" />
                   </label>
                </div>
              </div>
            ))}
            
            {missions.length === 0 && <div className="text-slate-500 py-8 text-center">No missions created yet.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
