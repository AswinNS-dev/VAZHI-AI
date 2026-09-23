import React from 'react';
import { useTrafficStore } from '../../store/trafficStore';
import { X, Siren, Car, Gauge, Clock, Navigation } from 'lucide-react';

export const VehicleDetailModal: React.FC = () => {
  const selectedVehicle = useTrafficStore((s) => s.selectedVehicle);
  const setSelectedVehicle = useTrafficStore((s) => s.setSelectedVehicle);

  if (!selectedVehicle) return null;

  const isEmergency = selectedVehicle.is_emergency;

  return (
    <div className="modal-overlay" onClick={() => setSelectedVehicle(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEmergency ? <Siren size={18} color="#EF4444" /> : <Car size={18} color="#38BDF8" />}
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
              Vehicle Telemetry: {selectedVehicle.id}
            </h3>
          </div>

          <button
            className="btn-pill btn-pill-dark"
            onClick={() => setSelectedVehicle(null)}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {isEmergency && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FECACA',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Siren size={14} /> ACTIVE EMERGENCY PREEMPTION CORRIDOR ENGAGED
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Vehicle Type</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>{selectedVehicle.vehicle_type}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Current Speed</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#34D399' }}>{Math.round(selectedVehicle.speed_kmh)} km/h</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Current Road Segment</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#38BDF8' }}>{selectedVehicle.current_road_id}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Destination Node</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>{selectedVehicle.destination_node}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Waiting Time</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: selectedVehicle.waiting_time_s > 60 ? '#F59E0B' : '#FFF' }}>
                {Math.round(selectedVehicle.waiting_time_s)}s
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Queue Status</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: selectedVehicle.in_queue ? '#EF4444' : '#10B981' }}>
                {selectedVehicle.in_queue ? 'In Queue (Stopped)' : 'Free Flowing'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
