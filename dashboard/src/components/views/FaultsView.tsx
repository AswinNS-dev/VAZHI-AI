import React from 'react';
import { useTrafficStore } from '../../store/trafficStore';
import { AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const FaultsView: React.FC = () => {
  const faults = useTrafficStore((s) => s.faults);
  const resolveFault = useTrafficStore((s) => s.resolveFault);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);
  const setActiveNavTab = useTrafficStore((s) => s.setActiveNavTab);

  const handleFocus = (targetId?: string) => {
    if (!targetId) return;
    if (targetId.startsWith('J')) {
      setSelectedJunctionId(targetId);
    } else {
      setSelectedRoadId(targetId);
    }
    setActiveNavTab('monitor');
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#F87171' };
      case 'WARNING':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FBBF24' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38BDF8', text: '#38BDF8' };
    }
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
            System Faults & Anomaly Monitoring
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time automated detection of road saturation, queue starvation, and signal interlock events.
          </p>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#34D399',
        }}>
          ● Automated Diagnostics Active
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faults.map((f) => {
          const sev = getSeverityStyle(f.severity);
          const isResolved = f.status === 'RESOLVED';

          return (
            <div
              key={f.id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: sev.bg,
                  border: `1px solid ${sev.border}`,
                  color: sev.text,
                }}>
                  {f.severity}
                </span>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
                      {f.location}
                    </h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                      {f.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {f.description}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn-pill btn-pill-dark"
                  onClick={() => handleFocus(f.targetId)}
                  style={{ fontSize: '11px' }}
                >
                  Inspect on Map <ArrowRight size={12} />
                </button>

                {!isResolved ? (
                  <button
                    className="btn-pill"
                    onClick={() => resolveFault(f.id)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                      fontSize: '11px',
                    }}
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                    Resolved ✓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
