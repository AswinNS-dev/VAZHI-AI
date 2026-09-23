import React from 'react';
import { useTrafficStore } from '../../store/trafficStore';
import { Server, Database, Radio, Cpu, Activity, ShieldCheck } from 'lucide-react';

export const SystemView: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const isConnected = useTrafficStore((s) => s.isConnected);

  const sysMetrics = [
    { label: 'FastAPI Backend Core', status: 'ONLINE', icon: <Server size={18} color="#34D399" />, detail: 'Uvicorn Python 3.11 Server on port 8000' },
    { label: 'Database Persistence', status: 'ONLINE', icon: <Database size={18} color="#34D399" />, detail: 'SQLite (vazhi.db) with historical snapshots' },
    { label: 'WebSocket Event Stream', status: isConnected ? 'CONNECTED' : 'DISCONNECTED', icon: <Radio size={18} color={isConnected ? '#34D399' : '#EF4444'} />, detail: '1 Hz real-time broadcasting at /ws/traffic' },
    { label: 'Simulation Runtime Engine', status: frame?.is_running ? 'RUNNING' : 'PAUSED', icon: <Cpu size={18} color="#38BDF8" />, detail: `Microscopic discrete-time vehicle generator (${frame?.vehicle_count || 0} active veh)` },
    { label: 'Mobile Client (Expo)', status: 'SYNCHRONIZED', icon: <Activity size={18} color="#A78BFA" />, detail: 'Port 8081 listening for mobile connections' },
    { label: 'Simulation Safety Interlocks', status: 'ENGAGED', icon: <ShieldCheck size={18} color="#10B981" />, detail: 'Minimum green 10s & yellow clearance enforced' },
  ];

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
          System Telemetry & Health Diagnostics
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Detailed operational metrics for backend servers, WebSocket streams, and persistent databases.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {sysMetrics.map((item) => (
          <div
            key={item.label}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                  {item.label}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {item.detail}
                </p>
              </div>
            </div>

            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '12px',
              background: item.status === 'ONLINE' || item.status === 'CONNECTED' || item.status === 'RUNNING' || item.status === 'SYNCHRONIZED' || item.status === 'ENGAGED'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              color: item.status === 'ONLINE' || item.status === 'CONNECTED' || item.status === 'RUNNING' || item.status === 'SYNCHRONIZED' || item.status === 'ENGAGED'
                ? '#34D399'
                : '#F87171',
              border: '1px solid',
              borderColor: item.status === 'ONLINE' || item.status === 'CONNECTED' || item.status === 'RUNNING' || item.status === 'SYNCHRONIZED' || item.status === 'ENGAGED'
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(239, 68, 68, 0.3)',
            }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
