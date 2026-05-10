import React from 'react';
import { useStudoStore } from '../../store/useStudoStore';
import { wsService } from '../../lib/websocket';

export const HolographicHUD: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  const { gestures, scene, knowledge, setKnowledge } = useStudoStore();

  const handleSearch = (customQuery?: string) => {
    const query = customQuery || "Spatial Computing"; 
    console.log("🚀 Emitting search event for:", query);
    setKnowledge({ loading: true, query });
    wsService.emit("search", { query });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col p-10 font-sans selection:bg-neon-cyan/30">
      {/* Camera Mirror Box - Stark Style Preview */}
      <div className="fixed bottom-10 right-10 w-48 h-32 glass-widget overflow-hidden pointer-events-auto border-neon-cyan/30 shadow-[0_0_20px_rgba(0,242,255,0.2)] group hover:w-64 hover:h-48 transition-all">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity" 
          autoPlay 
          playsInline 
          muted 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
          <span className="text-[8px] font-bold text-neon-cyan/80 uppercase tracking-widest">LIVE_FEED_01</span>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center w-full animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="flex items-center gap-6">
          <div className="glass-widget px-8 py-4 flex flex-col pointer-events-auto cursor-pointer group">
            <h1 className="orbitron font-black text-3xl tracking-tighter neon-text group-hover:scale-105 transition-transform">STUDO</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
              <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-bold">Spatial Operating System</p>
            </div>
          </div>

          <div className="flex gap-3 pointer-events-auto">
            <div className="status-tag">
              <span className={`w-2 h-2 rounded-full ${gestures.active ? 'bg-neon-cyan' : 'bg-red-500'}`} />
              <span className="text-white/60">HAND: {gestures.active ? `${(gestures.confidence * 100).toFixed(0)}%` : 'OFFLINE'}</span>
            </div>
            <div className="status-tag">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-white/60">BRAIN: ONLINE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          <button className="glass-widget p-4 hover:bg-white/10">
            <div className="w-5 h-5 flex flex-col justify-between items-end">
              <div className="w-5 h-0.5 bg-white/80" />
              <div className="w-3 h-0.5 bg-white/80" />
              <div className="w-4 h-0.5 bg-white/80" />
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-between mt-10">
        {/* Left Side: Object Inspector & Controls */}
        <aside className="hologram-card p-8 w-80 pointer-events-auto animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="orbitron text-xs font-bold text-neon-cyan uppercase tracking-widest">CONTROL CENTER</h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-neon-cyan rounded-full animate-ping" />
              <div className="w-1 h-1 bg-neon-cyan rounded-full" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold block mb-2">Subject</label>
              <h3 className="text-xl font-light tracking-tight group-hover:text-neon-cyan transition-colors">Damaged Helmet</h3>
              <p className="text-[10px] text-white/20 mt-1 italic">Type: Engineering Asset v2.1</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-widget bg-white/5 p-4">
                <label className="text-[9px] text-white/30 uppercase block mb-1">Status</label>
                <span className="text-xs font-bold text-white/90 uppercase tracking-tighter">
                  {scene.isExploded ? 'Exploded' : 'Nominal'}
                </span>
              </div>
              <div className="glass-widget bg-white/5 p-4">
                <label className="text-[9px] text-white/30 uppercase block mb-1">Temp</label>
                <span className="text-xs font-bold text-white/90 uppercase tracking-tighter">32.4°C</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex gap-2 pointer-events-auto">
                <input 
                  type="text" 
                  id="studo-search-input"
                  placeholder="Search Archive..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('studo-search-input') as HTMLInputElement;
                    handleSearch(input.value);
                  }}
                  className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan p-3 rounded-xl hover:bg-neon-cyan/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>

              <button 
                onClick={() => useStudoStore.getState().setScene({ isExploded: !scene.isExploded })}
                className="neon-btn w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {scene.isExploded ? 'Reassemble' : 'Explode View'}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side: Knowledge & Gesture Guide */}
        <div className="flex flex-col gap-6 items-end">
          {/* Knowledge Panel */}
          {knowledge.summary && (
            <aside className="hologram-card p-10 w-[450px] pointer-events-auto animate-in fade-in zoom-in duration-700">
              <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center text-neon-cyan">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div>
                    <h2 className="orbitron text-xs font-bold text-neon-cyan tracking-[0.2em] uppercase">Archive Result</h2>
                    <p className="text-xl font-bold tracking-tight text-white/90">{knowledge.query}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setKnowledge({ summary: null, query: null })}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="relative">
                <p className="text-sm text-white/70 leading-relaxed font-light h-60 overflow-y-auto pr-4 custom-scrollbar">
                  {knowledge.summary}
                </p>
              </div>
            </aside>
          )}

          {/* New: Gesture Guide Panel (Stark Signs) */}
          <aside className="hologram-card p-6 w-[350px] pointer-events-auto animate-in fade-in slide-in-from-right-10 duration-1000 delay-700">
            <h2 className="orbitron text-[10px] font-bold text-neon-cyan mb-4 uppercase tracking-widest">STARK GESTURE GUIDE (v1.0)</h2>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { s: 'Grab', d: 'Rotate Model' },
                { s: 'Pinch', d: 'Zoom In/Out' },
                { s: 'Spread', d: 'Explode View' },
                { s: 'Point', d: 'Select Part' },
                { s: 'Fist', d: 'Pause Anim' },
                { s: 'Swipe L/R', d: 'Next Object' },
                { s: 'Two Hands', d: 'Merge Parts' },
                { s: 'Thumb Up', d: 'Confirm' },
                { s: 'Thumb Down', d: 'Cancel' },
                { s: 'Peace', d: 'X-Ray View' },
                { s: 'L-Sign', d: 'Measure' },
                { s: 'Circular', d: 'Reset View' },
                { s: 'Push', d: 'Move Away' },
                { s: 'Pull', d: 'Bring Close' },
                { s: 'Three Up', d: 'Lab Mode' },
                { s: 'Four Up', d: 'Snapshot' },
                { s: 'Ok Sign', d: 'AI Analysis' },
                { s: 'Cross', d: 'Clear All' },
                { s: 'Waves', d: 'Scan Area' },
                { s: 'Spider', d: 'Wireframe' }
              ].map((g, i) => (
                <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-0.5">
                   <span className="text-neon-cyan text-[9px] font-black uppercase tracking-tighter">{g.s}</span>
                   <span className="text-white/40 text-[8px] italic">{g.d}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer / Hand Cursor Legend */}
      <footer className="mt-auto flex justify-between items-end animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
        <div className="glass-widget p-6 flex gap-8 pointer-events-auto">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Latency</span>
             <span className="orbitron text-sm font-bold text-green-500">12ms</span>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="flex flex-col gap-1">
             <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Render</span>
             <span className="orbitron text-sm font-bold text-neon-cyan">60fps</span>
          </div>
        </div>

        <div className="flex gap-4">
           {/* Visual legend for hand tracking */}
           <div className="glass-widget p-4 flex items-center gap-4 pointer-events-auto">
              <div className="flex gap-1 items-end h-4">
                <div className="w-1 h-2 bg-neon-cyan/30 rounded-full" />
                <div className="w-1 h-3 bg-neon-cyan/50 rounded-full" />
                <div className="w-1 h-4 bg-neon-cyan rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Signal Stable</span>
           </div>
        </div>
      </footer>

      {/* Interactive Hand Cursor Feedback */}
      {gestures.active && gestures.handPosition && (
        <div 
          className="fixed w-12 h-12 border border-neon-cyan/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 cursor-glow flex items-center justify-center"
          style={{ 
            left: `${(1 - gestures.handPosition.x) * 100}%`, 
            top: `${gestures.handPosition.y * 100}%`,
            zIndex: 100
          }}
        >
          <div className="w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_10px_#00f2ff]" />
          <div className="absolute inset-0 border-2 border-neon-cyan/20 animate-ping rounded-full" />
          
          {/* Spatial Labels */}
          <div className="absolute top-14 left-14 glass-widget px-3 py-1 scale-75 origin-top-left">
            <span className="text-[8px] font-bold text-neon-cyan uppercase tracking-tighter">X: {gestures.handPosition.x.toFixed(2)} Y: {gestures.handPosition.y.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Global Scanning Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none scan-overlay opacity-30 mix-blend-overlay" />
    </div>
  );
};
