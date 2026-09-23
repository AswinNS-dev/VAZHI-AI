import React, { useState, useEffect, useRef } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { Search, Radio, ChevronDown, Activity, User, BarChart3, ShieldCheck } from 'lucide-react';

export const TopBar: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const isConnected = useTrafficStore((s) => s.isConnected);
  const lastUpdated = useTrafficStore((s) => s.lastUpdated);
  const scenario = useTrafficStore((s) => s.scenario);
  const setScenario = useTrafficStore((s) => s.setScenario);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);
  const setSelectedRoadId = useTrafficStore((s) => s.setSelectedRoadId);
  const setSelectedVehicle = useTrafficStore((s) => s.setSelectedVehicle);
  const setIsComparisonOpen = useTrafficStore((s) => s.setIsComparisonOpen);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const simTime = frame?.simulation_time || 0;
  const hours = Math.floor(simTime / 3600);
  const minutes = Math.floor((simTime % 3600) / 60);
  const seconds = simTime % 60;
  const formattedSimTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Search Results Generator
  const allSearchOptions = [
    { id: 'J1', name: 'Junction 1 (West Feeder)', type: 'INTERSECTION' },
    { id: 'J2', name: 'Junction 2 (Central Hub)', type: 'INTERSECTION' },
    { id: 'J3', name: 'Junction 3 (Hospital Gateway)', type: 'INTERSECTION' },
    { id: 'J4', name: 'Junction 4 (South Sector)', type: 'INTERSECTION' },
    { id: 'HOSPITAL', name: 'Govt Multi Super Speciality Hospital', type: 'DESTINATION' },
    { id: 'ROAD_J1_J2', name: 'Arterial Corridor J1 → J2', type: 'ROAD' },
    { id: 'ROAD_J2_J3', name: 'Arterial Corridor J2 → J3', type: 'ROAD' },
    { id: 'ROAD_J2_J4', name: 'Central Connector J2 → J4', type: 'ROAD' },
    { id: 'ROAD_J3_HOSP', name: 'Emergency Gateway J3 → Hospital', type: 'ROAD' },
    { id: 'A102', name: 'Ambulance A102 (Emergency Corridor)', type: 'VEHICLE' },
  ];

  const filteredResults = searchQuery.trim()
    ? allSearchOptions.filter(
        (o) =>
          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectResult = (item: (typeof allSearchOptions)[0]) => {
    if (item.type === 'INTERSECTION') {
      setSelectedJunctionId(item.id);
    } else if (item.type === 'ROAD') {
      setSelectedRoadId(item.id);
    } else if (item.id === 'A102') {
      const activeAmb = Object.values(frame?.emergencies || {}).find((e) => e.active);
      if (activeAmb) {
        setSelectedVehicle({
          id: activeAmb.ambulance_id,
          vehicle_type: 'AMBULANCE',
          current_road_id: activeAmb.current_location,
          destination_node: activeAmb.destination,
          position_m: 100,
          speed_kmh: 60,
          waiting_time_s: 0,
          is_emergency: true,
          in_queue: false,
        });
      }
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="topbar">
      {/* Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #0284C7 0%, #10B981 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(2, 132, 199, 0.4)',
        }}>
          <Activity size={18} color="#FFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
              VAZHI-AI
            </span>
          </div>
          <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Traffic Intelligence
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="search-input-wrap" ref={searchRef}>
        <Search
          size={14}
          color="#64748B"
          style={{ position: 'absolute', left: '12px', top: '10px' }}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Search intersection, road, or vehicle..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
        />

        {/* Dropdown search results */}
        {isSearchOpen && filteredResults.length > 0 && (
          <div className="search-dropdown">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="search-item"
                onClick={() => handleSelectResult(item)}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#FFF' }}>{item.id}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.name}</div>
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface-elevated)',
                  color: '#38BDF8',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls: Live status, Sim time, Scenario, User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* A/B Comparison Quick Button */}
        <button
          className="btn-pill btn-pill-dark"
          onClick={() => setIsComparisonOpen(true)}
          style={{ fontSize: '11px', padding: '5px 12px' }}
          title="Compare Fixed-Time vs VAZHI-AI"
        >
          <BarChart3 size={13} color="#38BDF8" />
          <span>A/B Bench</span>
        </button>

        {/* Live Status Pill */}
        {isConnected ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '9999px',
            padding: '4px 10px',
            color: '#34D399',
            fontSize: '11px',
            fontWeight: 800,
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }} />
            <span>LIVE</span>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '9999px',
            padding: '4px 10px',
            color: '#F87171',
            fontSize: '11px',
            fontWeight: 800,
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
            <span>DISCONNECTED {secondsAgo > 0 ? `(${secondsAgo}s)` : ''}</span>
          </div>
        )}

        {/* Simulation Time */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFF', fontFamily: 'monospace' }}>
            {formattedSimTime}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Simulation Time
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#0E1729',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}>
          <span>Scenario:</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38BDF8',
              fontWeight: 700,
              fontSize: '11px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Normal Traffic" style={{ background: '#0E1729', color: '#FFF' }}>Normal Traffic</option>
            <option value="Heavy East Traffic" style={{ background: '#0E1729', color: '#FFF' }}>Heavy East Traffic</option>
            <option value="Emergency Scenario" style={{ background: '#0E1729', color: '#FFF' }}>Ambulance Emergency</option>
            <option value="Downstream Congestion" style={{ background: '#0E1729', color: '#FFF' }}>Downstream Congestion</option>
            <option value="Random Traffic" style={{ background: '#0E1729', color: '#FFF' }}>Random Traffic</option>
          </select>
        </div>

        {/* User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12px',
            color: '#FFF',
          }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFF', lineHeight: 1.1 }}>Aswin</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};
