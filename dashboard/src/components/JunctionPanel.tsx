import React from 'react';
import { useTrafficStore } from '../store/trafficStore';
import type { IntersectionData, ApproachData } from '../types/traffic';
import { Clock, ShieldAlert, AlertTriangle, ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Siren, CheckCircle2 } from 'lucide-react';

export const JunctionPanel: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);

  const junction: IntersectionData | undefined = frame?.intersections?.[selectedJunctionId];
  const approaches = junction?.approaches || {};
  const lastDecision = junction?.last_decision || frame?.recent_decisions?.find((d) => d.intersection === selectedJunctionId);

  const getSignalBadge = (color: string) => {
    if (color === 'GREEN') return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10B981', text: '#34D399', label: 'GREEN' };
    if (color === 'YELLOW') return { bg: 'rgba(245, 158, 11, 0.2)', border: '#F59E0B', text: '#FBBF24', label: 'YELLOW' };
    return { bg: 'rgba(239, 68, 68, 0.2)', border: '#EF4444', text: '#F87171', label: 'RED' };
  };

  const getDirectionIcon = (dir: string) => {
    switch (dir) {
      case 'NORTH': return <ArrowUp size={14} />;
      case 'SOUTH': return <ArrowDown size={14} />;
      case 'EAST': return <ArrowRight size={14} />;
      case 'WEST': return <ArrowLeft size={14} />;
      default: return null;
    }
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Panel Header & Junction Selector */}
      <div className="panel-header">
        <div className="panel-title">
          <span>JUNCTION TELEMETRY</span>
        </div>

        {/* J1-J4 Quick Switcher Tabs */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['J1', 'J2', 'J3', 'J4'].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedJunctionId(id)}
              style={{
                background: selectedJunctionId === id ? '#0284C7' : 'var(--bg-surface-elevated)',
                color: selectedJunctionId === id ? '#FFF' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: selectedJunctionId === id ? '#38BDF8' : 'var(--border-subtle)',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-body" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Junction Overview Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              {junction?.name || `Junction ${selectedJunctionId}`}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Node ID: {selectedJunctionId} • Switches: {junction?.total_phase_switches || 0}
            </span>
          </div>

          {/* Active Phase & Timer */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.04em' }}>
                {junction?.current_phase || 'ALL_RED'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Remaining: <span style={{ fontWeight: 700, color: '#FFF' }}>{junction?.time_remaining || 0}s</span>
            </div>
          </div>
        </div>

        {/* 4 Approaches Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {(['NORTH', 'SOUTH', 'EAST', 'WEST'] as const).map((dir) => {
            const app: ApproachData | undefined = approaches[dir];
            const sig = getSignalBadge(app?.signal_color || 'RED');
            const isStarving = (app?.max_waiting_time || 0) >= 60;
            const isCriticalDownstream = (app?.downstream_occupancy_pct || 0) >= 85;

            return (
              <div
                key={dir}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: `1px solid ${app?.has_emergency ? '#EF4444' : isStarving ? '#F59E0B' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '10px',
                  position: 'relative'
                }}
              >
                {/* Header row: Direction & Signal Bulb */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px' }}>
                    {getDirectionIcon(dir)}
                    <span>{dir}</span>
                  </div>
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: sig.bg,
                    border: `1px solid ${sig.border}`,
                    color: sig.text
                  }}>
                    {sig.label}
                  </span>
                </div>

                {/* Emergency Tag */}
                {app?.has_emergency && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#F87171',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Siren size={10} /> AMBULANCE ON APPROACH
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Vehicles:</span>
                  <span style={{ fontWeight: 700, color: '#FFF' }}>{app?.vehicle_count || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Queue:</span>
                  <span style={{ fontWeight: 700, color: '#FFF' }}>{app?.queue_length || 0}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Max Wait:</span>
                  <span style={{ fontWeight: 700, color: isStarving ? '#F59E0B' : '#FFF' }}>
                    {Math.round(app?.max_waiting_time || 0)}s {isStarving && '⚠️'}
                  </span>
                </div>

                {/* Downstream Road Gauge */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
                    <span>Downstream Occupancy</span>
                    <span style={{ fontWeight: 700, color: isCriticalDownstream ? '#EF4444' : '#FFF' }}>
                      {Math.round(app?.downstream_occupancy_pct || 0)}%
                    </span>
                  </div>
                  <div style={{ height: '4px', background: '#1E293B', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, app?.downstream_occupancy_pct || 0)}%`,
                      background: isCriticalDownstream ? '#EF4444' : (app?.downstream_occupancy_pct || 0) >= 70 ? '#F97316' : '#10B981',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explainable Decision for This Junction */}
        {lastDecision && (
          <div style={{
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                AI Decision Explainability
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                {lastDecision.timestamp?.slice(11, 19) || 'LIVE'}
              </span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF', marginBottom: '6px' }}>
              Selected Phase: <span style={{ color: '#38BDF8' }}>{lastDecision.selected_phase}</span> ({lastDecision.duration}s)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lastDecision.reason?.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#38BDF8', marginTop: '2px' }}>•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {lastDecision.next_planned_phase && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-dim)' }}>
                Next Planned: <span style={{ color: '#94A3B8', fontWeight: 600 }}>{lastDecision.next_planned_phase}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
