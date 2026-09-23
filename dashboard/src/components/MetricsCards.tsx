import React from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { Clock, Layers, TrendingUp, ShieldAlert, Zap, Car } from 'lucide-react';

export const MetricsCards: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const metrics = frame?.metrics;

  const cards = [
    {
      label: 'AVERAGE WAITING TIME',
      value: `${(metrics?.average_waiting_time || 0).toFixed(1)}s`,
      subtext: 'Across all active road queues',
      icon: <Clock size={16} color="#38BDF8" />,
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.08)'
    },
    {
      label: 'MAXIMUM QUEUE',
      value: `${metrics?.maximum_queue_length || 0} veh`,
      subtext: `Avg queue: ${(metrics?.average_queue_length || 0).toFixed(1)} veh`,
      icon: <Layers size={16} color="#FBBF24" />,
      color: '#FBBF24',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      label: 'TRAFFIC THROUGHPUT',
      value: `${metrics?.traffic_throughput || 0} veh`,
      subtext: 'Released through junctions',
      icon: <TrendingUp size={16} color="#34D399" />,
      color: '#34D399',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'SPILLBACK EVENTS',
      value: `${metrics?.spillback_events || 0}`,
      subtext: metrics?.spillback_events === 0 ? '100% Gridlock Prevented' : 'Holds Activated',
      icon: <ShieldAlert size={16} color="#F87171" />,
      color: '#F87171',
      bg: 'rgba(239, 68, 68, 0.08)'
    },
    {
      label: 'SIGNAL SWITCHES',
      value: `${metrics?.signal_switches || 0}`,
      subtext: 'Dynamic phase optimizations',
      icon: <Zap size={16} color="#A78BFA" />,
      color: '#A78BFA',
      bg: 'rgba(167, 139, 250, 0.08)'
    },
    {
      label: 'NETWORK VEHICLES',
      value: `${metrics?.active_vehicle_count || 0}`,
      subtext: `${metrics?.emergency_vehicles_active || 0} emergency active`,
      icon: <Car size={16} color="#94A3B8" />,
      color: '#CBD5E1',
      bg: 'rgba(148, 163, 184, 0.08)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '12px',
      padding: '0 24px 16px 24px'
    }}>
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              {c.label}
            </span>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: c.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {c.icon}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: c.color, fontFamily: 'monospace' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
              {c.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
