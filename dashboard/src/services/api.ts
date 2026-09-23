import type { TrafficFrame, MetricsData, DecisionData, NetworkTopology } from '../types/traffic';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function fetchNetwork(): Promise<NetworkTopology> {
  const res = await fetch(`${BASE_URL}/network`);
  if (!res.ok) throw new Error('Failed to fetch network topology');
  return res.json();
}

export async function fetchTrafficState(): Promise<TrafficFrame> {
  const res = await fetch(`${BASE_URL}/traffic`);
  if (!res.ok) throw new Error('Failed to fetch traffic state');
  return res.json();
}

export async function fetchMetrics(): Promise<MetricsData> {
  const res = await fetch(`${BASE_URL}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchDecisions(): Promise<DecisionData[]> {
  const res = await fetch(`${BASE_URL}/decisions`);
  if (!res.ok) throw new Error('Failed to fetch decisions');
  return res.json();
}

export async function startSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/start`, { method: 'POST' });
  return res.json();
}

export async function pauseSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation(): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function setSimulationMode(mode: 'VAZHI_AI' | 'FIXED_TIME'): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  return res.json();
}

export async function setSimulationSpeed(speed: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/speed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speed })
  });
  return res.json();
}

export async function triggerDemoScenario(): Promise<any> {
  const res = await fetch(`${BASE_URL}/simulation/demo-scenario`, { method: 'POST' });
  return res.json();
}

export async function injectAmbulance(origin_road = 'IN_J1_W', destination_node = 'HOSPITAL'): Promise<any> {
  const res = await fetch(`${BASE_URL}/events/ambulance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_road, destination_node })
  });
  return res.json();
}

export async function injectCongestion(road_id: string, vehicle_count = 25): Promise<any> {
  const res = await fetch(`${BASE_URL}/events/congestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ road_id, vehicle_count })
  });
  return res.json();
}

export async function injectWaitingSurge(road_id: string, seconds = 75.0): Promise<any> {
  const res = await fetch(`${BASE_URL}/events/traffic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ road_id, seconds })
  });
  return res.json();
}

export async function fetchConfig(): Promise<any> {
  const res = await fetch(`${BASE_URL}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(config: any): Promise<any> {
  const res = await fetch(`${BASE_URL}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}
