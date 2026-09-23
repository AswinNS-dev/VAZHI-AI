import { create } from 'zustand';
import type {
  TrafficFrame,
  NetworkTopology,
  NotificationItem,
  FaultItem,
  VehicleData,
  RoadData,
  NotificationCategory
} from '../types/traffic';

export type NavTab = 'monitor' | 'faults' | 'control' | 'configuration' | 'automation' | 'system' | 'help';

interface TrafficStore {
  frame: TrafficFrame | null;
  network: NetworkTopology | null;
  isConnected: boolean;
  lastUpdated: number;
  speed: number;
  scenario: string;

  activeNavTab: NavTab;
  is3D: boolean;
  searchQuery: string;
  isNotificationsOpen: boolean;
  notificationFilter: NotificationCategory;
  notifications: NotificationItem[];
  faults: FaultItem[];

  selectedJunctionId: string;
  selectedRoadId: string | null;
  selectedVehicle: VehicleData | null;

  isComparisonOpen: boolean;
  isInjectionOpen: boolean;

  // Actions
  setFrame: (frame: TrafficFrame) => void;
  setNetwork: (network: NetworkTopology) => void;
  setConnected: (connected: boolean) => void;
  setActiveNavTab: (tab: NavTab) => void;
  setIs3D: (is3d: boolean) => void;
  setSearchQuery: (query: string) => void;
  setIsNotificationsOpen: (open: boolean) => void;
  setNotificationFilter: (filter: NotificationCategory) => void;
  setSelectedJunctionId: (id: string) => void;
  setSelectedRoadId: (id: string | null) => void;
  setSelectedVehicle: (vehicle: VehicleData | null) => void;
  setIsComparisonOpen: (open: boolean) => void;
  setIsInjectionOpen: (open: boolean) => void;
  setSpeed: (speed: number) => void;
  setScenario: (scenario: string) => void;
  resolveFault: (faultId: string) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Downstream Congestion',
    detail: 'J2 → J3 road occupancy critical (92%). Upstream hold activated.',
    category: 'TRAFFIC',
    badge: 'High',
    timestamp: '14:30:12',
    timeAgo: '2m ago',
    targetId: 'ROAD_J2_J3',
    targetType: 'ROAD'
  },
  {
    id: 'notif-2',
    title: 'Signal Phase Changed',
    detail: 'Junction J2 shifted to WEST_PRIORITY (18s duration).',
    category: 'SIGNAL',
    badge: 'Info',
    timestamp: '14:31:05',
    timeAgo: '3m ago',
    targetId: 'J2',
    targetType: 'INTERSECTION'
  },
  {
    id: 'notif-3',
    title: 'System Telemetry Synced',
    detail: 'FastAPI and WebSocket connection established at 1 Hz.',
    category: 'SYSTEM',
    badge: 'Resolved',
    timestamp: '14:32:00',
    timeAgo: '5m ago'
  }
];

const INITIAL_FAULTS: FaultItem[] = [
  {
    id: 'fault-1',
    severity: 'CRITICAL',
    location: 'ROAD_J2_J3',
    targetId: 'ROAD_J2_J3',
    description: 'Downstream occupancy exceeded 90% threshold. Spillback risk critical.',
    status: 'ACTIVE',
    timestamp: '14:30:12'
  },
  {
    id: 'fault-2',
    severity: 'WARNING',
    location: 'J2 North Inflow',
    targetId: 'J2',
    description: 'North approach waiting time exceeded 60s starvation limit (74s).',
    status: 'ACTIVE',
    timestamp: '14:31:20'
  },
  {
    id: 'fault-3',
    severity: 'INFO',
    location: 'Controller J4',
    targetId: 'J4',
    description: 'Controller operating within standard low-demand baseline cycle.',
    status: 'RESOLVED',
    timestamp: '14:28:40'
  }
];

