import React from 'react';
import { 
  Activity, LayoutDashboard, Cpu, History, Settings, 
  Wifi, ShieldCheck, Zap
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  connectionStatus, 
  pingLatency,
  espAddress,
  isDemoMode 
}) {
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'monitoring', icon: Activity, label: 'Monitoring Grafik' },
    { id: 'device', icon: Cpu, label: 'Perangkat & Skema' },
    { id: 'history', icon: History, label: 'Riwayat & Alert' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' }
  ];

  const isOnline = connectionStatus.includes('Online');

  return (
    <div className="w-64 bg-primary text-surface flex flex-col shadow-2xl z-20 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-secondary/40">
        <div className="p-2.5 bg-secondary/80 rounded-xl shadow-inner text-tertiary">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">GrainGuard</h1>
          <p className="text-[11px] text-surface/60 font-medium">Smart Grain Silo Monitor</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer ${
                isActive
                  ? 'bg-secondary text-surface font-semibold shadow-md translate-x-1'
                  : 'text-surface/75 hover:bg-secondary/40 hover:text-surface'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-tertiary' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Hardware Connection Card */}
      <div className="p-5 mx-4 mb-5 rounded-2xl bg-secondary/30 border border-secondary/40 text-xs text-surface/80">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-surface flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-tertiary" /> Node IoT
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isOnline ? 'bg-success/20 text-green-300' : 'bg-error/20 text-red-300'
          }`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="space-y-1 text-[11px] text-surface/70">
          <div className="flex justify-between items-center">
            <span>Mode:</span>
            <span className="font-mono text-tertiary font-semibold">{isDemoMode ? 'Simulasi (Demo)' : 'Fisik ESP32'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Latency:</span>
            <span className="font-mono text-surface font-semibold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-yellow-300" />
              {pingLatency ? `${pingLatency} ms` : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center truncate">
            <span>IP:</span>
            <span className="font-mono text-[10px] text-surface/90 truncate max-w-[110px]" title={espAddress}>
              {isDemoMode ? 'localhost' : espAddress.replace('http://', '')}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="px-6 py-4 border-t border-secondary/30 flex justify-between items-center text-[11px] text-surface/50">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-tertiary" /> v1.2 Interactive
        </span>
        <span>GrainGuard IoT</span>
      </div>
    </div>
  );
}
