import React, { useState, useEffect } from 'react';
import { 
  Thermometer, Droplets, Sun, Fan, Bell, Activity, 
  Settings, History, Cpu, LayoutDashboard 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Online');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('id-ID'));
  
  // Settings State
  const [maxTemp, setMaxTemp] = useState(30);
  const [maxHum, setMaxHum] = useState(75);
  const [espAddress, setEspAddress] = useState('http://192.168.4.1');
  const [autoMode, setAutoMode] = useState(true);

  // Sensor State
  const [sensorData, setSensorData] = useState({
    temperature: 28.4,
    humidity: 68,
    light: 1240,
    fan: false,
    alarm: false
  });
  
  // Chart Data State
  const [chartData, setChartData] = useState([
    { time: '10:00', temperature: 27.5, humidity: 65 },
    { time: '10:10', temperature: 28.0, humidity: 66 },
    { time: '10:20', temperature: 28.2, humidity: 67 },
    { time: '10:30', temperature: 29.1, humidity: 70 },
    { time: '10:40', temperature: 28.5, humidity: 68 },
    { time: '10:50', temperature: 28.4, humidity: 68 },
  ]);

  // Notifications State
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', msg: 'Suhu penyimpanan mendekati batas maksimum.', time: '10:30', read: false },
    { id: 2, type: 'normal', msg: 'Kondisi penyimpanan kembali normal.', time: '10:45', read: false }
  ]);

  useEffect(() => {
    let interval;
    if (isDemoMode) {
      setConnectionStatus('Online (Demo)');
      interval = setInterval(() => {
        const newTemp = +(27 + Math.random() * 5).toFixed(1);
        const newHum = +(60 + Math.random() * 20).toFixed(1);
        const newLight = Math.floor(800 + Math.random() * 1000);
        
        let newFan = sensorData.fan;
        let newAlarm = sensorData.alarm;

        if (autoMode) {
          if (newTemp >= maxTemp || newHum >= maxHum) {
            newFan = true;
            newAlarm = true;
          } else {
            newFan = false;
            newAlarm = false;
          }
        }

        setSensorData({ temperature: newTemp, humidity: newHum, light: newLight, fan: newFan, alarm: newAlarm });
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        setLastUpdate(now.toLocaleTimeString('id-ID'));
        
        setChartData(prev => {
          const updated = [...prev, { time: timeStr, temperature: newTemp, humidity: newHum }];
          return updated.slice(-10);
        });

      }, 3000);
    } else {
      setConnectionStatus('Connecting...');
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${espAddress}/data`);
          if (response.ok) {
            const data = await response.json();
            setSensorData(data);
            setConnectionStatus('Online (ESP32)');
            setLastUpdate(new Date().toLocaleTimeString('id-ID'));
          } else {
            setConnectionStatus('Error (ESP32)');
          }
        } catch (error) {
          setConnectionStatus('Offline (ESP32 Unreachable)');
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isDemoMode, autoMode, maxTemp, maxHum, espAddress, sensorData.fan, sensorData.alarm]);

  const toggleFan = async () => {
    if (autoMode) {
      alert("Matikan Mode Otomatis di Pengaturan untuk mengontrol kipas secara manual.");
      return;
    }
    
    if (isDemoMode) {
      setSensorData(prev => ({ ...prev, fan: !prev.fan }));
      return;
    }

    try {
      const targetState = !sensorData.fan ? 'on' : 'off';
      const response = await fetch(`${espAddress}/fan?state=${targetState}`, { method: 'POST' });
      if (response.ok) {
        setSensorData(prev => ({ ...prev, fan: !prev.fan }));
      } else {
        alert("Gagal mengontrol kipas. Pastikan firmware mendukung endpoint ini.");
      }
    } catch (e) {
      alert("Koneksi ke ESP32 terputus.");
    }
  };

  const getStorageStatus = () => {
    if (sensorData.temperature >= maxTemp && sensorData.humidity >= maxHum) return { label: 'Kondisi Kritis', color: 'text-error', bg: 'bg-error/10' };
    if (sensorData.temperature >= maxTemp || sensorData.humidity >= maxHum) return { label: 'Perlu Perhatian', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Kondisi Baik', color: 'text-success', bg: 'bg-success/10' };
  };

  const status = getStorageStatus();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="w-64 bg-primary text-surface flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <Activity className="w-8 h-8 text-tertiary" />
          <h1 className="text-xl font-bold tracking-wide">GrainGuard</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'monitoring', icon: Activity, label: 'Monitoring' },
            { id: 'device', icon: Cpu, label: 'Perangkat' },
            { id: 'history', icon: History, label: 'Riwayat & Alert' },
            { id: 'settings', icon: Settings, label: 'Pengaturan' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-secondary font-medium shadow-md' : 'hover:bg-secondary/50 text-surface/80 hover:text-surface'}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-secondary/50 text-sm text-surface/70">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.includes('Online') ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="truncate">{connectionStatus}</span>
          </div>
          <p>v1.0.0-prototype</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="bg-surface px-8 py-5 shadow-sm border-b border-border flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary capitalize">{activeTab.replace('-', ' ')}</h2>
            <p className="text-sm text-textSecondary mt-1">Sistem Pemantauan Ruang Penyimpanan Hasil Panen</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-background p-1.5 rounded-lg border border-border">
              <button 
                onClick={() => setIsDemoMode(true)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isDemoMode ? 'bg-white shadow-sm text-primary' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                Demo Mode
              </button>
              <button 
                onClick={() => setIsDemoMode(false)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${!isDemoMode ? 'bg-white shadow-sm text-primary' : 'text-textSecondary hover:text-textPrimary'}`}
              >
                ESP32 Mode
              </button>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border border-border ${status.bg} flex justify-between items-center transition-colors duration-500`}>
                <div>
                  <h3 className="text-lg font-medium text-textPrimary">Selamat datang di GrainGuard</h3>
                  <p className="text-textSecondary mt-1">Pantau kondisi ruang penyimpanan hasil panen dalam satu dashboard.</p>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${status.color}`}>{status.label}</div>
                  <div className="text-sm text-textSecondary mt-1">Update: {lastUpdate}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Thermometer className="w-6 h-6"/></div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sensorData.temperature >= maxTemp ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                      {sensorData.temperature >= maxTemp ? 'Warning' : 'Normal'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-textSecondary text-sm font-medium">Suhu Ruangan</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-bold text-textPrimary">{sensorData.temperature.toFixed(1)}</h4>
                      <span className="text-lg text-textSecondary">°C</span>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">Batas Max: {maxTemp}°C</p>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Droplets className="w-6 h-6"/></div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sensorData.humidity >= maxHum ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                      {sensorData.humidity >= maxHum ? 'Warning' : 'Normal'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-textSecondary text-sm font-medium">Kelembapan Udara</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-bold text-textPrimary">{sensorData.humidity.toFixed(1)}</h4>
                      <span className="text-lg text-textSecondary">%</span>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">Batas Max: {maxHum}%</p>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl"><Sun className="w-6 h-6"/></div>
                  </div>
                  <div className="mt-4">
                    <p className="text-textSecondary text-sm font-medium">Intensitas Cahaya</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <h4 className="text-3xl font-bold text-textPrimary">{sensorData.light}</h4>
                      <span className="text-lg text-textSecondary">ADC</span>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">0 - 4095 (Relatif)</p>
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sensorData.fan ? 'bg-primary text-surface' : 'bg-background text-textSecondary'}`}><Fan className={`w-5 h-5 ${sensorData.fan ? 'animate-spin' : ''}`}/></div>
                        <span className="font-medium text-textPrimary text-sm">DC Fan</span>
                      </div>
                      <span className={`text-sm font-bold ${sensorData.fan ? 'text-primary' : 'text-textSecondary'}`}>{sensorData.fan ? 'ON' : 'OFF'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${sensorData.alarm ? 'bg-error text-surface' : 'bg-background text-textSecondary'}`}><Bell className="w-5 h-5"/></div>
                        <span className="font-medium text-textPrimary text-sm">Buzzer</span>
                      </div>
                      <span className={`text-sm font-bold ${sensorData.alarm ? 'text-error' : 'text-textSecondary'}`}>{sensorData.alarm ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                     <span className="text-xs text-textSecondary">Mode Kontrol</span>
                     <span className="text-xs font-semibold px-2 py-1 bg-background rounded text-primary">{autoMode ? 'Otomatis' : 'Manual'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-textPrimary">Grafik Pemantauan Real-time</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-background text-textSecondary text-xs rounded-full border border-border">1 Jam</span>
                  <span className="px-3 py-1 bg-primary text-surface text-xs rounded-full shadow-sm">Real-time</span>
                </div>
              </div>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EBE5" />
                    <XAxis dataKey="time" stroke="#7C8980" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#D99B42" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#4C9A69" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Suhu (°C)" stroke="#D99B42" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="humidity" name="Kelembapan (%)" stroke="#4C9A69" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'device' && (
            <div className="space-y-6">
              <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border text-sm text-textSecondary">
                      <th className="p-4 font-medium">Perangkat / Komponen</th>
                      <th className="p-4 font-medium">GPIO (Pin)</th>
                      <th className="p-4 font-medium">Status / Pembacaan</th>
                      <th className="p-4 font-medium">Koneksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-textPrimary divide-y divide-border">
                    <tr className="hover:bg-background/50">
                      <td className="p-4 font-medium flex items-center gap-2"><Cpu className="w-4 h-4 text-primary"/> ESP32 DevKit V1</td>
                      <td className="p-4">-</td>
                      <td className="p-4">Microcontroller Controller</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${connectionStatus.includes('Online') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{connectionStatus}</span></td>
                    </tr>
                    <tr className="hover:bg-background/50">
                      <td className="p-4 flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-500"/> Sensor DHT11</td>
                      <td className="p-4 font-mono">GPIO 4</td>
                      <td className="p-4">{sensorData.temperature.toFixed(1)}°C / {sensorData.humidity.toFixed(1)}%</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Active</span></td>
                    </tr>
                    <tr className="hover:bg-background/50">
                      <td className="p-4 flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-500"/> Sensor LDR</td>
                      <td className="p-4 font-mono">GPIO 34</td>
                      <td className="p-4">{sensorData.light} ADC</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Active</span></td>
                    </tr>
                    <tr className="hover:bg-background/50">
                      <td className="p-4 flex items-center gap-2"><Fan className={`w-4 h-4 text-primary ${sensorData.fan ? 'animate-spin' : ''}`}/> DC Fan 5V</td>
                      <td className="p-4 font-mono">GPIO 25</td>
                      <td className="p-4 font-bold">{sensorData.fan ? 'ON (Blowing)' : 'OFF'}</td>
                      <td className="p-4">
                         <button onClick={toggleFan} className="px-3 py-1.5 bg-primary text-surface rounded-md text-xs hover:bg-secondary transition-colors" disabled={autoMode}>
                           {sensorData.fan ? 'Turn OFF' : 'Turn ON'}
                         </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-background/50">
                      <td className="p-4 flex items-center gap-2"><Bell className="w-4 h-4 text-error"/> Buzzer Alarm</td>
                      <td className="p-4 font-mono">GPIO 26</td>
                      <td className="p-4 font-bold text-error">{sensorData.alarm ? 'ON (Sounding)' : 'OFF'}</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-full text-xs font-medium bg-background text-textSecondary">Auto-controlled</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-textPrimary mb-6">Riwayat Notifikasi & Peringatan</h3>
              <div className="space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-4 ${alert.type === 'warning' ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'}`}>
                    <div className={`p-2 rounded-full mt-1 ${alert.type === 'warning' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                      {alert.type === 'warning' ? <Bell className="w-5 h-5"/> : <Activity className="w-5 h-5"/>}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-textPrimary">{alert.type === 'warning' ? 'Peringatan Sistem' : 'Informasi Sistem'}</h4>
                      <p className="text-sm text-textSecondary mt-1">{alert.msg}</p>
                    </div>
                    <span className="text-xs font-medium text-textSecondary bg-background px-2 py-1 rounded-md border border-border">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-surface p-8 rounded-2xl shadow-sm border border-border">
              <h3 className="text-lg font-bold text-textPrimary mb-6">Konfigurasi Sistem</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-textPrimary mb-3 border-b border-border pb-2">Ambang Batas Lingkungan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-textSecondary mb-1">Max Temperature (°C)</label>
                      <input 
                        type="number" 
                        value={maxTemp} 
                        onChange={(e) => setMaxTemp(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-textSecondary mb-1">Max Humidity (%)</label>
                      <input 
                        type="number" 
                        value={maxHum} 
                        onChange={(e) => setMaxHum(Number(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-textPrimary mb-3 border-b border-border pb-2">Kontrol Aktuator</h4>
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">Mode Otomatis</p>
                      <p className="text-xs text-textSecondary mt-0.5">Kipas dan alarm aktif sesuai ambang batas.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={autoMode} onChange={() => setAutoMode(!autoMode)} />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-textPrimary mb-3 border-b border-border pb-2">Koneksi ESP32</h4>
                  <div>
                    <label className="block text-xs text-textSecondary mb-1">IP Address / URL Endpoint</label>
                    <input 
                      type="text" 
                      value={espAddress} 
                      onChange={(e) => setEspAddress(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-mono"
                    />
                    <p className="text-xs text-textSecondary mt-2">Ganti URL ini sesuai dengan IP yang didapat ESP32 di jaringan Wi-Fi lokal.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}