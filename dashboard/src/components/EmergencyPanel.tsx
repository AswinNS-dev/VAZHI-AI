import React from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { Siren, Clock, CheckCircle2, Navigation, AlertCircle, ArrowRight } from 'lucide-react';

export const EmergencyPanel: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const emergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);

  if (emergencies.length === 0) {
    return (
      <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Siren size={15} color="#64748B" />
            <span>EMERGENCY CORRIDOR</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>STANDBY</span>
        </div>

        <div className="panel-body" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <Siren size={20} color="#64748B" />
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            No Active Emergency Corridors
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', maxWidth: '280px', marginTop: '4px' }}>
            When an ambulance enters the network, NetworkX graph routing will coordinate green waves.
          </p>
        </div>
      </div>
    );
  }

  const activeAmbulance = emergencies[0];
  const etaMinutes = Math.floor(activeAmbulance.eta_seconds / 60);
  const etaSeconds = Math.floor(activeAmbulance.eta_seconds % 60);
  const formattedEta = `${etaMinutes.toString().padStart(2, '0')}:${etaSeconds.toString().padStart(2, '0')}`;

  const prepared = activeAmbulance.prepared_intersections || {};

  return (
    <div className="panel-card" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderColor: 'rgba(239, 68, 68, 0.4)'
    }}>
      <div className="panel-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
        <div className="panel-title" style={{ color: '#F87171' }}>
          <Siren size={16} color="#EF4444" className="glow-emergency" />
          <span>EMERGENCY CORRIDOR ACTIVE</span>
        </div>
        <span style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #EF4444',
          color: '#FECACA',
          fontSize: '10px',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          PREEMPTION ENGAGED
        </span>
      </div>

      <div className="panel-body" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Ambulance & ETA Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '12px'
        }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              VEHICLE ID
            </span>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
              🚑 {activeAmbulance.ambulance_id}
            </div>
            <div style={{ fontSize: '11px', color: '#38BDF8', marginTop: '2px' }}>
              Dest: {activeAmbulance.destination}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              ESTIMATED ARRIVAL (ETA)
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F87171', fontFamily: 'monospace' }}>
              {formattedEta}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              Distance: {activeAmbulance.total_distance_m}m
            </div>
          </div>
        </div>

        {/* Route Chain Visual */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
            COORDINATED GREEN ROUTE:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)'
          }}>
            {activeAmbulance.route_nodes?.map((node, i) => (
              <React.Fragment key={node}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: node === 'HOSPITAL' ? '#38BDF8' : '#FFF',
                  background: 'var(--bg-surface-elevated)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {node}
                </span>
                {i < activeAmbulance.route_nodes.length - 1 && (
                  <ArrowRight size={12} color="#64748B" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Progressive Intersection Readiness Checklist */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            INTERSECTION CLEARANCE CHECKLIST:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activeAmbulance.intersections?.map((jId) => {
              const info = prepared[jId];
              const status = info?.status || 'PREPARING';

              const isReady = status === 'READY';
              const isPassing = status === 'PASSING';
              const isReleased = status === 'RELEASED';

              const badgeColor = isReady
                ? { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#34D399', label: 'READY ✓' }
                : isPassing
                ? { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FBBF24', label: 'PASSING 🚑' }
                : isReleased
                ? { bg: 'rgba(100, 116, 139, 0.15)', border: '#64748B', text: '#94A3B8', label: 'RELEASED' }
                : { bg: 'rgba(2, 132, 199, 0.15)', border: '#0284C7', text: '#38BDF8', label: 'PREPARING...' };

              return (
                <div
                  key={jId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFF' }}>
                      Junction {jId}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      Step {info?.step || 1}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: badgeColor.bg,
                    border: `1px solid ${badgeColor.border}`,
                    color: badgeColor.text
                  }}>
                    {badgeColor.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
