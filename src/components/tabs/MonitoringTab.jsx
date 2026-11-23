import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { 
  Play, Pause, Download, Trash2, Filter, Activity, TrendingUp, TrendingDown 
} from 'lucide-react';
import { exportToCsv, exportToJson } from '../../utils/exportCsv';

export default function MonitoringTab({
  chartData,
  maxTemp,
  maxHum,
  isLivePaused,
  onToggleLivePause,
  onClearChartData
}) {
  const [selectedMetric, setSelectedMetric] = useState('all'); // 'all', 'temp', 'hum'
  const [chartType, setChartType] = useState('area'); // 'line' | 'area'

  // Summary statistics computation
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { minT: 0, maxT: 0, avgT: 0, minH: 0, maxH: 0, avgH: 0, count: 0 };
    }

    const temps = chartData.map(d => Number(d.temperature) || 0);
    const hums = chartData.map(d => Number(d.humidity) || 0);

    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const avgT = +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);

    const minH = Math.min(...hums);
    const maxH = Math.max(...hums);
    const avgH = +(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1);

    return { minT, maxT, avgT, minH, maxH, avgH, count: chartData.length };
  }, [chartData]);

  const handleExportCsv = () => {
    exportToCsv(chartData, `grainguard-monitoring-${Date.now()}.csv`);
  };

  const handleExportJson = () => {
    exportToJson(chartData, `grainguard-monitoring-${Date.now()}.json`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">Suhu Terendah</span>
          <div className="text-xl font-bold font-mono text-textPrimary mt-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            {stats.minT.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">Suhu Tertinggi</span>
          <div className="text-xl font-bold font-mono text-textPrimary mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            {stats.maxT.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">Rata-rata Suhu</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">
            {stats.avgT.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">RH Terendah</span>
          <div className="text-xl font-bold font-mono text-textPrimary mt-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            {stats.minH.toFixed(1)}%
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">RH Tertinggi</span>
          <div className="text-xl font-bold font-mono text-textPrimary mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            {stats.maxH.toFixed(1)}%
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
          <span className="text-[11px] font-semibold text-textSecondary uppercase">Sampel Aktif</span>
          <div className="text-xl font-bold font-mono text-primary mt-1 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            {stats.count} titik
          </div>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
        
        {/* Controls and Filter Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-border">
          
          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border">
            <button
              onClick={() => setSelectedMetric('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'all' ? 'bg-white shadow-sm text-primary font-bold' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Semua (Suhu & RH)
            </button>
            <button
              onClick={() => setSelectedMetric('temp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'temp' ? 'bg-white shadow-sm text-orange-600 font-bold' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Hanya Suhu (°C)
            </button>
            <button
              onClick={() => setSelectedMetric('hum')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedMetric === 'hum' ? 'bg-white shadow-sm text-emerald-600 font-bold' : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Hanya Kelembapan (%)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            
            <button
              onClick={onToggleLivePause}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors ${
                isLivePaused 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-white text-textPrimary hover:bg-slate-50 border-border'
              }`}
            >
              {isLivePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isLivePaused ? 'Lanjutkan Stream' : 'Jeda Stream'}
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-primary text-surface rounded-lg text-xs font-semibold hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Unduh data dalam format CSV untuk Excel atau Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>

            <button
              onClick={onClearChartData}
              className="p-1.5 bg-background hover:bg-red-50 text-textSecondary hover:text-error border border-border rounded-lg transition-colors cursor-pointer"
              title="Bersihkan buffer grafik"
            >
              <Trash2 className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Dynamic Chart Container */}
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D99B42" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#D99B42" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4C9A69" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4C9A69" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EBE5" />
              
              <XAxis 
                dataKey="time" 
                stroke="#7C8980" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              
              {/* Left Y-Axis for Temperature */}
              {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                <YAxis 
                  yAxisId="tempAxis" 
                  domain={[15, 45]}
                  stroke="#D99B42" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  unit="°C"
                />
              )}

              {/* Right Y-Axis for Humidity */}
              {(selectedMetric === 'all' || selectedMetric === 'hum') && (
                <YAxis 
                  yAxisId="humAxis" 
                  orientation="right" 
                  domain={[30, 100]}
                  stroke="#4C9A69" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  unit="%"
                />
              )}

              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 8px 16px -4px rgba(0,0,0,0.12)',
                  fontSize: '12px' 
                }} 
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />

              {/* Dynamic Threshold Dashed Lines */}
              {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                <ReferenceLine 
                  yAxisId="tempAxis" 
                  y={maxTemp} 
                  stroke="#C65A4D" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ value: `Max Temp (${maxTemp}°C)`, fill: '#C65A4D', fontSize: 11, position: 'insideTopLeft' }} 
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'hum') && (
                <ReferenceLine 
                  yAxisId="humAxis" 
                  y={maxHum} 
                  stroke="#2563EB" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.5}
                  label={{ value: `Max RH (${maxHum}%)`, fill: '#2563EB', fontSize: 11, position: 'insideTopRight' }} 
                />
              )}

              {/* Temperature Area Line */}
              {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                <Area 
                  yAxisId="tempAxis" 
                  type="monotone" 
                  dataKey="temperature" 
                  name="Suhu (°C)" 
                  stroke="#D99B42" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#tempGradient)" 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }} 
                />
              )}

              {/* Humidity Area Line */}
              {(selectedMetric === 'all' || selectedMetric === 'hum') && (
                <Area 
                  yAxisId="humAxis" 
                  type="monotone" 
                  dataKey="humidity" 
                  name="Kelembapan (%)" 
                  stroke="#4C9A69" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#humGradient)" 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }} 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs text-textSecondary">
          <span>Garis putus-putus menunjukkan ambang batas maksimum alarm histeresis.</span>
          <span className="font-mono text-[11px]">Interval: 2000 ms</span>
        </div>

      </div>

    </div>
  );
}
