import React from 'react';
import { 
  Thermometer, Droplets, Sun, Fan, Bell, Lock, Unlock, 
  ArrowUpRight, AlertTriangle, ShieldCheck, Power, Activity 
} from 'lucide-react';
import { 
  LineChart, Line, ResponsiveContainer, XAxis, Tooltip 
} from 'recharts';
import SiloVisualizer from '../SiloVisualizer';

export default function OverviewTab({
  sensorData,
  storageHealth,
  lastUpdate,
  maxTemp,
  maxHum,
  autoMode,
  isDemoMode,
  chartData,
  onToggleFan,
  onToggleLid,
  onToggleAutoMode
}) {
  const isOverheating = sensorData.temperature >= maxTemp;
  const isHumid = sensorData.humidity >= maxHum;
  const isLidOpen = sensorData.lid === 'OPEN';

  return (
    <div className="space-y-6">
      
      {/* Storage Health Alert Banner */}
      <div className={`p-6 rounded-2xl border shadow-sm ${storageHealth.bg} ${storageHealth.border} flex flex-wrap justify-between items-center gap-4 transition-colors duration-500`}>
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${storageHealth.badge} shadow-md`}>
            {storageHealth.label === 'Kondisi Optimal' ? (
              <ShieldCheck className="w-7 h-7 text-white" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2">
              Status Penyimpanan: <span className={storageHealth.color}>{storageHealth.label}</span>
            </h3>
            <p className="text-xs text-textSecondary mt-0.5 max-w-xl">
              {storageHealth.label === 'Kondisi Optimal' 
                ? 'Suhu, kelembapan, dan penutup wadah berada pada batas aman penyimpanan gabah berkualitas tinggi.'
                : 'Terdeteksi kondisi lingkungan di luar batas toleransi ideal. Sistem otomasi telah mengaktifkan kipas/alarm pendinginan.'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Pembaruan Terakhir</div>
          <div className="text-sm font-mono font-bold text-textPrimary mt-0.5">{lastUpdate}</div>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Suhu Ruangan */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
                <Thermometer className="w-6 h-6"/>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isOverheating ? 'bg-error/15 text-error animate-pulse' : 'bg-success/15 text-success'
              }`}>
                {isOverheating ? 'Di Atas Ambang' : 'Normal'}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Suhu Silo</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-3xl font-extrabold text-textPrimary font-mono">
                  {sensorData.temperature.toFixed(1)}
                </h4>
                <span className="text-lg text-textSecondary font-medium">°C</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between text-xs text-textSecondary mb-1.5 font-medium">
              <span>Batas Max: {maxTemp}°C</span>
              <span className={isOverheating ? 'text-error font-bold' : 'text-success'}>
                {sensorData.temperature >= maxTemp 
                  ? `+${(sensorData.temperature - maxTemp).toFixed(1)}°C` 
                  : `${(maxTemp - sensorData.temperature).toFixed(1)}°C di bawah`}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isOverheating ? 'bg-error' : 'bg-orange-400'}`}
                style={{ width: `${Math.min(100, Math.max(10, (sensorData.temperature / 40) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Kelembapan Udara */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                <Droplets className="w-6 h-6"/>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isHumid ? 'bg-error/15 text-error' : 'bg-success/15 text-success'
              }`}>
                {isHumid ? 'Lembap Berlebih' : 'Ideal'}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Kelembapan Udara (RH)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-3xl font-extrabold text-textPrimary font-mono">
                  {sensorData.humidity.toFixed(1)}
                </h4>
                <span className="text-lg text-textSecondary font-medium">%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex justify-between text-xs text-textSecondary mb-1.5 font-medium">
              <span>Batas Max: {maxHum}%</span>
              <span>{isHumid ? 'Resiko Jamur' : 'Biji Kering'}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isHumid ? 'bg-error' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, sensorData.humidity)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Sensor Cahaya & Tutup Wadah (LDR) */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shadow-sm">
                <Sun className="w-6 h-6"/>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                isLidOpen ? 'bg-error/15 text-error font-bold' : 'bg-success/15 text-success'
              }`}>
                {isLidOpen ? <Unlock className="w-3.5 h-3.5"/> : <Lock className="w-3.5 h-3.5"/>}
                {isLidOpen ? 'Terbuka' : 'Tertutup'}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider">Nilai Cahaya LDR</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-3xl font-extrabold text-textPrimary font-mono">
                  {sensorData.light}
                </h4>
                <span className="text-lg text-textSecondary font-medium">ADC</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-textSecondary font-medium">
            <span>Buka &le; 244 | Tutup &ge; 248</span>
            {isDemoMode && (
              <button
                onClick={onToggleLid}
                className="text-primary hover:underline font-bold text-[11px] cursor-pointer"
              >
                Uji Buka/Tutup
              </button>
            )}
          </div>
        </div>

        {/* Card 4: Aktuator (Kipas DC & Buzzer) */}
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2.5 rounded-xl ${sensorData.fan ? 'bg-primary text-surface shadow' : 'bg-slate-100 text-textSecondary'}`}>
                  <Fan className={`w-5 h-5 ${sensorData.fan ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-textPrimary">Kipas DC 5V</h5>
                  <span className="text-[11px] text-textSecondary">Relay GPIO 27</span>
                </div>
              </div>

              {/* Interactive Quick Fan Switch */}
              <button
                onClick={onToggleFan}
                disabled={autoMode}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                  autoMode 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : (sensorData.fan 
                        ? 'bg-primary text-white hover:bg-secondary' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300')
                }`}
                title={autoMode ? 'Ubah ke mode manual terlebih dahulu untuk mengontrol kipas' : 'Tekan untuk ON/OFF'}
              >
                <Power className="w-3 h-3" />
                {sensorData.fan ? 'MATIKAN' : 'NYALAKAN'}
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-y border-border/80">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${sensorData.alarm ? 'bg-error text-white' : 'bg-slate-100 text-textSecondary'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-textPrimary">Alarm Buzzer</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sensorData.alarm ? 'bg-error/15 text-error animate-pulse' : 'bg-slate-100 text-textSecondary'}`}>
                {sensorData.alarm ? 'ON (1 kHz)' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center text-xs">
            <span className="text-textSecondary font-medium">Mode Kontrol</span>
            <button
              onClick={onToggleAutoMode}
              className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                autoMode ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              {autoMode ? 'Otomatis (Suhu/LDR)' : 'Manual Override'}
            </button>
          </div>
        </div>

      </div>

      {/* Row 2: Silo Visualization & Recent Sparkline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Silo Visualizer Component */}
        <div className="lg:col-span-7 flex">
          <div className="w-full">
            <SiloVisualizer 
              sensorData={sensorData}
              maxTemp={maxTemp}
              isDemoMode={isDemoMode}
              onToggleLid={onToggleLid}
            />
          </div>
        </div>

        {/* Quick Trend Mini Chart */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-base font-bold text-textPrimary">Tren Terkini (Real-time)</h4>
                <p className="text-xs text-textSecondary">Fluktuasi suhu & kelembapan 10 sampel terakhir</p>
              </div>
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.slice(-10)}>
                  <XAxis dataKey="time" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="temperature" name="Suhu (°C)" stroke="#D99B42" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="humidity" name="Kelembapan (%)" stroke="#4C9A69" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Suhu
              </span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Kelembapan
              </span>
            </div>
            <span className="text-textSecondary text-[11px] font-mono">Sampling: 2s</span>
          </div>
        </div>

      </div>

    </div>
  );
}
