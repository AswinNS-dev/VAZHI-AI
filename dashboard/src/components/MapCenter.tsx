import React, { useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import type { RoadData, IntersectionData, VehicleData, ApproachData } from '../types/traffic';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Layers,
  Siren,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  X,
  ShieldAlert,
} from 'lucide-react';

interface Coords {
  x: number;
  y: number;
}

const NODE_COORDINATES: Record<string, Coords> = {
  J1: { x: 160, y: 340 },
  J2: { x: 420, y: 340 },
  J3: { x: 680, y: 340 },
  J4: { x: 420, y: 520 },
  HOSPITAL: { x: 890, y: 340 },
  ENTRY_W: { x: 40, y: 340 },
  EXIT_W: { x: 40, y: 340 },
  ENTRY_J1_N: { x: 160, y: 160 },
  EXIT_J1_N: { x: 160, y: 160 },
  ENTRY_J1_S: { x: 160, y: 480 },
  EXIT_J1_S: { x: 160, y: 480 },
  ENTRY_J2_N: { x: 420, y: 160 },
  EXIT_J2_N: { x: 420, y: 160 },
  ENTRY_J3_N: { x: 680, y: 160 },
  EXIT_J3_N: { x: 680, y: 160 },
  ENTRY_J3_S: { x: 680, y: 480 },
  EXIT_J3_S: { x: 680, y: 480 },
  ENTRY_J4_S: { x: 420, y: 620 },
  EXIT_J4_S: { x: 420, y: 620 },
  ENTRY_J4_E: { x: 580, y: 520 },
  EXIT_J4_E: { x: 580, y: 520 },
  ENTRY_J4_W: { x: 260, y: 520 },
  EXIT_J4_W: { x: 260, y: 520 },
};

// Isometric 3D City Block Outlines matching reference image
const CITY_BLOCKS = [
  { x: 70, y: 190, w: 60, h: 100 },
  { x: 190, y: 190, w: 80, h: 90 },
  { x: 290, y: 180, w: 90, h: 100 },
  { x: 460, y: 170, w: 90, h: 110 },
  { x: 570, y: 180, w: 80, h: 100 },
  { x: 720, y: 190, w: 100, h: 90 },
  { x: 70, y: 380, w: 70, h: 80 },
  { x: 190, y: 380, w: 90, h: 100 },
  { x: 300, y: 380, w: 80, h: 90 },
  { x: 460, y: 380, w: 90, h: 90 },
  { x: 570, y: 380, w: 80, h: 80 },
  { x: 720, y: 380, w: 90, h: 90 },
];

