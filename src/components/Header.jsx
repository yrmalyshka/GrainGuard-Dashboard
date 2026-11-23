import React from 'react';
import { Wifi, Volume2, VolumeX, Sliders, Play, Pause, RefreshCw } from 'lucide-react';

export default function Header({
  activeTab,
  isDemoMode,
  setIsDemoMode,
  autoMode,
  onToggleAutoMode,
  soundEnabled,
  setSoundEnabled,
  isLivePaused,
  onToggleLivePause,
  connectionStatus,
  pingLatency,
  lastUpdate
}) {
  const isOnline = connectionStatus.includes('Online');

  return (
    <header className="bg-surface px-8 py-4 shadow-sm border-b border-border flex flex-wrap justify-between items-center sticky top-0 z-10 gap-4">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold text-textPrimary capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-background border border-border text-textSecondary font-mono font-medium">
            Live {lastUpdate}
          </span>
        </div>
        <p className="text-xs text-textSecondary mt-0.5">
          Sistem Pengendalian Otomasi & Pemantauan Silo Pasca-Panen
        </p>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex items-center flex-wrap gap-3">
        
        {/* Pause/Play Stream Button */}
        <button
          onClick={onToggleLivePause}
          className={`p-2 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            isLivePaused 
              ? 'bg-amber-100 text-amber-800 border-amber-300' 
              : 'bg-background hover:bg-slate-100 text-textSecondary border-border'
          }`}
          title={isLivePaused ? 'Lanjutkan Aliran Data' : 'Jeda Aliran Data'}
        >
          {isLivePaused ? <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isLivePaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Sound Alarm Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            soundEnabled 
              ? 'bg-primary/10 text-primary border-primary/30' 
              : 'bg-background hover:bg-slate-100 text-textSecondary border-border'
          }`}
          title={soundEnabled ? 'Matikan Suara Alarm Web' : 'Aktifkan Suara Alarm Web'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5 text-textSecondary" />}
        </button>

        {/* Quick Mode Toggle (Auto / Manual) */}
        <button
          onClick={onToggleAutoMode}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm ${
            autoMode 
              ? 'bg-primary text-surface border-primary' 
              : 'bg-amber-500 text-surface border-amber-600'
          }`}
          title="Klik untuk beralih mode kontrol kipas"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Mode: {autoMode ? 'Otomatis' : 'Manual'}</span>
        </button>

        {/* Source Mode Selector (Demo vs ESP32) */}
        <div className="flex items-center bg-background p-1 rounded-xl border border-border shadow-inner">
          <button
            onClick={() => setIsDemoMode(true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isDemoMode 
                ? 'bg-white shadow-sm text-primary font-bold' 
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => setIsDemoMode(false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              !isDemoMode 
                ? 'bg-white shadow-sm text-primary font-bold' 
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success animate-ping' : 'bg-error'}`} />
            ESP32 Mode
          </button>
        </div>

      </div>
    </header>
  );
}
