import React, { useEffect } from 'react';
import { wsClient } from './services/websocket';
import { useTrafficStore } from './store/trafficStore';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MapCenter } from './components/MapCenter';
import { NotificationPanel } from './components/NotificationPanel';
import { BottomControlBar } from './components/BottomControlBar';

import { FaultsView } from './components/views/FaultsView';
import { ControlView } from './components/views/ControlView';
import { ConfigurationView } from './components/views/ConfigurationView';
import { AutomationView } from './components/views/AutomationView';
import { SystemView } from './components/views/SystemView';
import { HelpView } from './components/views/HelpView';

import { ComparisonModal } from './components/ComparisonModal';
import { EventInjectionModal } from './components/EventInjectionModal';
import { RoadDetailModal } from './components/modals/RoadDetailModal';
import { VehicleDetailModal } from './components/modals/VehicleDetailModal';
import './styles/dashboard.css';

export const App: React.FC = () => {
  const activeNavTab = useTrafficStore((s) => s.activeNavTab);

  useEffect(() => {
    // Connect to WebSocket /ws/traffic on mount
    wsClient.connect();
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'monitor':
        return (
          <>
            <MapCenter />
            <NotificationPanel />
          </>
        );
      case 'faults':
        return <FaultsView />;
      case 'control':
        return <ControlView />;
      case 'configuration':
        return <ConfigurationView />;
      case 'automation':
        return <AutomationView />;
      case 'system':
        return <SystemView />;
      case 'help':
        return <HelpView />;
      default:
        return (
          <>
            <MapCenter />
            <NotificationPanel />
          </>
        );
    }
  };

  return (
    <div className="app-container">
      {/* 1. Top Navigation & Status Bar */}
      <TopBar />

      {/* 2. Main Workspace Layout */}
      <div className="main-layout">
        {/* Left Vertical Navigation Sidebar */}
        <Sidebar />

        {/* Center Main Screen & Panels */}
        {renderActiveView()}
      </div>

      {/* 3. Bottom Simulation Controls */}
      <BottomControlBar />

      {/* Interactive Overlays & Modals */}
      <ComparisonModal />
      <EventInjectionModal />
      <RoadDetailModal />
      <VehicleDetailModal />
    </div>
  );
};

export default App;
