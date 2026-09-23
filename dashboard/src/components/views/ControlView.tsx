import React, { useState } from 'react';
import { useTrafficStore } from '../../store/trafficStore';
import {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  setSimulationMode,
  setSimulationSpeed,
  triggerDemoScenario,
  injectAmbulance,
  injectCongestion,
  injectWaitingSurge,
} from '../../services/api';
import { Sliders, Play, Pause, RotateCcw, Zap, Siren, Flame, Clock, Shield } from 'lucide-react';

export const ControlView: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const currentSpeed = useTrafficStore((s) => s.speed);
  const setStoreSpeed = useTrafficStore((s) => s.setSpeed);

  const [feedback, setFeedback] = useState<string | null>(null);

  const isRunning = frame?.is_running && !frame?.is_paused;
  const currentMode = frame?.mode || 'VAZHI_AI';

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggleMode = async () => {
    const next = currentMode === 'VAZHI_AI' ? 'FIXED_TIME' : 'VAZHI_AI';
    await setSimulationMode(next);
    notify(`Operating mode switched to ${next}`);
  };

  const handleSpeed = async (sp: number) => {
    setStoreSpeed(sp);
    await setSimulationSpeed(sp);
    notify(`Simulation speed updated to ${sp}x`);
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
            Simulation Control & Manual Overrides
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Authorized simulation operators can start, pause, reset, adjust clock speed, or inject events into the network.
          </p>
        </div>

        {feedback && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34D399',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
          }}>
            {feedback}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* Card 1: Clock & State Control */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="#38BDF8" /> Simulation Clock & Playback
          </h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {isRunning ? (
              <button
                className="btn-pill btn-pill-dark"
                onClick={async () => { await pauseSimulation(); notify('Simulation paused.'); }}
                style={{ color: '#F59E0B' }}
              >
                <Pause size={14} /> Pause Simulation
              </button>
            ) : (
              <button
                className="btn-pill btn-pill-green"
                onClick={async () => { await startSimulation(); notify('Simulation resumed.'); }}
              >
                <Play size={14} /> Resume Simulation
              </button>
            )}

            <button
              className="btn-pill btn-pill-dark"
              onClick={async () => { await resetSimulation(); notify('Simulation reset to baseline.'); }}
            >
              <RotateCcw size={14} /> Reset State
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Playback Frequency Multiplier:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                className={`btn-pill ${currentSpeed === s ? 'btn-pill-active' : 'btn-pill-dark'}`}
                onClick={() => handleSpeed(s)}
              >
                {s}x Speed
              </button>
            ))}
          </div>
        </div>

        {/* Card 2: Operating Mode Toggle */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#10B981" /> Operating Decision Mode
          </h3>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Current Mode: <strong style={{ color: currentMode === 'VAZHI_AI' ? '#34D399' : '#F59E0B' }}>
              {currentMode === 'VAZHI_AI' ? 'VAZHI-AI Adaptive Network Intelligence' : '30-Second Fixed-Time Isolated Baseline'}
            </strong>
          </p>

          <button className="btn-pill btn-pill-dark" onClick={handleToggleMode}>
            Switch Mode to {currentMode === 'VAZHI_AI' ? 'Fixed-Time' : 'Adaptive'}
          </button>
        </div>

        {/* Card 3: 1-Click Scenario Runner */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="#EF4444" /> 1-Click 12-Step Primary Scenario
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Executes the full showcase sequence: East buildup → Downstream saturation (90%+) → Ambulance A102 dispatch → Emergency corridor preemption wave → Starvation override → Hospital arrival.
          </p>
          <button
            className="btn-pill"
            onClick={async () => { await triggerDemoScenario(); notify('Emergency demonstration scenario launched.'); }}
            style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)', color: '#FFF' }}
          >
            <Zap size={14} /> Launch Scenario
          </button>
        </div>

        {/* Card 4: Manual Event Injection */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={16} color="#F97316" /> Direct Event Injections
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn-pill btn-pill-dark"
              onClick={async () => { await injectAmbulance('IN_J1_W', 'HOSPITAL'); notify('Ambulance A102 injected on J1 West Feeder.'); }}
              style={{ justifyContent: 'flex-start' }}
            >
              <Siren size={14} color="#EF4444" /> Dispatch Ambulance on West Feeder (J1 → Hospital)
            </button>

            <button
              className="btn-pill btn-pill-dark"
              onClick={async () => { await injectCongestion('ROAD_J2_J3', 25); notify('East Road ROAD_J2_J3 surged with 25 vehicles.'); }}
              style={{ justifyContent: 'flex-start' }}
            >
              <Flame size={14} color="#F97316" /> Surge East Road ROAD_J2_J3 to 90%+ Occupancy
            </button>

            <button
              className="btn-pill btn-pill-dark"
              onClick={async () => { await injectWaitingSurge('IN_J2_N', 75.0); notify('North approach waiting time surged to 75 seconds.'); }}
              style={{ justifyContent: 'flex-start' }}
            >
              <Clock size={14} color="#FBBF24" /> Surge North Approach Waiting Time to 75s (Starvation Test)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
