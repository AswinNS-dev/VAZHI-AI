import React, { useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  setSimulationSpeed,
  triggerDemoScenario,
} from '../services/api';
import { Play, Pause, RotateCcw, Sliders, Zap, Radio, ChevronDown, Check } from 'lucide-react';

export const BottomControlBar: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const currentSpeed = useTrafficStore((s) => s.speed);
  const setStoreSpeed = useTrafficStore((s) => s.setSpeed);
  const scenario = useTrafficStore((s) => s.scenario);
  const setScenario = useTrafficStore((s) => s.setScenario);
  const setIsInjectionOpen = useTrafficStore((s) => s.setIsInjectionOpen);

  const [isLoading, setIsLoading] = useState(false);

  const isRunning = frame?.is_running && !frame?.is_paused;

  const handleStart = async () => {
    try {
      await startSimulation();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async () => {
    try {
      await pauseSimulation();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await resetSimulation();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeed = async (sp: number) => {
    try {
      setStoreSpeed(sp);
      await setSimulationSpeed(sp);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunDemo = async () => {
    try {
      setIsLoading(true);
      await triggerDemoScenario();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className="bottom-controls">
      {/* Left: Simulation Controls Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sliders size={16} color="#38BDF8" />
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFF' }}>
          Simulation Controls
        </span>
      </div>

      {/* Center Left: Play / Pause / Reset / Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {isRunning ? (
          <button
            className="btn-pill btn-pill-dark"
            onClick={handlePause}
            style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <Pause size={13} /> Pause
          </button>
        ) : (
          <button className="btn-pill btn-pill-green" onClick={handleStart}>
            <Play size={13} /> Start
          </button>
        )}

        <button className="btn-pill btn-pill-dark" onClick={handleReset} title="Reset Simulation">
          <RotateCcw size={13} /> Reset
        </button>

        {/* Speed Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: '#0B1323',
          border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
          padding: '2px 4px',
          marginLeft: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, padding: '0 6px' }}>
            Speed:
          </span>
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeed(s)}
              style={{
                background: currentSpeed === s ? '#0284C7' : 'transparent',
                color: currentSpeed === s ? '#FFF' : '#64748B',
                border: 'none',
                borderRadius: '12px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center Right: Scenario & Inject Event */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#0B1323',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '5px 10px',
          fontSize: '11px',
        }}>
          <span style={{ color: '#64748B' }}>Scenario:</span>
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
            <option value="Normal Traffic" style={{ background: '#0B1323', color: '#FFF' }}>Normal Traffic</option>
            <option value="Heavy East Traffic" style={{ background: '#0B1323', color: '#FFF' }}>Heavy East Traffic</option>
            <option value="Emergency Scenario" style={{ background: '#0B1323', color: '#FFF' }}>Ambulance Emergency</option>
            <option value="Downstream Congestion" style={{ background: '#0B1323', color: '#FFF' }}>Downstream Congestion</option>
            <option value="Random Traffic" style={{ background: '#0B1323', color: '#FFF' }}>Random Traffic</option>
          </select>
        </div>

        <button
          className="btn-pill btn-pill-dark"
          onClick={() => setIsInjectionOpen(true)}
          style={{ fontSize: '11px' }}
        >
          <Radio size={13} color="#F97316" /> Inject Event
        </button>

        {/* 1-Click Primary Emergency Corridor Runner */}
        <button
          className="btn-pill"
          onClick={handleRunDemo}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
            color: '#FFF',
            boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)',
            fontSize: '11px',
            padding: '6px 14px',
          }}
        >
          <Zap size={13} />
          {isLoading ? 'INITIATING...' : 'RUN EMERGENCY SCENARIO'}
        </button>
      </div>
    </div>
  );
};
