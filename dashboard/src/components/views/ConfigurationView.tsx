import React, { useState, useEffect } from 'react';
import { fetchConfig, updateConfig } from '../../services/api';
import { Settings, Save, Check, RefreshCw } from 'lucide-react';

export const ConfigurationView: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form state
  const [minGreen, setMinGreen] = useState(10);
  const [maxGreen, setMaxGreen] = useState(45);
  const [yellowSecs, setYellowSecs] = useState(3);
  const [allRedSecs, setAllRedSecs] = useState(2);
  const [starvationThreshold, setStarvationThreshold] = useState(60);

  const [demandWeight, setDemandWeight] = useState(0.30);
  const [queueWeight, setQueueWeight] = useState(0.20);
  const [waitingWeight, setWaitingWeight] = useState(0.15);
  const [emergencyWeight, setEmergencyWeight] = useState(0.25);
  const [downstreamWeight, setDownstreamWeight] = useState(0.10);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
      if (data.signal_timing) {
        setMinGreen(data.signal_timing.min_green_seconds || 10);
        setMaxGreen(data.signal_timing.max_green_seconds || 45);
        setYellowSecs(data.signal_timing.yellow_seconds || 3);
        setAllRedSecs(data.signal_timing.all_red_seconds || 2);
      }
      if (data.starvation) {
        setStarvationThreshold(data.starvation.starvation_threshold_seconds || 60);
      }
      if (data.scoring_weights) {
        setDemandWeight(data.scoring_weights.demand_weight ?? 0.30);
        setQueueWeight(data.scoring_weights.queue_weight ?? 0.20);
        setWaitingWeight(data.scoring_weights.waiting_weight ?? 0.15);
        setEmergencyWeight(data.scoring_weights.emergency_weight ?? 0.25);
        setDownstreamWeight(data.scoring_weights.downstream_congestion_weight ?? 0.10);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateConfig({
        signal_timing: {
          min_green_seconds: Number(minGreen),
          max_green_seconds: Number(maxGreen),
          yellow_seconds: Number(yellowSecs),
          all_red_seconds: Number(allRedSecs),
        },
        starvation: {
          starvation_threshold_seconds: Number(starvationThreshold),
        },
        scoring_weights: {
          demand_weight: Number(demandWeight),
          queue_weight: Number(queueWeight),
          waiting_weight: Number(waitingWeight),
          emergency_weight: Number(emergencyWeight),
          downstream_congestion_weight: Number(downstreamWeight),
        },
      });
      setStatusMsg('Configuration successfully updated and synced with backend.');
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error updating configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-app)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
            Traffic Optimization Configuration
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Configure signal boundaries, safety intervals, starvation triggers, and priority scoring weights.
          </p>
        </div>

        {statusMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34D399',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Check size={14} /> {statusMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Signal Timing & Safety */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '14px' }}>
            Signal Boundaries & Interlock Safety Timings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Minimum Green (s)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={minGreen}
                onChange={(e) => setMinGreen(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0B1220',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#FFF',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Maximum Green (s)
              </label>
              <input
                type="number"
                min="20"
                max="120"
                value={maxGreen}
                onChange={(e) => setMaxGreen(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0B1220',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#FFF',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Yellow Clearance (s)
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={yellowSecs}
                onChange={(e) => setYellowSecs(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0B1220',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#FFF',
                  fontSize: '13px',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Starvation Threshold (s)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                value={starvationThreshold}
                onChange={(e) => setStarvationThreshold(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: '#0B1220',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#FFF',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Priority Formula Weights */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFF', marginBottom: '8px' }}>
            Multi-Factor Priority Scoring Formula
          </h3>
          <p style={{ fontSize: '12px', color: '#38BDF8', fontFamily: 'monospace', marginBottom: '16px' }}>
            Priority Score = (w_demand · D) + (w_queue · Q) + (w_wait · W) + (w_emerg · E) - (w_down · C_down) + StarvationBoost
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Demand Weight ({Math.round(demandWeight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={demandWeight}
                onChange={(e) => setDemandWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Queue Weight ({Math.round(queueWeight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={queueWeight}
                onChange={(e) => setQueueWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Waiting Weight ({Math.round(waitingWeight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={waitingWeight}
                onChange={(e) => setWaitingWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Emergency Weight ({Math.round(emergencyWeight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={emergencyWeight}
                onChange={(e) => setEmergencyWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Downstream Penalty ({Math.round(downstreamWeight * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={downstreamWeight}
                onChange={(e) => setDownstreamWeight(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="btn-pill btn-pill-dark"
            onClick={loadConfig}
          >
            <RefreshCw size={13} /> Reset to Defaults
          </button>
          <button
            type="submit"
            className="btn-pill btn-pill-green"
            disabled={saving}
          >
            <Save size={13} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