export const MapCenter: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const is3D = useTrafficStore((s) => s.is3D);
  const setIs3D = useTrafficStore((s) => s.setIs3D);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);
  const setSelectedVehicle = useTrafficStore((s) => s.setSelectedVehicle);

  const [zoom, setZoom] = useState(1);
  const [equipmentTab, setEquipmentTab] = useState<'Equipment' | 'Control' | 'Comm'>('Equipment');
  const [isEquipmentVisible, setIsEquipmentVisible] = useState(true);

  const intersections = frame?.intersections || {};
  const roads = frame?.roads || {};
  const emergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);
  const activeCorridorRoads = new Set(emergencies.flatMap((e) => e.route_roads || []));
  const activeAmbulance = emergencies[0];

  const selectedJunction: IntersectionData | undefined = intersections[selectedJunctionId];
  const approaches = selectedJunction?.approaches || {};

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
    <div className="map-workspace">
      {/* 2D / 3D Canvas Stage */}
      <div className="map-stage">
        <div className={`map-plane ${is3D ? 'is-3d' : 'is-2d'}`} style={{ transform: `${is3D ? 'rotateX(24deg) rotateZ(-4deg)' : ''} scale(${zoom})` }}>
          <svg
            viewBox="0 0 1020 700"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              {/* Dark City Grid Pattern */}
              <pattern id="city-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
              </pattern>

              {/* Glowing Emergency Preemption Filter */}
              <filter id="corridor-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* City Canvas Base */}
            <rect width="1020" height="700" fill="#030712" />
            <rect width="1020" height="700" fill="url(#city-grid)" />

            {/* 3D Isometric Buildings */}
            {CITY_BLOCKS.map((b, i) => (
              <g key={`b-${i}`} opacity={is3D ? 0.8 : 0.4}>
                {/* 3D building roof shadow */}
                {is3D && (
                  <path
                    d={`M ${b.x} ${b.y} L ${b.x - 8} ${b.y - 14} L ${b.x + b.w - 8} ${b.y - 14} L ${b.x + b.w} ${b.y} Z`}
                    fill="#152136"
                  />
                )}
                {is3D && (
                  <path
                    d={`M ${b.x + b.w} ${b.y} L ${b.x + b.w - 8} ${b.y - 14} L ${b.x + b.w - 8} ${b.y + b.h - 14} L ${b.x + b.w} ${b.y + b.h} Z`}
                    fill="#0F1827"
                  />
                )}
                {/* Building Main Block */}
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  fill="#0B1322"
                  stroke="#1E2E49"
                  strokeWidth="1"
                  rx="4"
                />
              </g>
            ))}

            {/* Street Names (modeled after Tamil Nadu urban corridors in reference image) */}
            <text x="260" y="220" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="0.05em">
              Avinashi Rd
            </text>
            <text x="500" y="210" fill="#475569" fontSize="11" fontWeight="700" letterSpacing="0.05em">
              Bharathi Nagar Rd
            </text>
            <text x="360" y="325" fill="#64748B" fontSize="12" fontWeight="800" letterSpacing="0.08em">
              Anna Salai Corridor (J1 → J2 → J3 → Hospital)
            </text>

            {/* Roads & Dual Carriageways */}
            {Object.entries(roads).map(([roadId, road]) => {
              const from = NODE_COORDINATES[road.from_node];
              const to = NODE_COORDINATES[road.to_node];
              if (!from || !to) return null;

              const isCorridor = activeCorridorRoads.has(roadId);
              const roadColor = getRoadColor(road.occupancy_pct);
              const isCritical = road.occupancy_pct >= 85;

              // Dual-lane lateral offset
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              const offset = 4.5;

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
                  {/* Glowing emergency preemption wave */}
                  {isCorridor && (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#EF4444"
                      strokeWidth="14"
                      strokeOpacity="0.5"
                      strokeLinecap="round"
                      filter="url(#corridor-neon-glow)"
                    />
                  )}

                  {/* Road Base Track */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#111B2C"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />

                  {/* Traffic Occupancy Flow Line */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCorridor ? '#EF4444' : roadColor}
                    strokeWidth={isCorridor ? '5' : '3.5'}
                    strokeDasharray={isCritical ? '8,4' : undefined}
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                  />

                  {/* Vehicles moving along roads */}
                  {road.vehicles?.map((v) => {
                    const ratio = Math.min(0.95, Math.max(0.05, (v.position_m || 50) / (road.length_m || 300)));
                    const vx = x1 + (x2 - x1) * ratio;
                    const vy = y1 + (y2 - y1) * ratio;

                    if (v.is_emergency) {
                      return (
                        <g
                          key={v.id}
                          transform={`translate(${vx}, ${vy})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(v);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle r="12" fill="#EF4444" opacity="0.4" className="glow-pulse-red" />
                          <circle r="7" fill="#DC2626" />
                          <circle r="3" fill="#FFF" />
                          <text x="0" y="-12" textAnchor="middle" fill="#FECACA" fontSize="10" fontWeight="800">
                            🚑 A102
                          </text>
                        </g>
                      );
                    }

                    const fill = v.vehicle_type === 'BUS' ? '#38BDF8' : v.vehicle_type === 'TRUCK' ? '#A78BFA' : '#CBD5E1';
                    return (
                      <circle
                        key={v.id}
                        cx={vx}
                        cy={vy}
                        r={v.vehicle_type === 'BUS' || v.vehicle_type === 'TRUCK' ? 4 : 2.5}
                        fill={fill}
                        opacity={v.in_queue ? 0.95 : 0.7}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(v);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* Govt Hospital Node */}
            {(() => {
              const h = NODE_COORDINATES.HOSPITAL;
              return (
                <g key="hospital" transform={`translate(${h.x}, ${h.y})`}>
                  <circle r="26" fill="rgba(56, 189, 248, 0.12)" stroke="#38BDF8" strokeWidth="1.5" />
                  <rect x="-18" y="-18" width="36" height="36" rx="8" fill="#0E1A2E" stroke="#38BDF8" strokeWidth="2" />
                  <rect x="-12" y="-3" width="24" height="6" rx="2" fill="#EF4444" />
                  <rect x="-3" y="-12" width="6" height="24" rx="2" fill="#EF4444" />
                  <text x="0" y="32" textAnchor="middle" fill="#38BDF8" fontSize="11" fontWeight="800">
                    Govt Hospital
                  </text>
                </g>
              );
            })()}

            {/* Intersection Hubs (J1, J2, J3, J4) */}
            {['J1', 'J2', 'J3', 'J4'].map((jId) => {
              const coords = NODE_COORDINATES[jId];
              const inter = intersections[jId];
              if (!coords) return null;

              const isSelected = selectedJunctionId === jId;
              const signals = inter?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };
              const currentPhase = inter?.current_phase || 'ALL_RED';

              return (
                <g
                  key={jId}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  onClick={() => setSelectedJunctionId(jId)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle r="36" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5,4" />
                  )}

                  {/* Junction Box */}
                  <rect
                    x="-24"
                    y="-24"
                    width="48"
                    height="48"
                    rx="10"
                    fill="#080F1E"
                    stroke={isSelected ? '#38BDF8' : '#2A3C5E'}
                    strokeWidth="2"
                  />

                  {/* Node Name */}
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="800">
                    {jId}
                  </text>

                  {/* 4 Signal Heads around junction */}
                  <circle cx="0" cy="-18" r="4" fill={getSignalFill(signals.NORTH)} />
                  <circle cx="0" cy="18" r="4" fill={getSignalFill(signals.SOUTH)} />
                  <circle cx="18" cy="0" r="4" fill={getSignalFill(signals.EAST)} />
                  <circle cx="-18" cy="0" r="4" fill={getSignalFill(signals.WEST)} />

                  {/* Phase Banner Pill below node */}
                  <g transform="translate(0, 36)">
                    <rect x="-44" y="-9" width="88" height="18" rx="4" fill="#0A1322" stroke="#1E2F4C" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="800">
                      {currentPhase.replace('_PRIORITY', '').replace('_GREEN', ' G')}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Map Controls: 2D/3D toggle, Compass, Zoom */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 20,
      }}>
        {/* 2D / 3D Toggle Pill */}
        <div style={{
          display: 'flex',
          background: 'rgba(10, 16, 28, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '2px',
        }}>
          <button
            onClick={() => setIs3D(false)}
            style={{
              background: !is3D ? '#0284C7' : 'transparent',
              color: !is3D ? '#FFF' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '16px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            2D
          </button>
          <button
            onClick={() => setIs3D(true)}
            style={{
              background: is3D ? '#0284C7' : 'transparent',
              color: is3D ? '#FFF' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '16px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            3D
          </button>
        </div>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={() => { setZoom(1); setIs3D(true); }}
          title="Reset Perspective"
        >
          <Compass size={15} color="#38BDF8" />
        </button>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          title="Zoom In"
        >
          <ZoomIn size={15} />
        </button>

        <button
          className="btn-pill btn-pill-dark"
          style={{ padding: '6px', borderRadius: '50%' }}
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
          title="Zoom Out"
        >
          <ZoomOut size={15} />
        </button>
      </div>

      {/* Floating Panel 1: Equipment / System Overview (Top-Left of map matching reference image) */}
      {isEquipmentVisible && (
        <div
          className="floating-overlay-card"
          style={{ top: '16px', left: '16px', width: '270px', padding: '14px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
              Tamil Nadu State Traffic Hub
            </h4>
            <button
              onClick={() => setIsEquipmentVisible(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Subheader Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {(['Equipment', 'Control', 'Comm'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEquipmentTab(t)}
                style={{
                  background: equipmentTab === t ? '#10B981' : 'transparent',
                  color: equipmentTab === t ? '#FFF' : '#64748B',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Grid Stats matching reference image */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>4 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Faulty Controllers</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#F59E0B' }}>8</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lamps Off</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>12 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Lamp Faults</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>120 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 481</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Detectors Active</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>262 <span style={{ fontSize: '11px', color: '#64748B' }}>/ 262</span></div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Total Controllers</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>0</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Active Alarms</div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Panel 2: Junction Telemetry Panel (Bottom Center matching reference image) */}
      <div
        className="floating-overlay-card"
        style={{
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          padding: '12px 16px',
        }}
      >
        {/* Header row: Junction Title, Phase Badge, Remaining seconds */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF' }}>
              {selectedJunction?.name || `Junction ${selectedJunctionId}`}
            </h4>
            <div style={{ display: 'flex', gap: '3px' }}>
              {['J1', 'J2', 'J3', 'J4'].map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedJunctionId(id)}
                  style={{
                    background: selectedJunctionId === id ? '#0284C7' : '#142036',
                    color: selectedJunctionId === id ? '#FFF' : '#64748B',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: '#10B981',
              color: '#FFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}>
              {selectedJunction?.current_phase || 'WEST GREEN'}
            </span>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
              {selectedJunction?.time_remaining || 18}s remaining
            </span>
          </div>
        </div>

        {/* 4 Approach Columns (North, South, East, West) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {(['NORTH', 'SOUTH', 'EAST', 'WEST'] as const).map((dir) => {
            const app: ApproachData | undefined = approaches[dir];
            const occPct = app?.downstream_occupancy_pct || (dir === 'EAST' ? 81 : dir === 'NORTH' ? 68 : dir === 'WEST' ? 54 : 32);
            const vehCount = app?.vehicle_count || (dir === 'EAST' ? 12 : dir === 'NORTH' ? 10 : dir === 'WEST' ? 8 : 4);
            const queue = app?.queue_length || (dir === 'EAST' ? 5 : dir === 'NORTH' ? 3 : dir === 'WEST' ? 2 : 1);
            const maxWait = Math.round(app?.max_waiting_time || (dir === 'EAST' ? 76 : dir === 'NORTH' ? 42 : dir === 'WEST' ? 34 : 18));

            return (
              <div
                key={dir}
                style={{
                  background: 'rgba(19, 30, 53, 0.65)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFF' }}>{dir}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: app?.signal_color === 'GREEN' ? '#10B981' : '#EF4444' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Vehicles: <strong style={{ color: '#FFF' }}>{vehCount}</strong></div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Queue: <strong style={{ color: '#FFF' }}>{queue}</strong></div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Max Wait: <strong style={{ color: maxWait > 60 ? '#F59E0B' : '#FFF' }}>{maxWait}s</strong></div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748B', marginBottom: '2px' }}>
                    <span>Occupancy</span>
                    <span style={{ color: occPct >= 80 ? '#EF4444' : '#38BDF8', fontWeight: 700 }}>{Math.round(occPct)}%</span>
                  </div>
                  <div style={{ height: '3px', background: '#0D1628', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${occPct}%`,
                      background: occPct >= 80 ? '#EF4444' : occPct >= 60 ? '#F97316' : '#10B981',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Panel 3: Active Emergency Corridor Stepper (Bottom Right of map matching reference image) */}
      {activeAmbulance && (
        <div
          className="floating-overlay-card glow-pulse-red"
          style={{
            bottom: '16px',
            right: '16px',
            width: '260px',
            padding: '12px',
            borderColor: 'rgba(239, 68, 68, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Siren size={14} color="#EF4444" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFF' }}>
                {activeAmbulance.ambulance_id} – To Hospital
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#F87171', fontWeight: 800, fontFamily: 'monospace' }}>
              {Math.floor(activeAmbulance.eta_seconds / 60)}:{Math.floor(activeAmbulance.eta_seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>
            {activeAmbulance.route_display || 'J1 → J2 → J3 → Hospital'}
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {activeAmbulance.intersections?.map((jId) => {
              const status = activeAmbulance.prepared_intersections?.[jId]?.status || 'PREPARING';
              const isReady = status === 'READY' || status === 'PASSING';
              return (
                <div key={jId} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: isReady ? '#10B981' : '#F59E0B',
                    margin: '0 auto 2px auto',
                  }} />
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#FFF' }}>{jId}</div>
                  <div style={{ fontSize: '8px', color: isReady ? '#34D399' : '#FBBF24' }}>{status}</div>
                </div>
              );
            })}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#EF4444',
                margin: '0 auto 2px auto',
              }} />
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#FFF' }}>HOSPITAL</div>
              <div style={{ fontSize: '8px', color: '#38BDF8' }}>1.2 km</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
