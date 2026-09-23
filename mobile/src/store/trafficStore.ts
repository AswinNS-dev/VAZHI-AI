import { create } from 'zustand';
import { TrafficFrame, MetricsData } from '../types/traffic';

export type ConnectionStatus = 'LIVE' | 'CONNECTING' | 'CONNECTION LOST';

interface TrafficStore {
  frame: TrafficFrame | null;
  connectionStatus: ConnectionStatus;
  lastUpdatedTime: number | null;
  selectedJunctionId: string;
  isControlsVisible: boolean;
  fixedTimeBaseline: MetricsData | null;
  vazhiAiMetrics: MetricsData | null;

  setFrame: (frame: TrafficFrame) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSelectedJunctionId: (id: string) => void;
  setControlsVisible: (visible: boolean) => void;
}

export const useTrafficStore = create<TrafficStore>((set, get) => ({
  frame: null,
  connectionStatus: 'CONNECTING',
  lastUpdatedTime: null,
  selectedJunctionId: 'J2',
  isControlsVisible: false,
  fixedTimeBaseline: {
    mode: 'FIXED_TIME',
    simulation_time_seconds: 120,
    average_waiting_time: 48.6,
    maximum_queue_length: 29,
    average_queue_length: 16.4,
    traffic_throughput: 24,
    spillback_events: 5,
    signal_switches: 8,
    average_road_occupancy_pct: 78.5,
    active_vehicle_count: 52,
    emergency_vehicles_active: 1
  },
  vazhiAiMetrics: null,

  setFrame: (frame: TrafficFrame) => {
    const isVazhi = frame.mode === 'VAZHI_AI';
    set({
      frame,
      lastUpdatedTime: Date.now(),
      connectionStatus: 'LIVE',
      vazhiAiMetrics: isVazhi ? frame.metrics : get().vazhiAiMetrics,
      fixedTimeBaseline: !isVazhi ? frame.metrics : get().fixedTimeBaseline
    });
  },

  setConnectionStatus: (status: ConnectionStatus) => set({ connectionStatus: status }),
  setSelectedJunctionId: (id: string) => set({ selectedJunctionId: id }),
  setControlsVisible: (visible: boolean) => set({ isControlsVisible: visible })
}));
