import { useTrafficStore } from '../store/trafficStore';
import type { NavTab } from '../store/trafficStore';
import {
  Monitor,
  AlertTriangle,
  Sliders,
  Settings,
  Cpu,
  Server,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const activeNavTab = useTrafficStore((s) => s.activeNavTab);
  const setActiveNavTab = useTrafficStore((s) => s.setActiveNavTab);
  const faults = useTrafficStore((s) => s.faults);

  const activeFaultsCount = faults.filter((f) => f.status === 'ACTIVE').length;

  const tabs: { key: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'monitor', label: 'Monitor', icon: <Monitor size={17} /> },
    { key: 'faults', label: 'Faults', icon: <AlertTriangle size={17} />, badge: activeFaultsCount },
    { key: 'control', label: 'Control', icon: <Sliders size={17} /> },
    { key: 'configuration', label: 'Configuration', icon: <Settings size={17} /> },
    { key: 'automation', label: 'Automation', icon: <Cpu size={17} /> },
    { key: 'system', label: 'System', icon: <Server size={17} /> },
    { key: 'help', label: 'Help', icon: <HelpCircle size={17} /> },
  ];

  return (
    <aside className="sidebar">
      {tabs.map((tab) => {
        const isActive = activeNavTab === tab.key;
        return (
          <div
            key={tab.key}
            className={`sidebar-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveNavTab(tab.key)}
            title={tab.label}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>
            <span style={{ flex: 1 }}>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px',
              }}>
                {tab.badge}
              </span>
            )}
          </div>
        );
      })}
    </aside>
  );
};
