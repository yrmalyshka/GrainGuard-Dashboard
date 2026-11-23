import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import OverviewTab from './components/tabs/OverviewTab';
import MonitoringTab from './components/tabs/MonitoringTab';
import DeviceTab from './components/tabs/DeviceTab';
import HistoryTab from './components/tabs/HistoryTab';
import SettingsTab from './components/tabs/SettingsTab';

import { useSensorStream } from './hooks/useSensorStream';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const {
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
    storageHealth,
    toggleFan,
    handleToggleAutoMode,
    toggleSimulatedLid,
    toggleLivePause,
    clearChartData,
    markAllAlertsRead,
    clearAlerts,
    testEspConnection,
    dismissToast
  } = useSensorStream();

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-textPrimary">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        pingLatency={pingLatency}
        espAddress={espAddress}
        isDemoMode={isDemoMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Interactive Header */}
        <Header
          activeTab={activeTab}
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
          autoMode={autoMode}
          onToggleAutoMode={handleToggleAutoMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          isLivePaused={isLivePaused}
          onToggleLivePause={toggleLivePause}
          connectionStatus={connectionStatus}
          pingLatency={pingLatency}
          lastUpdate={lastUpdate}
        />

        {/* Dynamic Tab Views */}
        <main className="p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'overview' && (
            <OverviewTab
              sensorData={sensorData}
              storageHealth={storageHealth}
              lastUpdate={lastUpdate}
              maxTemp={maxTemp}
              maxHum={maxHum}
              autoMode={autoMode}
              isDemoMode={isDemoMode}
              chartData={chartData}
              onToggleFan={toggleFan}
              onToggleLid={toggleSimulatedLid}
              onToggleAutoMode={handleToggleAutoMode}
            />
          )}

          {activeTab === 'monitoring' && (
            <MonitoringTab
              chartData={chartData}
              maxTemp={maxTemp}
              maxHum={maxHum}
              isLivePaused={isLivePaused}
              onToggleLivePause={toggleLivePause}
              onClearChartData={clearChartData}
            />
          )}

          {activeTab === 'device' && (
            <DeviceTab
              sensorData={sensorData}
              connectionStatus={connectionStatus}
              pingLatency={pingLatency}
              espAddress={espAddress}
              isDemoMode={isDemoMode}
              autoMode={autoMode}
              onToggleFan={toggleFan}
              onTestEspConnection={testEspConnection}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              alerts={alerts}
              onMarkAllAlertsRead={markAllAlertsRead}
              onClearAlerts={clearAlerts}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              maxTemp={maxTemp}
              setMaxTemp={setMaxTemp}
              maxHum={maxHum}
              setMaxHum={setMaxHum}
              autoMode={autoMode}
              onToggleAutoMode={handleToggleAutoMode}
              espAddress={espAddress}
              setEspAddress={setEspAddress}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              onTestEspConnection={testEspConnection}
            />
          )}
        </main>
      </div>

      {/* Floating Interactive Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
