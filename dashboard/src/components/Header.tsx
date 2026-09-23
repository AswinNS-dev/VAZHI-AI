import React, { useEffect, useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { Activity, ShieldAlert, Cpu, BarChart3, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const isConnected = useTrafficStore((s) => s.isConnected);
  const frame = useTrafficStore((s) => s.frame);
  const lastUpdated = useTrafficStore((s) => s.lastUpdated);
  const setIsComparisonOpen = useTrafficStore((s) => s.setIsComparisonOpen);
  const setIsInjectionOpen = useTrafficStore((s) => s.setIsInjectionOpen);

  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const simTime = frame?.simulation_time || 0;
  const hours = Math.floor(simTime / 3600);
  const minutes = Math.floor((simTime % 3600) / 60);
  const seconds = simTime % 60;
  const formattedSimTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const mode = frame?.mode || 'VAZHI_AI';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Prototype Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)'
        }}>
          <Activity size={22} color="#FFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
              VAZHI-AI
            </h1>
            <span style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em'
            }}>
              PROTOTYPE / SIMULATION
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Real-Time Network-Aware Traffic & Emergency Intelligence
          </p>
        </div>
      </div>

      {/* Center: Live Clock & Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Simulation Clock */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>SIM CLOCK</span>
          <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#38BDF8' }}>
            {formattedSimTime}
          </span>
        </div>

        {/* Operating Mode */}
        <div style={{
          background: mode === 'VAZHI_AI' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${mode === 'VAZHI_AI' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          padding: '6px 14px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Cpu size={14} color={mode === 'VAZHI_AI' ? '#34D399' : '#FBBF24'} />
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: mode === 'VAZHI_AI' ? '#34D399' : '#FBBF24',
            letterSpacing: '0.04em'
          }}>
            {mode === 'VAZHI_AI' ? 'VAZHI-AI ADAPTIVE' : 'FIXED-TIME BASELINE'}
          </span>
        </div>
      </div>

      {/* Right: Actions & Live Connection Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="btn btn-outline"
          onClick={() => setIsInjectionOpen(true)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          <Radio size={14} /> Inject Events
        </button>

        <button
          className="btn btn-outline"
          onClick={() => setIsComparisonOpen(true)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          <BarChart3 size={14} /> A/B Comparison
        </button>

        {/* Connection Indicator */}
        {isConnected ? (
          <div className="badge-live" title="Connected to WebSocket /ws/traffic">
            <span className="pulse-dot" />
            <span>LIVE</span>
          </div>
        ) : (
          <div className="badge-disconnected" title="Reconnecting to backend...">
            <ShieldAlert size={12} />
            <span>CONNECTION LOST {secondsAgo > 0 && `(${secondsAgo}s)`}</span>
          </div>
        )}
      </div>
    </header>
  );
};