export const useTrafficStore = create<TrafficStore>((set, get) => ({
  frame: null,
  network: null,
  isConnected: false,
  lastUpdated: Date.now(),
  speed: 1.0,
  scenario: 'Normal Traffic',

  activeNavTab: 'monitor',
  is3D: true, // Start in modern 3D isometric view as depicted in reference!
  searchQuery: '',
  isNotificationsOpen: true,
  notificationFilter: 'ALL',
  notifications: INITIAL_NOTIFICATIONS,
  faults: INITIAL_FAULTS,

  selectedJunctionId: 'J3',
  selectedRoadId: null,
  selectedVehicle: null,

  isComparisonOpen: false,
  isInjectionOpen: false,

  setFrame: (frame) => {
    const prev = get();
    const newNotifications = [...prev.notifications];
    const newFaults = [...prev.faults];

    // Check for active emergencies to add real event notifications
    const activeEmergencies = Object.values(frame.emergencies || {}).filter((e) => e.active);
    if (activeEmergencies.length > 0) {
      const amb = activeEmergencies[0];
      const notifId = `amb-${amb.ambulance_id}-${frame.simulation_time}`;
      if (!newNotifications.some((n) => n.title.includes(amb.ambulance_id))) {
        newNotifications.unshift({
          id: notifId,
          title: 'Ambulance Detected',
          detail: `${amb.ambulance_id} dispatched towards ${amb.destination}. Route: ${amb.route_display || 'J1 → J2 → J3 → HOSPITAL'}`,
          category: 'EMERGENCY',
          badge: 'New',
          timestamp: new Date().toLocaleTimeString(),
          timeAgo: 'Just now',
          targetId: amb.current_location,
          targetType: 'EMERGENCY'
        });
      }
    }

    // Check for recent decision
    if (frame.recent_decisions && frame.recent_decisions.length > 0) {
      const latestDec = frame.recent_decisions[0];
      const decId = `dec-${latestDec.intersection}-${latestDec.timestamp}`;
      if (!newNotifications.some((n) => n.id === decId)) {
        newNotifications.unshift({
          id: decId,
          title: `Signal: ${latestDec.intersection}`,
          detail: `Selected ${latestDec.selected_phase} (${latestDec.duration}s). ${latestDec.reason?.[0] || ''}`,
          category: 'SIGNAL',
          badge: latestDec.emergency_override ? 'New' : 'Info',
          timestamp: latestDec.timestamp?.slice(11, 19) || 'Live',
          timeAgo: 'Just now',
          targetId: latestDec.intersection,
          targetType: 'INTERSECTION'
        });
      }
    }

    // Check for critical spillback in roads to register faults
    Object.entries(frame.roads || {}).forEach(([roadId, road]) => {
      if (road.occupancy_pct >= 85) {
        if (!newFaults.some((f) => f.location === roadId && f.status === 'ACTIVE')) {
          newFaults.unshift({
            id: `fault-${roadId}-${frame.simulation_time}`,
            severity: 'CRITICAL',
            location: roadId,
            targetId: roadId,
            description: `Road occupancy at ${Math.round(road.occupancy_pct)}%. Potential cross-box spillback lockup.`,
            status: 'ACTIVE',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
    });

    set({
      frame,
      lastUpdated: Date.now(),
      speed: frame.speed_multiplier || prev.speed,
      notifications: newNotifications.slice(0, 50),
      faults: newFaults.slice(0, 30)
    });
  },

  setNetwork: (network) => set({ network }),
  setConnected: (isConnected) => set({ isConnected }),
  setActiveNavTab: (activeNavTab) => set({ activeNavTab }),
  setIs3D: (is3D) => set({ is3D }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsNotificationsOpen: (isNotificationsOpen) => set({ isNotificationsOpen }),
  setNotificationFilter: (notificationFilter) => set({ notificationFilter }),
  setSelectedJunctionId: (selectedJunctionId) => set({ selectedJunctionId }),
  setSelectedRoadId: (selectedRoadId) => set({ selectedRoadId }),
  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle }),
  setIsComparisonOpen: (isComparisonOpen) => set({ isComparisonOpen }),
  setIsInjectionOpen: (isInjectionOpen) => set({ isInjectionOpen }),
  setSpeed: (speed) => set({ speed }),
  setScenario: (scenario) => set({ scenario }),
  resolveFault: (faultId) =>
    set((state) => ({
      faults: state.faults.map((f) => (f.id === faultId ? { ...f, status: 'RESOLVED' } : f))
    }))
}));
