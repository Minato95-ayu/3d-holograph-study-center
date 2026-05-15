import React from 'react';
import { useStudoStore } from '../../store/useStudoStore';
import { wsService } from '../../lib/websocket';
import { ario } from '../../lib/ario';
import { speechInput } from '../../lib/speechInput';

const DOMAIN_ICONS: Record<string, string> = {
  chemistry: '⚗️', physics: '⚛️', biology: '🧬',
  mathematics: '📐', astronomy: '🌌', general: '📖',
};

export const HolographicHUD: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  const { gestures, scene, knowledge, setKnowledge, cameraStatus, cameraError, ario: arioState, setScene, setArio } = useStudoStore();

  const handleSearch = (customQuery?: string) => {
    const input = document.getElementById('studo-search-input') as HTMLInputElement;
    const query = customQuery || input?.value || 'Spatial Computing';
    if (!query.trim()) return;
    setKnowledge({ loading: true, query });
    wsService.emit('search', { query });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col p-10 font-sans">

      {/* Camera Feed */}
      <div className="fixed top-[100px] right-10 z-50 w-48 h-32 glass-widget overflow-hidden pointer-events-auto border-neon-cyan/30 shadow-[0_0_20px_rgba(0,242,255,0.2)] group hover:w-64 hover:h-48 transition-all">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity" autoPlay playsInline muted />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
          <span className="text-[8px] font-bold text-neon-cyan/80 uppercase tracking-widest">LIVE_FEED_01</span>
        </div>
      </div>

      {/* Header */}
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
            {/* HAND status */}
            <div className="status-tag">
              {cameraStatus === 'loading' ? (<><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /><span className="text-white/60">HAND: INIT...</span></>) :
               cameraStatus === 'error' ? (<><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-red-400">HAND: ERROR</span></>) :
               cameraStatus === 'active' ? (<><span className={`w-2 h-2 rounded-full ${gestures.active ? 'bg-neon-cyan animate-pulse' : 'bg-neon-cyan/50'}`} /><span className="text-white/60">HAND: {gestures.active ? `${(gestures.confidence * 100).toFixed(0)}%` : 'READY'}</span></>) :
               (<><span className="w-2 h-2 rounded-full bg-white/20" /><span className="text-white/40">HAND: OFFLINE</span></>)}
            </div>
            <div className="status-tag"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-white/60">BRAIN: ONLINE</span></div>
            {/* ARIO mic status */}
            <div className="status-tag">
              <span className={`w-2 h-2 rounded-full ${arioState.micActive ? 'bg-purple-400 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-white/60">ARIO: {arioState.state === 'speaking' ? 'SPEAKING' : arioState.state === 'thinking' ? 'THINKING' : arioState.micActive ? 'LISTENING' : 'STANDBY'}</span>
            </div>
          </div>
        </div>

        {/* ARIO mic toggle */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => speechInput.toggle()}
            className={`glass-widget p-4 transition-all ${arioState.micActive ? 'border-purple-400/60 bg-purple-400/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'hover:bg-white/10'}`}
            title={arioState.micActive ? 'Stop Listening' : 'Say "Hey ARIO" to activate'}
          >
            <svg className={`w-5 h-5 ${arioState.micActive ? 'text-purple-400' : 'text-white/60'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-between mt-10">

        {/* Left: Control Center */}
        <aside className="hologram-card p-8 w-80 pointer-events-auto animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="orbitron text-xs font-bold text-neon-cyan uppercase tracking-widest">CONTROL CENTER</h2>
            <div className="flex gap-1"><div className="w-1 h-1 bg-neon-cyan rounded-full animate-ping" /><div className="w-1 h-1 bg-neon-cyan rounded-full" /></div>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[10px] text-white/30 uppercase tracking-widest font-bold block mb-2">Subject</label>
              <h3 className="text-xl font-light tracking-tight group-hover:text-neon-cyan transition-colors">{knowledge.title || 'Damaged Helmet'}</h3>
              <p className="text-[10px] text-white/20 mt-1 italic">{knowledge.domain ? `Domain: ${knowledge.domain}` : 'Type: Engineering Asset v2.1'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-widget bg-white/5 p-4">
                <label className="text-[9px] text-white/30 uppercase block mb-1">Status</label>
                <span className="text-xs font-bold text-white/90 uppercase tracking-tighter">{scene.isExploded ? 'Exploded' : 'Nominal'}</span>
              </div>
              <div className="glass-widget bg-white/5 p-4">
                <label className="text-[9px] text-white/30 uppercase block mb-1">Mode</label>
                <span className="text-xs font-bold text-white/90 uppercase tracking-tighter">{scene.hologramType?.toUpperCase() || 'DEFAULT'}</span>
              </div>
            </div>

            {/* Search */}
            <div className="pt-2 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="studo-search-input"
                  placeholder="Search Archive..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-neon-cyan transition-all"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
                <button onClick={() => handleSearch()} className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan p-3 rounded-xl hover:bg-neon-cyan/40">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>

              {/* Loading indicator */}
              {knowledge.loading && (
                <div className="flex items-center gap-3 px-2">
                  <div className="w-3 h-3 border-2 border-neon-cyan/60 border-t-neon-cyan rounded-full animate-spin" />
                  <span className="text-[10px] text-neon-cyan/60 uppercase tracking-widest">ARIO Thinking...</span>
                </div>
              )}

              <button
                onClick={() => useStudoStore.getState().setScene({ isExploded: !scene.isExploded })}
                className="neon-btn w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                {scene.isExploded ? 'Reassemble' : 'Explode View'}
              </button>
            </div>

            {/* Level Navigator */}
            <div className="pt-4 border-t border-white/10">
              <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-3">Hierarchical Level</label>
              <div className="flex flex-wrap gap-2">
                {(['organism', 'system', 'organ', 'tissue', 'cell'] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => {
                      setScene({ level: lv });
                      ario.speak(`Switching to ${lv} level.`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter border transition-all ${
                      scene.level === lv 
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="pt-4 border-t border-white/10">
              <label className="text-[9px] text-white/30 uppercase tracking-widest font-bold block mb-2">ARIA Language</label>
              <div className="flex gap-2">
                {(['en', 'hi', 'hinglish'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setArio({ language: lang })}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                      arioState.language === lang 
                        ? 'bg-purple-400/20 border-purple-400 text-purple-400' 
                        : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'
                    }`}
                  >
                    {lang === 'hi' ? 'Hindi' : lang === 'hinglish' ? 'Hinglish' : 'English'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panels */}
        <div className="flex flex-col gap-4 items-end max-w-[480px]">

          {/* ARIO Speaking Panel */}
          {arioState.state === 'speaking' && arioState.currentText && (
            <div className="hologram-card p-5 w-[460px] pointer-events-auto animate-in fade-in zoom-in duration-500 border border-purple-400/30 bg-purple-400/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-8 h-8">
                  <div className="w-8 h-8 rounded-full bg-purple-400/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </div>
                  <div className="absolute inset-0 border-2 border-purple-400/40 rounded-full animate-ping" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.2em]">ARIO SPEAKING</p>
                  {/* Audio bars animation */}
                  <div className="flex items-end gap-0.5 h-3 mt-1">
                    {[2,4,3,5,2,4,3].map((h, i) => (
                      <div key={i} className="w-0.5 bg-purple-400/60 rounded-full animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/70 leading-relaxed italic">"{arioState.currentText.slice(0, 120)}{arioState.currentText.length > 120 ? '...' : ''}"</p>
            </div>
          )}

          {/* Knowledge Panel */}
          {knowledge.summary && !knowledge.loading && (
            <aside className="hologram-card p-8 w-[460px] pointer-events-auto animate-in fade-in zoom-in duration-700">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neon-cyan/20 rounded-xl flex items-center justify-center text-xl">
                    {DOMAIN_ICONS[knowledge.domain] || '📖'}
                  </div>
                  <div>
                    <h2 className="orbitron text-xs font-bold text-neon-cyan tracking-[0.2em] uppercase">Archive Result</h2>
                    <p className="text-xl font-bold tracking-tight text-white/90">{knowledge.title || knowledge.query}</p>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{knowledge.domain}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setKnowledge({ summary: null, query: null, formulas: [], components: [], fun_fact: '' }); ario.stop(); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Summary */}
              <p className="text-xs text-white/70 leading-relaxed font-light mb-5 max-h-28 overflow-y-auto custom-scrollbar pr-2">
                {knowledge.summary}
              </p>


              {/* Formulas Section */}
              {knowledge.formulas && knowledge.formulas.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>⚡</span> Key Formulas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {knowledge.formulas.map((f, i) => (
                      <div key={i} className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg px-3 py-2 text-center">
                        <span className="text-neon-cyan font-mono text-xs font-bold">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross Questions / Argument Section */}
              {knowledge.crossQuestions && knowledge.crossQuestions.length > 0 && (
                <div className="mb-4 mt-6 border-t border-purple-400/20 pt-4">
                  <h3 className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span>🤔</span> Scientific Cross-Examination
                  </h3>
                  <div className="flex flex-col gap-2">
                    {knowledge.crossQuestions.map((q, i) => (
                      <div key={i} className="bg-purple-400/5 border border-purple-400/20 rounded-lg p-3 group hover:bg-purple-400/10 transition-all cursor-pointer">
                        <p className="text-[10px] text-white/80 leading-relaxed italic">"{q}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experiment Calculations */}
              {knowledge.experiment && knowledge.experiment.calculations && (
                <div className="mb-4">
                  <h3 className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>🧮</span> Math & Physics Calculations
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(knowledge.experiment.calculations).map(([key, value]) => (
                      <div key={key} className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                        <span className="block text-[8px] text-white/50 uppercase tracking-wider mb-1">{key}</span>
                        <span className="text-orange-400 font-mono text-sm font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Components Section */}
              {knowledge.components && knowledge.components.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>🔩</span> Key Components
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {knowledge.components.map((c, i) => (
                      <span key={i} className="bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[10px] px-3 py-1 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Papers Section */}
              {knowledge.researchPapers && knowledge.researchPapers.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[9px] font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span>📚</span> Research Context
                  </h3>
                  <div className="space-y-2">
                    {knowledge.researchPapers.map((paper: any, i: number) => (
                      <a 
                        key={i} 
                        href={paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-green-500/5 border border-green-500/20 rounded-lg p-2 flex items-center gap-2 hover:bg-green-500/10 transition-colors cursor-pointer block"
                      >
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span className="text-[10px] text-green-100/70 font-medium italic">{paper.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Fun Fact */}
              {knowledge.fun_fact && (
                <div className="bg-white/3 border border-white/10 rounded-xl p-3 mt-2">
                  <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">💡 Fun Fact</p>
                  <p className="text-[11px] text-white/60 leading-relaxed italic">{knowledge.fun_fact}</p>
                </div>
              )}

              {/* Speak button */}
              <button
                onClick={() => knowledge.ario_intro && ario.speak(knowledge.ario_intro, true)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-400/10 border border-purple-400/30 rounded-xl py-2 text-[10px] text-purple-300 hover:bg-purple-400/20 transition-colors"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                ARIO Explain Again
              </button>
            </aside>
          )}

          {/* Action Guide (shown only when no knowledge) */}
          {!knowledge.summary && (
            <aside className="hologram-card p-6 w-[350px] pointer-events-auto animate-in fade-in slide-in-from-right-10 duration-1000 delay-700">
              
              <h2 className="orbitron text-[10px] font-bold text-neon-cyan mb-4 uppercase tracking-widest">✋ HAND CONTROLS</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { s: '✊ Grab + Move', d: 'Rotate Model' },
                  { s: '🤏 Pinch', d: 'Zoom In/Out' },
                ].map((g, i) => (
                  <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col gap-0.5">
                    <span className="text-neon-cyan text-[10px] font-black uppercase tracking-tighter">{g.s}</span>
                    <span className="text-white/40 text-[9px] italic">{g.d}</span>
                  </div>
                ))}
              </div>

              <h2 className="orbitron text-[10px] font-bold text-purple-400 mb-4 uppercase tracking-widest">🎤 ARIO VOICE COMMANDS</h2>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { c: '"Hey ARIO, explode model"', d: 'Explodes parts / breaks bonds' },
                  { c: '"Hey ARIO, assemble"', d: 'Reassembles the model' },
                  { c: '"Hey ARIO, what is DNA?"', d: 'Searches & builds 3D hologram' },
                  { c: '"Hey ARIO, stop talking"', d: 'Mutes current explanation' },
                ].map((v, i) => (
                  <div key={i} className="bg-purple-400/5 p-3 rounded-lg border border-purple-400/20 flex flex-col gap-1">
                    <span className="text-purple-300 text-[10px] font-bold italic">{v.c}</span>
                    <span className="text-white/50 text-[9px] uppercase tracking-wider">{v.d}</span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
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
          <div className="w-px h-10 bg-white/5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">AI</span>
            <span className="orbitron text-sm font-bold text-purple-400">ARIO v2</span>
          </div>
        </div>

        <div className="glass-widget p-4 flex items-center gap-4 pointer-events-auto">
          <div className="flex gap-1 items-end h-4">
            <div className="w-1 h-2 bg-neon-cyan/30 rounded-full" />
            <div className="w-1 h-3 bg-neon-cyan/50 rounded-full" />
            <div className="w-1 h-4 bg-neon-cyan rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Signal Stable</span>
        </div>
      </footer>

      {/* Camera Error Toast */}
      {cameraStatus === 'error' && cameraError && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-500">
          <div className="glass-widget border border-red-500/40 bg-red-500/10 px-6 py-4 flex items-start gap-4 max-w-md">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Camera Access Failed</p>
              <p className="text-xs text-white/60 leading-relaxed">{cameraError}</p>
            </div>
          </div>
        </div>
      )}

      {/* MediaPipe Loading Toast */}
      {cameraStatus === 'loading' && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-500">
          <div className="glass-widget border border-yellow-400/30 bg-yellow-400/5 px-6 py-3 flex items-center gap-4">
            <div className="w-4 h-4 border-2 border-yellow-400/60 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest">Initializing Hand Tracking...</p>
          </div>
        </div>
      )}

      {/* Hand Cursor */}
      {gestures.active && gestures.handPosition && (
        <div
          className="fixed w-12 h-12 border border-neon-cyan/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex items-center justify-center"
          style={{ left: `${(1 - gestures.handPosition.x) * 100}%`, top: `${gestures.handPosition.y * 100}%`, zIndex: 100 }}
        >
          <div className="w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_10px_#00f2ff]" />
          <div className="absolute inset-0 border-2 border-neon-cyan/20 animate-ping rounded-full" />
          <div className="absolute top-14 left-14 glass-widget px-3 py-1 scale-75 origin-top-left">
            <span className="text-[8px] font-bold text-neon-cyan uppercase tracking-tighter">
              {gestures.type} | X:{gestures.handPosition.x.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Scan Overlay */}
      <div className="fixed inset-0 pointer-events-none scan-overlay opacity-30 mix-blend-overlay" />
    </div>
  );
};
