import React, { useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import type { RoadData, IntersectionData, VehicleData } from '../types/traffic';
import { AlertCircle, Flame, Siren, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Coords {
  x: number;
  y: number;
}

const NODE_COORDINATES: Record<string, Coords> = {
  J1: { x: 140, y: 240 },
  J2: { x: 400, y: 240 },
  J3: { x: 660, y: 240 },
  J4: { x: 400, y: 440 },
  HOSPITAL: { x: 880, y: 240 },
  ENTRY_W: { x: 30, y: 240 },
  EXIT_W: { x: 30, y: 240 },
  ENTRY_J1_N: { x: 140, y: 80 },
  EXIT_J1_N: { x: 140, y: 80 },
  ENTRY_J1_S: { x: 140, y: 400 },
  EXIT_J1_S: { x: 140, y: 400 },
  ENTRY_J2_N: { x: 400, y: 80 },
  EXIT_J2_N: { x: 400, y: 80 },
  ENTRY_J3_N: { x: 660, y: 80 },
  EXIT_J3_N: { x: 660, y: 80 },
  ENTRY_J3_S: { x: 660, y: 400 },
  EXIT_J3_S: { x: 660, y: 400 },
  ENTRY_J4_S: { x: 400, y: 560 },
  EXIT_J4_S: { x: 400, y: 560 },
  ENTRY_J4_E: { x: 560, y: 440 },
  EXIT_J4_E: { x: 560, y: 440 },
  ENTRY_J4_W: { x: 240, y: 440 },
  EXIT_J4_W: { x: 240, y: 440 },
};

export const NetworkMap: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);

  const [scale, setScale] = useState(1);

  const intersections = frame?.intersections || {};
  const roads = frame?.roads || {};
  const emergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);
  const activeCorridorRoads = new Set(emergencies.flatMap((e) => e.route_roads || []));

  const getRoadColor = (occupancyPct: number) => {
    if (occupancyPct >= 85) return '#EF4444'; // Critical
    if (occupancyPct >= 70) return '#F97316'; // High
    if (occupancyPct >= 40) return '#F59E0B'; // Moderate
    return '#10B981'; // Free Flow
  };

  const getSignalFill = (color?: string) => {
    if (color === 'GREEN') return '#10B981';
    if (color === 'YELLOW') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <span>LIVE CORRIDOR NETWORK MAP</span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
            (TAMIL NADU URBAN SIMULATION)
          </span>
        </div>

        {/* Map Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            className="btn btn-outline"
            style={{ padding: '4px 8px', fontSize: '11px' }}
            onClick={() => setScale(1)}
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        position: 'relative',
        background: '#040711',
        overflow: 'hidden',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Vector SVG Map Canvas */}
        <svg
          viewBox="0 0 960 580"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${scale})`,
            transition: 'transform 0.15s ease'
          }}
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>

            {/* Glowing filter for active emergency corridors */}
            <filter id="corridor-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect width="960" height="580" fill="url(#grid)" />

          {/* Corridor Axis Roads */}
          {Object.entries(roads).map(([roadId, road]) => {
            const from = NODE_COORDINATES[road.from_node];
            const to = NODE_COORDINATES[road.to_node];
            if (!from || !to) return null;

            const isCorridor = activeCorridorRoads.has(roadId);
            const roadColor = getRoadColor(road.occupancy_pct);
            const isCriticalSpillback = road.occupancy_pct >= 85;

            // Offset dual carriage roads slightly so Eastbound and Westbound are distinct
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            const offset = 4; // 4px lateral offset

            const x1 = from.x + nx * offset;
            const y1 = from.y + ny * offset;
            const x2 = to.x + nx * offset;
            const y2 = to.y + ny * offset;

            return (
              <g
                key={roadId}
                onClick={() => setSelectedRoadId(roadId)}
                style={{ cursor: 'pointer' }}
              >
                {/* Emergency Preemption Glow */}
                {isCorridor && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    filter="url(#corridor-glow)"
                  />
                )}

                {/* Road Base Track */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#162032"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Road Occupancy & Congestion Color */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={roadColor}
                  strokeWidth={isCorridor ? '4' : '3'}
                  strokeDasharray={isCriticalSpillback ? '6,3' : undefined}
                  strokeOpacity="0.85"
                  strokeLinecap="round"
                />

                {/* Moving Vehicles along the road */}
                {road.vehicles?.map((v) => {
                  const ratio = Math.min(0.95, Math.max(0.05, (v.position_m || 50) / (road.length_m || 300)));
                  const vx = x1 + (x2 - x1) * ratio;
                  const vy = y1 + (y2 - y1) * ratio;

                  if (v.is_emergency) {
                    return (
                      <g key={v.id} transform={`translate(${vx}, ${vy})`}>
                        <circle r="9" fill="#EF4444" opacity="0.4" className="glow-emergency" />
                        <circle r="6" fill="#DC2626" />
                        <circle r="3" fill="#FFF" />
                      </g>
                    );
                  }

                  const vehicleFill = v.vehicle_type === 'BUS' ? '#38BDF8' : v.vehicle_type === 'TRUCK' ? '#A78BFA' : '#CBD5E1';
                  return (
                    <circle
                      key={v.id}
                      cx={vx}
                      cy={vy}
                      r={v.vehicle_type === 'BUS' || v.vehicle_type === 'TRUCK' ? 3.5 : 2.5}
                      fill={vehicleFill}
                      opacity={v.in_queue ? 0.9 : 0.7}
                    />
                  );
                })}

                {/* Downstream Spillback Alert Tag */}
                {isCriticalSpillback && (
                  <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2 - 12})`}>
                    <rect x="-32" y="-9" width="64" height="18" rx="4" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#FECACA" fontSize="9" fontWeight="700">
                      HOLD {Math.round(road.occupancy_pct)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Hospital Destination */}
          {(() => {
            const h = NODE_COORDINATES.HOSPITAL;
            return (
              <g key="hospital" transform={`translate(${h.x}, ${h.y})`}>
                <rect x="-24" y="-24" width="48" height="48" rx="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                <rect x="-18" y="-4" width="36" height="8" rx="2" fill="#EF4444" />
                <rect x="-4" y="-18" width="8" height="36" rx="2" fill="#EF4444" />
                <text x="0" y="38" textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="700">
                  GOVT HOSPITAL
                </text>
              </g>
            );
          })()}

          {/* Intersections J1, J2, J3, J4 */}
          {['J1', 'J2', 'J3', 'J4'].map((jId) => {
            const coords = NODE_COORDINATES[jId];
            const inter: IntersectionData | undefined = intersections[jId];
            if (!coords) return null;

            const isSelected = selectedJunctionId === jId;
            const signals = inter?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };
            const activePhase = inter?.current_phase || 'ALL_RED';

            return (
              <g
                key={jId}
                onClick={() => setSelectedJunctionId(jId)}
                style={{ cursor: 'pointer' }}
                transform={`translate(${coords.x}, ${coords.y})`}
              >
                {/* Selection Highlight Ring */}
                {isSelected && (
                  <circle r="36" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4,4" />
                )}

                {/* Junction Hub Box */}
                <rect
                  x="-26"
                  y="-26"
                  width="52"
                  height="52"
                  rx="8"
                  fill="#0B1323"
                  stroke={isSelected ? '#38BDF8' : '#2D3A54'}
                  strokeWidth="2"
                />

                {/* Junction Label */}
                <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="800">
                  {jId}
                </text>

                {/* 4 Approach Signal Bulbs (N, S, E, W) */}
                {/* North Signal */}
                <circle cx="0" cy="-20" r="4" fill={getSignalFill(signals.NORTH)} />
                {/* South Signal */}
                <circle cx="0" cy="20" r="4" fill={getSignalFill(signals.SOUTH)} />
                {/* East Signal */}
                <circle cx="20" cy="0" r="4" fill={getSignalFill(signals.EAST)} />
                {/* West Signal */}
                <circle cx="-20" cy="0" r="4" fill={getSignalFill(signals.WEST)} />

                {/* Phase Tag Below Junction */}
                <g transform="translate(0, 38)">
                  <rect x="-42" y="-9" width="84" height="18" rx="4" fill="#111B2E" stroke="#1E293B" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="700">
                    {activePhase.replace('_PRIORITY', '').replace('_GREEN', ' G')}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(10, 16, 28, 0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          gap: '14px',
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
            <span>0-40% Free</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
            <span>40-70% Moderate</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F97316' }} />
            <span>70-85% High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
            <span>85%+ Critical Hold</span>
          </div>
          {emergencies.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="glow-emergency" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ color: '#F87171', fontWeight: 700 }}>Ambulance Corridor Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
