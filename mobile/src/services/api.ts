import { TrafficFrame, MetricsData, DecisionData } from '../types/traffic';
import { Platform } from 'react-native';

// Standard local IP configuration or configurable environment variables
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${HOST}:8000/api`;
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || `ws://${HOST}:8000/ws/traffic`;

export async function fetchTrafficState(): Promise<TrafficFrame> {
  const res = await fetch(`${API_BASE_URL}/traffic`);
  if (!res.ok) throw new Error('Failed to fetch traffic state');
  return res.json();
}

export async function fetchMetrics(): Promise<MetricsData> {
  const res = await fetch(`${API_BASE_URL}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchDecisions(): Promise<DecisionData[]> {
  const res = await fetch(`${API_BASE_URL}/decisions`);
  if (!res.ok) throw new Error('Failed to fetch decisions');
  return res.json();
}

export async function startSimulation(): Promise<void> {
  await fetch(`${API_BASE_URL}/simulation/start`, { method: 'POST' });
}

export async function pauseSimulation(): Promise<void> {
  await fetch(`${API_BASE_URL}/simulation/pause`, { method: 'POST' });
}

export async function resetSimulation(): Promise<void> {
  await fetch(`${API_BASE_URL}/simulation/reset`, { method: 'POST' });
}

export async function setSimulationMode(mode: 'VAZHI_AI' | 'FIXED_TIME'): Promise<void> {
  await fetch(`${API_BASE_URL}/simulation/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
}

export async function triggerDemoScenario(): Promise<void> {
  await fetch(`${API_BASE_URL}/simulation/demo-scenario`, { method: 'POST' });
}

export async function injectAmbulance(origin_road = 'IN_J1_W', destination_node = 'HOSPITAL'): Promise<void> {
  await fetch(`${API_BASE_URL}/events/ambulance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin_road, destination_node })
  });
}

export async function injectCongestion(road_id = 'ROAD_J1_J2', vehicle_count = 25): Promise<void> {
  await fetch(`${API_BASE_URL}/events/congestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ road_id, vehicle_count })
  });
}

export async function injectWaitingTime(road_id = 'IN_J2_N', seconds = 75.0): Promise<void> {
  await fetch(`${API_BASE_URL}/events/traffic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ road_id, seconds })
  });
}
