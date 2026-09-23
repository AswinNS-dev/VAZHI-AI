import React, { useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  setSimulationMode,
  setSimulationSpeed,
  triggerDemoScenario,
} from '../services/api';
import { Play, Pause, RotateCcw, FastForward, Zap, Shield, AlertTriangle } from 'lucide-react';

export const ControlBar: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const currentSpeed = useTrafficStore((s) => s.speed);
  const setStoreSpeed = useTrafficStore((s) => s.setSpeed);

  const [isLoading, setIsLoading] = useState(false);

  const isRunning = frame?.is_running && !frame?.is_paused;
  const currentMode = frame?.mode || 'VAZHI_AI';

  const handleStart = async () => {
    try {
      await startSimulation();
    } catch (e) {
      console.error('Failed to start simulation:', e);
    }
  };

  const handlePause = async () => {
    try {
      await pauseSimulation();
    } catch (e) {
      console.error('Failed to pause simulation:', e);
    }
  };

  const handleReset = async () => {
    try {
      await resetSimulation();
    } catch (e) {
      console.error('Failed to reset simulation:', e);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      setStoreSpeed(speed);
      await setSimulationSpeed(speed);
    } catch (e) {
      console.error('Failed to set speed:', e);
    }
  };

  const handleModeToggle = async () => {
    const nextMode = currentMode === 'VAZHI_AI' ? 'FIXED_TIME' : 'VAZHI_AI';
    try {
      await setSimulationMode(nextMode);
    } catch (e) {
      console.error('Failed to toggle mode:', e);
    }
  };

  const handleRunDemo = async () => {
    try {
      setIsLoading(true);
      await triggerDemoScenario();
    } catch (e) {
      console.error('Failed to trigger demo scenario:', e);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Left: Playback Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isRunning ? (
          <button className="btn btn-outline" onClick={handlePause} title="Pause simulation clock">
            <Pause size={14} color="#F59E0B" /> Pause
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleStart} title="Start simulation clock">
            <Play size={14} /> Resume
          </button>
        )}

        <button className="btn btn-outline" onClick={handleReset} title="Reset all queues, signals, and vehicles">
          <RotateCcw size={14} /> Reset
        </button>

        {/* Speed Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '6px',
          padding: '2px',
          marginLeft: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '0 8px', fontWeight: 600 }}>
            SPEED:
          </span>
          {[0.5, 1.0, 2.0, 5.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedChange(s)}
              style={{
                background: currentSpeed === s ? '#0284C7' : 'transparent',
                color: currentSpeed === s ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Center: Live Scenario Progress Banner (if active) */}
      {frame?.scenario_description && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(2, 132, 199, 0.12)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          padding: '4px 12px',
          borderRadius: '6px'
        }}>
          <FastForward size={14} color="#38BDF8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#38BDF8' }}>
            DEMO STEP {frame.scenario_step || 1}:
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>
            {frame.scenario_description}
          </span>
        </div>
      )}

      {/* Right: Mode Switcher & 1-Click Demo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-outline"
          onClick={handleModeToggle}
          title="Toggle between VAZHI-AI Adaptive and 30s Fixed-Time"
          style={{ fontSize: '12px' }}
        >
          <Shield size={14} color={currentMode === 'VAZHI_AI' ? '#34D399' : '#F59E0B'} />
          Switch to {currentMode === 'VAZHI_AI' ? 'Fixed-Time' : 'Adaptive'}
        </button>

        <button
          className="btn"
          onClick={handleRunDemo}
          disabled={isLoading}
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
            color: '#FFF',
            boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)',
            fontSize: '12px',
            padding: '7px 16px'
          }}
        >
          <Zap size={14} />
          {isLoading ? 'INITIATING...' : 'RUN EMERGENCY SCENARIO'}
        </button>
      </div>
    </div>
  );
};
