import { useState, useEffect, useRef, useCallback } from 'react';
import { espApi } from '../services/espApi';

export function useSensorStream() {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [espAddress, setEspAddress] = useState('http://192.168.4.1');
  const [connectionStatus, setConnectionStatus] = useState('Online (Demo)');
  const [pingLatency, setPingLatency] = useState(12);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('id-ID'));
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Settings State
  const [maxTemp, setMaxTemp] = useState(25.0);
  const [maxHum, setMaxHum] = useState(75.0);
  const [autoMode, setAutoMode] = useState(true);

  // Simulated Lid toggle for Demo Mode
  const [demoLidOverride, setDemoLidOverride] = useState(null); // null = auto, true = open, false = closed

  // Sensor Data State
  const [sensorData, setSensorData] = useState({
    temperature: 24.2,
    humidity: 62.5,
    light: 260,
    fan: false,
    alarm: false,
    lid: 'CLOSED',
    mode: 'AUTO',
    sensorValid: true
  });

  // Chart Data Buffer (stores recent time-series data)
  const [chartData, setChartData] = useState([
    { time: '10:00:00', temperature: 23.5, humidity: 60.0, light: 265, lid: 'CLOSED' },
    { time: '10:00:10', temperature: 23.8, humidity: 60.5, light: 262, lid: 'CLOSED' },
    { time: '10:00:20', temperature: 24.0, humidity: 61.2, light: 260, lid: 'CLOSED' },
    { time: '10:00:30', temperature: 24.4, humidity: 62.0, light: 258, lid: 'CLOSED' },
    { time: '10:00:40', temperature: 24.1, humidity: 61.8, light: 262, lid: 'CLOSED' },
    { time: '10:00:50', temperature: 24.2, humidity: 62.5, light: 260, lid: 'CLOSED' },
  ]);

  // Notifications / Alerts Log
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', msg: 'Suhu penyimpanan mendekati batas maksimal (24.8°C).', time: '10:30', read: false },
    { id: 2, type: 'normal', msg: 'Sistem GrainGuard berjalan normal.', time: '10:00', read: true }
  ]);

  // Transient Toast Popups
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Web Audio subtle beep alert
  const playAlertTone = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio context may be restricted by browser policy before first interaction
    }
  }, [soundEnabled]);

  // Ref to track previous alarm status to trigger toast & sound only on edge
  const prevAlarmRef = useRef(false);
  const prevLidRef = useRef('CLOSED');

  // Main Polling Loop
  useEffect(() => {
    if (isLivePaused) return;

    let interval;

    if (isDemoMode) {
      setConnectionStatus('Online (Demo)');
      interval = setInterval(() => {
        setSensorData(prev => {
          // Subtle realistic walk
          const driftTemp = (Math.random() - 0.48) * 0.4;
          const nextTemp = Math.min(32, Math.max(18, +(prev.temperature + driftTemp).toFixed(1)));

          const driftHum = (Math.random() - 0.48) * 0.8;
          const nextHum = Math.min(90, Math.max(45, +(prev.humidity + driftHum).toFixed(1)));

          // Lid status: controlled by manual click or subtle fluctuation around threshold
          let nextLid = prev.lid;
          let nextLight = prev.light;

          if (demoLidOverride !== null) {
            nextLid = demoLidOverride ? 'OPEN' : 'CLOSED';
            nextLight = demoLidOverride ? 180 + Math.floor(Math.random() * 40) : 260 + Math.floor(Math.random() * 30);
          } else {
            // natural light variance
            nextLight = Math.floor(255 + (Math.random() - 0.5) * 15);
            nextLid = nextLight <= 244 ? 'OPEN' : 'CLOSED';
          }

          let nextFan = prev.fan;
          let nextAlarm = prev.alarm;

          if (autoMode) {
            if (nextTemp >= maxTemp || nextHum >= maxHum || nextLid === 'OPEN') {
              nextFan = nextTemp >= maxTemp;
              nextAlarm = true;
            } else if (nextTemp <= 20.0 && nextHum < maxHum) {
              nextFan = false;
              nextAlarm = false;
            } else {
              // Maintain state within hysteresis
              nextAlarm = nextTemp >= maxTemp;
            }
          }

          const now = new Date();
          const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastUpdate(now.toLocaleTimeString('id-ID'));
          setPingLatency(Math.floor(8 + Math.random() * 10));

          // Append to chart history
          setChartData(cPrev => {
            const updated = [...cPrev, {
              time: timeStr,
              temperature: nextTemp,
              humidity: nextHum,
              light: nextLight,
              lid: nextLid
            }];
            return updated.slice(-25);
          });

          // Edge detection for Alerts
          if (!prevAlarmRef.current && nextAlarm) {
            const reason = nextTemp >= maxTemp 
              ? `Suhu tinggi (${nextTemp}°C >= ${maxTemp}°C)` 
              : (nextLid === 'OPEN' ? 'Tutup wadah terbuka!' : 'Kelembapan melebihi ambang batas');
            
            addToast('Peringatan Penyimpanan!', reason, 'warning');
            playAlertTone();

            setAlerts(aPrev => [{
              id: Date.now(),
              type: 'warning',
              msg: `${reason}. Kipas atau alarm telah diaktifkan otomatis.`,
              time: timeStr.slice(0, 5),
              read: false
            }, ...aPrev.slice(0, 20)]);
          }

          if (prevLidRef.current !== nextLid) {
            if (nextLid === 'OPEN') {
              addToast('Peringatan Tutup Wadah', 'Tutup silo terdeteksi TERBUKA!', 'error');
            } else {
              addToast('Info Tutup Wadah', 'Tutup silo kembali TERTUTUP rapat.', 'info');
            }
            prevLidRef.current = nextLid;
          }

          prevAlarmRef.current = nextAlarm;

          return {
            temperature: nextTemp,
            humidity: nextHum,
            light: nextLight,
            fan: nextFan,
            alarm: nextAlarm,
            lid: nextLid,
            mode: autoMode ? 'AUTO' : (nextFan ? 'MANUAL_ON' : 'MANUAL_OFF'),
            sensorValid: true
          };
        });
      }, 2500);

    } else {
      // Real ESP32 HTTP Polling Mode
      interval = setInterval(async () => {
        const result = await espApi.getSensorData(espAddress);

        if (result.success && result.data) {
          const d = result.data;
          const tempVal = typeof d.temperature === 'number' ? d.temperature : parseFloat(d.temperature) || 0;
          const humVal = typeof d.humidity === 'number' ? d.humidity : parseFloat(d.humidity) || 0;
          const lightVal = typeof d.light === 'number' ? d.light : parseInt(d.light) || 0;
          const fanVal = Boolean(d.fan);
          const alarmVal = Boolean(d.alarm);
          const lidVal = d.lid || (d.lidOpen ? 'OPEN' : 'CLOSED') || (lightVal <= 244 ? 'OPEN' : 'CLOSED');
          const modeVal = d.mode || 'AUTO';

          setConnectionStatus('Online (ESP32)');
          setPingLatency(result.latencyMs);

          const now = new Date();
          const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastUpdate(now.toLocaleTimeString('id-ID'));

          setSensorData({
            temperature: tempVal,
            humidity: humVal,
            light: lightVal,
            fan: fanVal,
            alarm: alarmVal,
            lid: lidVal,
            mode: modeVal,
            sensorValid: d.sensorValid !== undefined ? Boolean(d.sensorValid) : true
          });

          if (modeVal.includes('AUTO') !== autoMode) {
            setAutoMode(modeVal.includes('AUTO'));
          }

          // Realtime chart update
          setChartData(cPrev => {
            const updated = [...cPrev, {
              time: timeStr,
              temperature: tempVal,
              humidity: humVal,
              light: lightVal,
              lid: lidVal
            }];
            return updated.slice(-25);
          });

          // Check alarm trigger
          if (!prevAlarmRef.current && alarmVal) {
            addToast('Alarm Aktif!', `Suhu ${tempVal}°C atau tutup terbuka. Alarm berbunyi.`, 'warning');
            playAlertTone();

            setAlerts(aPrev => [{
              id: Date.now(),
              type: 'warning',
              msg: `Kondisi kritis terdeteksi oleh ESP32 (Suhu: ${tempVal}°C, RH: ${humVal}%).`,
              time: timeStr.slice(0, 5),
              read: false
            }, ...aPrev.slice(0, 20)]);
          }

          if (prevLidRef.current !== lidVal) {
            if (lidVal === 'OPEN') {
              addToast('Peringatan Sensor', 'Tutup silo TERBUKA!', 'error');
            }
            prevLidRef.current = lidVal;
          }

          prevAlarmRef.current = alarmVal;

        } else {
          setConnectionStatus('Offline (ESP32 Unreachable)');
          setPingLatency(null);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [
    isDemoMode, isLivePaused, espAddress, autoMode, maxTemp, maxHum, 
    demoLidOverride, addToast, playAlertTone
  ]);

  // Interactive Action Handlers
  const toggleFan = async () => {
    if (autoMode) {
      addToast('Mode Otomatis Aktif', 'Matikan Mode Otomatis terlebih dahulu untuk mengontrol kipas secara manual.', 'warning');
      return;
    }

    const nextState = !sensorData.fan;

    if (isDemoMode) {
      setSensorData(prev => ({ ...prev, fan: nextState }));
      addToast('Kontrol Kipas', `Kipas berhasil diubah ke: ${nextState ? 'MENYALA (ON)' : 'MATI (OFF)'}`, 'success');
      return;
    }

    const res = await espApi.setFanState(espAddress, nextState ? 'on' : 'off');
    if (res.success) {
      setSensorData(prev => ({ ...prev, fan: nextState }));
      addToast('Kontrol Kipas ESP32', `Kipas fisik berhasil diubah ke: ${nextState ? 'MENYALA' : 'MATI'}`, 'success');
    } else {
      addToast('Gagal Mengontrol Kipas', res.error, 'error');
    }
  };

  const handleToggleAutoMode = async () => {
    const nextMode = !autoMode;
    setAutoMode(nextMode);

    if (isDemoMode) {
      addToast('Mode Sistem', `Beralih ke mode ${nextMode ? 'OTOMATIS (AUTO)' : 'MANUAL'}`, 'info');
      return;
    }

    const res = await espApi.setSystemMode(espAddress, nextMode ? 'auto' : 'manual');
    if (res.success) {
      addToast('Mode Sistem ESP32', `Mode ESP32 beralih ke: ${nextMode ? 'OTOMATIS' : 'MANUAL'}`, 'info');
    } else {
      addToast('Gagal Sinkronisasi Mode', res.error, 'error');
    }
  };

  const toggleSimulatedLid = () => {
    if (!isDemoMode) {
      addToast('Mode Fisik', 'Status tutup pada mode ESP32 dikendalikan oleh sensor cahaya LDR fisik.', 'info');
      return;
    }

    const currentLid = sensorData.lid;
    const nextLidIsOpen = currentLid !== 'OPEN';
    setDemoLidOverride(nextLidIsOpen);

    setSensorData(prev => ({
      ...prev,
      lid: nextLidIsOpen ? 'OPEN' : 'CLOSED',
      light: nextLidIsOpen ? 210 : 275
    }));

    addToast('Simulasi Tutup Silo', `Tutup silo sekarang: ${nextLidIsOpen ? 'TERBUKA (OPEN)' : 'RAPAT (CLOSED)'}`, nextLidIsOpen ? 'warning' : 'success');
  };

  const toggleLivePause = () => {
    setIsLivePaused(prev => {
      const next = !prev;
      addToast('Aliran Data', next ? 'Pembaruan data dijeda.' : 'Pembaruan data dilanjutkan kembali.', 'info');
      return next;
    });
  };

  const clearChartData = () => {
    setChartData([]);
    addToast('Grafik Dibersihkan', 'Riwayat grafik sesi ini telah dikosongkan.', 'info');
  };

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    addToast('Notifikasi', 'Semua riwayat peringatan ditandai sudah dibaca.', 'success');
  };

  const clearAlerts = () => {
    setAlerts([]);
    addToast('Riwayat Notifikasi', 'Semua riwayat telah dihapus.', 'info');
  };

  const testEspConnection = async () => {
    const res = await espApi.ping(espAddress);
    if (res.success) {
      addToast('Uji Koneksi Berhasil!', `ESP32 merespons dalam ${res.latencyMs} ms.`, 'success');
      return { success: true, latency: res.latencyMs };
    } else {
      addToast('Uji Koneksi Gagal', res.error, 'error');
      return { success: false, error: res.error };
    }
  };

  // Overall silo health calculation
  const getStorageHealth = () => {
    const isCritical = sensorData.temperature >= maxTemp && sensorData.humidity >= maxHum;
    const isWarning = sensorData.temperature >= maxTemp || sensorData.humidity >= maxHum || sensorData.lid === 'OPEN';

    if (isCritical) {
      return { label: 'Kondisi Kritis', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30', badge: 'bg-error text-white' };
    }
    if (isWarning) {
      return { label: 'Perlu Perhatian', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', badge: 'bg-warning text-white' };
    }
    return { label: 'Kondisi Optimal', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', badge: 'bg-success text-white' };
  };

  return {
    isDemoMode,
    setIsDemoMode,
    espAddress,
    setEspAddress,
    connectionStatus,
    pingLatency,
    lastUpdate,
    isLivePaused,
    soundEnabled,
    setSoundEnabled,
    maxTemp,
    setMaxTemp,
    maxHum,
    setMaxHum,
    autoMode,
    sensorData,
    chartData,
    alerts,
    toasts,
    storageHealth: getStorageHealth(),
    toggleFan,
    handleToggleAutoMode,
    toggleSimulatedLid,
    toggleLivePause,
    clearChartData,
    markAllAlertsRead,
    clearAlerts,
    testEspConnection,
    dismissToast,
    addToast
  };
}
