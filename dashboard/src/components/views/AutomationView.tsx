import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Zap, Activity, GitBranch } from 'lucide-react';

export const AutomationView: React.FC = () => {
  const automationEngines = [
    {
      title: 'Adaptive Signal Optimization',
      status: 'ACTIVE',
      tag: '1 Hz Execution Cycle',
      description: 'Dynamically computes highest priority approach considering demand, queue length, waiting time, and emergency preemption.',
      icon: <Activity size={18} color="#34D399" />,
    },
    {
      title: 'Emergency Corridor Preemption Wave',
      status: 'ACTIVE',
      tag: 'Zero-Latency Routing',
      description: 'Calculates optimal Dijkstra path to Govt Hospital, coordinates sequential green waves (READY/PASSING/RELEASED), and holds conflicting movements.',
      icon: <Zap size={18} color="#EF4444" />,
    },
    {
      title: 'Downstream Spillback Protection',
      status: 'ACTIVE',
      tag: '85%+ Occupancy Hold',
      description: 'Prevents cross-box gridlocks by metering upstream vehicle releases when the receiving downstream road exceeds critical capacity.',
      icon: <ShieldCheck size={18} color="#F59E0B" />,
    },
    {
      title: 'Queue Starvation Boost Engine',
      status: 'ACTIVE',
      tag: '60s Escalation Limit',
      description: 'Guarantees service to low-volume feeder approaches by escalating their priority score when wait time exceeds the starvation threshold.',
      icon: <CheckCircle2 size={18} color="#38BDF8" />,
    },
    {
      title: 'NetworkX Graph Topology Engine',
      status: 'ACTIVE',
      tag: 'Multi-Node Connectivity',
      description: 'Models bidirectional dual carriageways, feeder approaches, and hospital connectivity as a weighted directed graph.',
      icon: <GitBranch size={18} color="#A78BFA" />,
    },
  ];

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
          Autonomous Intelligence Engines
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Real-time status of closed-loop algorithmic traffic controllers operating across the corridor network.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {automationEngines.map((engine) => (
          <div
            key={engine.title}
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {engine.icon}
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
                    {engine.title}
                  </h3>
                </div>

                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}>
                  {engine.status}
                </span>
              </div>

              <span style={{
                fontSize: '10px',
                color: '#38BDF8',
                fontFamily: 'monospace',
                display: 'inline-block',
                marginBottom: '8px',
              }}>
                {engine.tag}
              </span>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {engine.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
