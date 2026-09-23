export type VehicleType = 'CAR' | 'BIKE' | 'BUS' | 'TRUCK' | 'AMBULANCE';

export type SignalColor = 'GREEN' | 'YELLOW' | 'RED';

export interface VehicleData {
  id: string;
  vehicle_type: VehicleType;
  current_road_id: string;
  current_intersection_id?: string;
  destination_node: string;
  position_m: number;
  speed_kmh: number;
  waiting_time_s: number;
  is_emergency: boolean;
  in_queue: boolean;
}

export interface ApproachData {
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  inflow_road: string;
  outflow_road: string;
  vehicle_count: number;
  pcu_count: number;
  queue_length: number;
  max_waiting_time: number;
  avg_waiting_time: number;
  has_emergency: boolean;
  downstream_occupancy: number;
  downstream_occupancy_pct: number;
  priority_score: number;
  signal_color: SignalColor;
}

export interface IntersectionData {
  id: string;
  name: string;
  coordinates: { x: number; y: number; lat?: number; lng?: number };
  current_phase: string;
  phase_duration: number;
  time_in_phase: number;
  time_remaining: number;
  signals: {
    NORTH: SignalColor;
    SOUTH: SignalColor;
    EAST: SignalColor;
    WEST: SignalColor;
  };
  total_phase_switches: number;
  last_decision?: DecisionData;
  approaches: Record<string, ApproachData>;
}

export interface RoadData {
  road_id: string;
  from_node: string;
  to_node: string;
  length_m: number;
  capacity_pcu: number;
  vehicle_count: number;
  pcu_count: number;
  occupancy: number;
  occupancy_pct: number;
  queue_length: number;
  avg_waiting_time: number;
  max_waiting_time: number;
  has_emergency: boolean;
  vehicles: VehicleData[];
}

export interface DecisionData {
  intersection: string;
  selected_phase: string;
  duration: number;
  reason: string[];
  next_planned_phase: string;
  emergency_override: boolean;
  timestamp: string;
}

export interface EmergencyData {
  ambulance_id: string;
  origin: string;
  current_location: string;
  destination: string;
  route_nodes: string[];
  route_display: string;
  route_roads: string[];
  intersections: string[];
  prepared_intersections: Record<string, {
    status: 'READY' | 'PREPARING' | 'PASSING' | 'RELEASED';
    step: number;
    ready: boolean;
    passed: boolean;
  }>;
  eta_seconds: number;
  total_distance_m: number;
  active: boolean;
  status: string;
}

export interface MetricsData {
  mode: 'VAZHI_AI' | 'FIXED_TIME';
  simulation_time_seconds: number;
  average_waiting_time: number;
  maximum_queue_length: number;
  average_queue_length: number;
  traffic_throughput: number;
  spillback_events: number;
  signal_switches: number;
  average_road_occupancy_pct: number;
  active_vehicle_count: number;
  emergency_vehicles_active: number;
}

export interface SpillbackData {
  road: string;
  occupancy: number;
  occupancy_pct: number;
  risk: number;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  should_hold: boolean;
  recommendation: string;
}

export interface TrafficFrame {
  simulation_time: number;
  is_running: boolean;
  is_paused: boolean;
  mode: 'VAZHI_AI' | 'FIXED_TIME';
  speed_multiplier?: number;
  metrics: MetricsData;
  intersections: Record<string, IntersectionData>;
  roads: Record<string, RoadData>;
  emergencies: Record<string, EmergencyData>;
  spillback: Record<string, SpillbackData>;
  recent_decisions: DecisionData[];
  vehicle_count: number;
  timestamp: string;
  scenario_step?: number;
  scenario_description?: string;
}

export interface NetworkTopology {
  network_id: string;
  name: string;
  intersections: {
    id: string;
    name: string;
    coordinates: { x: number; y: number };
    approaches: Record<string, { inflow_road: string; outflow_road: string }>;
  }[];
  roads: {
    road_id: string;
    from_node: string;
    to_node: string;
    length_m: number;
    capacity_pcu: number;
  }[];
  special_destinations: {
    id: string;
    name: string;
    coordinates: { x: number; y: number };
  }[];
}

export type NotificationCategory = 'ALL' | 'TRAFFIC' | 'EMERGENCY' | 'SIGNAL' | 'SYSTEM';
export type NotificationBadge = 'New' | 'High' | 'Info' | 'Resolved';

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  category: 'TRAFFIC' | 'EMERGENCY' | 'SIGNAL' | 'SYSTEM';
  badge: NotificationBadge;
  timestamp: string;
  timeAgo: string;
  targetId?: string; // intersection or road to focus
  targetType?: 'INTERSECTION' | 'ROAD' | 'EMERGENCY';
}

export interface FaultItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  location: string;
  targetId?: string;
  description: string;
  status: 'NEW' | 'ACTIVE' | 'RESOLVED';
  timestamp: string;
}
