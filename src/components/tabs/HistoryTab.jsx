import React, { useState, useMemo } from 'react';
import { 
  Bell, Activity, AlertTriangle, CheckCheck, Trash2, 
  Download, Search, Filter, ShieldAlert 
} from 'lucide-react';
import { exportToCsv, exportToJson } from '../../utils/exportCsv';

export default function HistoryTab({
  alerts,
  onMarkAllAlertsRead,
  onClearAlerts
}) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'warning', 'normal'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchType = filterType === 'all' || a.type === filterType;
      const matchSearch = a.msg.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.time.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [alerts, filterType, searchQuery]);

  const handleExportCsv = () => {
    exportToCsv(alerts.map(a => ({
      time: a.time,
      type: a.type,
      message: a.msg,
      read: a.read ? 'YES' : 'NO'
    })), `grainguard-alerts-${Date.now()}.csv`);
  };

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-lg font-bold text-textPrimary">Log Notifikasi & Riwayat Peristiwa</h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Daftar otomatis setiap kali parameter melampaui batas atau tutup silo dibuka
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onMarkAllAlertsRead}
            disabled={alerts.length === 0}
            className="px-3 py-1.5 bg-background hover:bg-slate-100 text-textPrimary border border-border rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5 text-success" />
            Tandai Dibaca
          </button>

          <button
            onClick={handleExportCsv}
            disabled={alerts.length === 0}
            className="px-3 py-1.5 bg-primary text-surface rounded-lg text-xs font-semibold hover:bg-secondary transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>

          <button
            onClick={onClearAlerts}
            disabled={alerts.length === 0}
            className="p-1.5 bg-background hover:bg-red-50 text-textSecondary hover:text-error border border-border rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Hapus semua riwayat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-white shadow-sm text-primary font-bold' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Semua ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'warning' ? 'bg-white shadow-sm text-warning font-bold' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Peringatan ({alerts.filter(a => a.type === 'warning').length})
          </button>
          <button
            onClick={() => setFilterType('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'normal' ? 'bg-white shadow-sm text-success font-bold' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Informasi ({alerts.filter(a => a.type === 'normal').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci atau jam..."
            className="w-full pl-9 pr-4 py-1.5 bg-background rounded-lg border border-border text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-textSecondary border border-dashed border-border rounded-xl">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Tidak ada catatan notifikasi.</p>
            <p className="text-xs text-textSecondary/70 mt-0.5">Sistem berjalan dengan aman dan lancar.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-200 ${
                alert.type === 'warning'
                  ? 'border-warning/30 bg-warning/5 hover:bg-warning/10'
                  : 'border-success/30 bg-success/5 hover:bg-success/10'
              } ${!alert.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className={`p-2 rounded-full mt-0.5 shadow-sm ${
                alert.type === 'warning' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
              }`}>
                {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4"/> : <Activity className="w-4 h-4"/>}
              </div>

              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-textPrimary text-sm">
                    {alert.type === 'warning' ? 'Peringatan Lingkungan' : 'Informasi Sistem'}
                  </h4>
                  {!alert.read && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary text-white font-bold">
                      Baru
                    </span>
                  )}
                </div>
                <p className="text-textSecondary mt-1 leading-relaxed text-xs">{alert.msg}</p>
              </div>

              <span className="text-xs font-mono font-medium text-textSecondary bg-background px-2.5 py-1 rounded-md border border-border flex-shrink-0">
                {alert.time}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
