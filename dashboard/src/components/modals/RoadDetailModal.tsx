import React from 'react';
import { useTrafficStore } from '../../store/trafficStore';
import { X, Layers, Flame, ShieldAlert, Car } from 'lucide-react';

export const RoadDetailModal: React.FC = () => {
  const selectedRoadId = useTrafficStore((s) => s.selectedRoadId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);
  const frame = useTrafficStore((s) => s.frame);

  if (!selectedRoadId) return null;

  const road = frame?.roads?.[selectedRoadId];
  if (!road) return null;

  const isCritical = road.occupancy_pct >= 85;
  const isHigh = road.occupancy_pct >= 70;

  const getStatusText = (pct: number) => {
    if (pct >= 85) return 'CRITICAL (HOLD TRAFFIC)';
    if (pct >= 70) return 'HIGH (METERED RELEASE)';
    if (pct >= 40) return 'MODERATE';
    return 'LOW (FREE FLOW)';
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedRoadId(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FFF' }}>
              Road Segment Telemetry: {road.road_id}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Direction: {road.from_node} → {road.to_node} • Length: {road.length_m}m
            </span>
          </div>

          <button
            className="btn-pill btn-pill-dark"
            onClick={() => setSelectedRoadId(null)}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Occupancy Banner */}
          <div style={{
            background: isCritical ? 'rgba(239, 68, 68, 0.15)' : isHigh ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isCritical ? '#EF4444' : isHigh ? '#F97316' : '#10B981'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Occupancy Level
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: isCritical ? '#F87171' : isHigh ? '#FB923C' : '#34D399' }}>
                {Math.round(road.occupancy_pct)}% • {getStatusText(road.occupancy_pct)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Spillback Risk</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: isCritical ? '#EF4444' : '#FFF' }}>
                {isCritical ? '87% (HIGH)' : 'LOW'}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Current Vehicles</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>{road.vehicle_count} veh ({road.pcu_count.toFixed(1)} PCU)</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Capacity</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>{road.capacity_pcu} PCU</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Queue Length</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>{road.queue_length} stopped</div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Max Wait Time</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: road.max_waiting_time > 60 ? '#F59E0B' : '#FFF' }}>
                {Math.round(road.max_waiting_time)}s
              </div>
            </div>
          </div>

          {/* Active Vehicles List */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Vehicles on Segment ({road.vehicles?.length || 0}):
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {road.vehicles?.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    background: 'var(--bg-surface-elevated)',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: v.is_emergency ? '#EF4444' : '#FFF' }}>
                    {v.is_emergency ? '🚑 ' : ''}{v.id} ({v.vehicle_type})
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Speed: {Math.round(v.speed_kmh)} km/h • Wait: {Math.round(v.waiting_time_s)}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
