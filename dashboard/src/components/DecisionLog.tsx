import React from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { Brain, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

export const DecisionLog: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const decisions = frame?.recent_decisions || [];

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Brain size={15} color="#38BDF8" />
          <span>AI EXPLAINABLE DECISION LOG</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
          {decisions.length} EVENTS RECORDED
        </span>
      </div>

      <div className="panel-body" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {decisions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '12px' }}>
            Awaiting signal transition events from simulator...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {decisions.slice(0, 30).map((d, index) => {
              const isEmergency = d.emergency_override;
              const timeStr = d.timestamp?.slice(11, 19) || 'RECENT';

              return (
                <div
                  key={`${d.intersection}-${d.timestamp}-${index}`}
                  style={{
                    background: isEmergency ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isEmergency ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '10px 12px'
                  }}
                >
                  {/* Top Bar: Time, Node & Phase */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>
                        {timeStr}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#FFF',
                        background: '#1E293B',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {d.intersection}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isEmergency ? '#F87171' : '#38BDF8'
                      }}>
                        → {d.selected_phase}
                      </span>
                    </div>

                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      {d.duration}s green
                    </span>
                  </div>

                  {/* Bullet reasons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {d.reason?.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ color: isEmergency ? '#EF4444' : '#0284C7', marginTop: '1px' }}>•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
