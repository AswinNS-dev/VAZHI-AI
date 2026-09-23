import React from 'react';
import { HelpCircle, AlertCircle, ShieldAlert, Zap, Layers } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
          VAZHI-AI Architecture & System Reference
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Operational principles, scoring formulas, downstream spillback mechanics, and simulation disclaimer.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Card 1: Disclaimer */}
        <div style={{
          background: 'rgba(2, 132, 199, 0.1)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: '8px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <AlertCircle size={16} color="#38BDF8" />
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8' }}>
              Software Simulation & Prototype Positioning
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            VAZHI-AI is a pure software simulation MVP modeled after Tamil Nadu urban corridors (Anna Salai / OMR J1-J4 and Government Hospital). It operates entirely on microscopic discrete-time simulated data and does not directly connect to real municipal infrastructure.
          </p>
        </div>

        {/* Card 2: Paradigm Shift & Priority Formula */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            The Core Paradigm Shift: Coordinated Network Decisions
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
            Traditional traffic signals treat each intersection as an isolated timer. If Road A has 30 vehicles and Road B has 3 vehicles, fixed systems allocate approximately equal green intervals. Furthermore, isolated signals ignore downstream occupancy: blindly extending upstream green causes catastrophic cross-box spillbacks.
          </p>

          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#34D399',
            marginBottom: '12px',
          }}>
            Priority Score = 0.30·Demand + 0.20·Queue + 0.15·Waiting + 0.25·Emergency - 0.10·DownstreamCongestion + StarvationBoost
          </div>

          <ul style={{ paddingLeft: '20px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>PCU Weighing:</strong> Bikes: 0.5, Cars: 1.0, Buses: 3.0, Trucks: 2.5, Ambulances: 1.2 PCU.</li>
            <li><strong>Downstream Spillback:</strong> When downstream road occupancy crosses 85-90%, upstream traffic is held to prevent gridlock.</li>
            <li><strong>Emergency Corridor Preemption:</strong> NetworkX Dijkstra computes the optimal route to Govt Hospital and sequences green waves.</li>
            <li><strong>Starvation Override:</strong> If wait times exceed 60s, priority is dynamically boosted to guarantee service.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
