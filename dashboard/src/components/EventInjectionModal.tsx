import React, { useState } from 'react';
import { useTrafficStore } from '../store/trafficStore';
import { injectAmbulance, injectCongestion, injectWaitingSurge } from '../services/api';
import { X, Siren, Flame, Clock, Car, Check } from 'lucide-react';

export const EventInjectionModal: React.FC = () => {
  const isInjectionOpen = useTrafficStore((s) => s.isInjectionOpen);
  const setIsInjectionOpen = useTrafficStore((s) => s.setIsInjectionOpen);

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isInjectionOpen) return null;

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInjectAmbulance = async (origin: string) => {
    try {
      setLoading(true);
      await injectAmbulance(origin, 'HOSPITAL');
      showNotification(`Ambulance dispatched on ${origin} → HOSPITAL`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectCongestion = async (roadId: string, count: number) => {
    try {
      setLoading(true);
      await injectCongestion(roadId, count);
      showNotification(`Congestion injected: +${count} vehicles on ${roadId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInjectWaiting = async (roadId: string, seconds: number) => {
    try {
      setLoading(true);
      await injectWaitingSurge(roadId, seconds);
      showNotification(`Waiting surge: +${seconds}s on ${roadId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsInjectionOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
              MANUAL SIMULATION EVENT INJECTION
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Inject real events into the microscopic simulator and watch AI adapt
            </span>
          </div>
          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => setIsInjectionOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {message && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={14} /> {message}
            </div>
          )}

          {/* 1. Ambulance Dispatch */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Siren size={16} color="#EF4444" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                1. Dispatch Emergency Ambulance
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Spawns an ambulance and activates the NetworkX Dijkstra emergency green wave to Government Hospital.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-danger"
                disabled={loading}
                onClick={() => handleInjectAmbulance('IN_J1_W')}
                style={{ fontSize: '11px' }}
              >
                🚑 Dispatch West Feeder (J1)
              </button>
              <button
                className="btn btn-danger"
                disabled={loading}
                onClick={() => handleInjectAmbulance('IN_J2_N')}
                style={{ fontSize: '11px' }}
              >
                🚑 Dispatch North Feeder (J2)
              </button>
            </div>
          </div>

          {/* 2. Downstream Spillback Surge */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Flame size={16} color="#F97316" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                2. Trigger Downstream Congestion
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Surges East road (ROAD_J2_J3) to 90%+ occupancy to test spillback hold and upstream release throttling.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-outline"
                disabled={loading}
                onClick={() => handleInjectCongestion('ROAD_J2_J3', 25)}
                style={{ fontSize: '11px' }}
              >
                🔥 Surge East Road ROAD_J2_J3 (+25 veh)
              </button>
              <button
                className="btn btn-outline"
                disabled={loading}
                onClick={() => handleInjectCongestion('ROAD_J1_J2', 20)}
                style={{ fontSize: '11px' }}
              >
                🔥 Surge Central ROAD_J1_J2 (+20 veh)
              </button>
            </div>
          </div>

          {/* 3. Starvation Waiting Surge */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Clock size={16} color="#FBBF24" />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>
                3. Trigger Queue Starvation
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Artificially increases North approach wait time to 75s+ to trigger dynamic starvation escalation override.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-outline"
                disabled={loading}
                onClick={() => handleInjectWaiting('IN_J2_N', 75.0)}
                style={{ fontSize: '11px' }}
              >
                ⏱️ Set North J2 Waiting to 75s (Starve)
              </button>
              <button
                className="btn btn-outline"
                disabled={loading}
                onClick={() => handleInjectWaiting('IN_J1_N', 80.0)}
                style={{ fontSize: '11px' }}
              >
                ⏱️ Set North J1 Waiting to 80s
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
