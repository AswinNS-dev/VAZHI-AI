import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect, Text as SvgText, G } from 'react-native-svg';
import { TrafficFrame, IntersectionData, RoadData } from '../types/traffic';
import { useTrafficStore } from '../store/trafficStore';

interface NetworkMapProps {
  frame: TrafficFrame | null;
  onSelectJunction?: (id: string) => void;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ frame, onSelectJunction }) => {
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);

  // Scaled coordinates for clean canvas presentation (viewBox: 0 0 420 340)
  const nodeCoords: Record<string, { x: number; y: number; label: string; isHospital?: boolean }> = {
    ENTRY_W: { x: 20, y: 150, label: 'W Feeder' },
    J1: { x: 90, y: 150, label: 'J1' },
    J2: { x: 190, y: 150, label: 'J2 (Hub)' },
    J3: { x: 290, y: 150, label: 'J3' },
    HOSPITAL: { x: 375, y: 150, label: '🏥 Hospital', isHospital: true },
    J4: { x: 190, y: 260, label: 'J4' },
    ENTRY_J2_N: { x: 190, y: 45, label: 'N Feeder' },
    EXIT_J4_S: { x: 190, y: 315, label: 'S Feeder' },
  };

  const roads = frame?.roads || {};
  const intersections = frame?.intersections || {};
  const emergencies = frame?.emergencies || {};
  const activeEmergency = Object.values(emergencies).find((e) => e.active);

  const getRoadColor = (roadId: string): string => {
    const r = roads[roadId];
    if (!r) return '#334155';
    if (r.occupancy >= 0.85) return '#EF4444'; // Critical Red
    if (r.occupancy >= 0.70) return '#F97316'; // High Orange
    if (r.occupancy >= 0.40) return '#FBBF24'; // Moderate Yellow
    return '#10B981'; // Low Green
  };

  const isCorridorActiveOnRoad = (roadId: string): boolean => {
    if (!activeEmergency) return false;
    return activeEmergency.route_roads.includes(roadId);
  };

  const handleJunctionPress = (id: string) => {
    setSelectedJunctionId(id);
    if (onSelectJunction) onSelectJunction(id);
  };

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 420 340" style={styles.svg}>
        {/* Background Grid Accent Lines */}
        <Line x1="10" y1="150" x2="410" y2="150" stroke="#1E293B" strokeWidth="20" strokeLinecap="round" />
        <Line x1="190" y1="35" x2="190" y2="320" stroke="#1E293B" strokeWidth="20" strokeLinecap="round" />

        {/* Major Road Links */}
        {/* W Feeder -> J1 */}
        <Line x1="20" y1="150" x2="90" y2="150" stroke={getRoadColor('IN_J1_W')} strokeWidth="4" />
        {/* J1 -> J2 */}
        <Line
          x1="90" y1="147" x2="190" y2="147"
          stroke={isCorridorActiveOnRoad('ROAD_J1_J2') ? '#38BDF8' : getRoadColor('ROAD_J1_J2')}
          strokeWidth={isCorridorActiveOnRoad('ROAD_J1_J2') ? '6' : '4'}
        />
        {/* J2 -> J3 */}
        <Line
          x1="190" y1="147" x2="290" y2="147"
          stroke={isCorridorActiveOnRoad('ROAD_J2_J3') ? '#38BDF8' : getRoadColor('ROAD_J2_J3')}
          strokeWidth={isCorridorActiveOnRoad('ROAD_J2_J3') ? '6' : '4'}
        />
        {/* J3 -> Hospital */}
        <Line
          x1="290" y1="147" x2="375" y2="147"
          stroke={isCorridorActiveOnRoad('ROAD_J3_HOSP') ? '#38BDF8' : getRoadColor('ROAD_J3_HOSP')}
          strokeWidth={isCorridorActiveOnRoad('ROAD_J3_HOSP') ? '6' : '4'}
        />

        {/* J2 <-> J4 Vertical Corridor */}
        <Line x1="190" y1="150" x2="190" y2="260" stroke={getRoadColor('ROAD_J2_J4')} strokeWidth="4" />
        {/* J2 North Feeder */}
        <Line x1="190" y1="45" x2="190" y2="150" stroke={getRoadColor('IN_J2_N')} strokeWidth="4" />
        {/* J4 South Feeder */}
        <Line x1="190" y1="260" x2="190" y2="315" stroke={getRoadColor('IN_J4_S')} strokeWidth="4" />

        {/* Moving Vehicles along Roads */}
        {Object.values(roads).flatMap((road) =>
          road.vehicles.map((v) => {
            let start = nodeCoords[road.from_node] || { x: 50, y: 150 };
            let end = nodeCoords[road.to_node] || { x: 190, y: 150 };
            const progress = Math.min(1.0, Math.max(0.0, v.position_m / Math.max(1, road.length_m)));
            const vx = start.x + (end.x - start.x) * progress;
            const vy = start.y + (end.y - start.y) * progress;

            if (v.is_emergency) {
              return (
                <G key={v.id}>
                  <Circle cx={vx} cy={vy} r="9" fill="#EF4444" opacity="0.4" />
                  <Circle cx={vx} cy={vy} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                  <SvgText x={vx - 6} y={vy - 8} fill="#EF4444" fontSize="9" fontWeight="bold">🚑</SvgText>
                </G>
              );
            }

            return (
              <Circle
                key={v.id}
                cx={vx}
                cy={vy}
                r={v.vehicle_type === 'BUS' || v.vehicle_type === 'TRUCK' ? 3.5 : 2.5}
                fill={v.vehicle_type === 'BIKE' ? '#38BDF8' : '#F8FAFC'}
                opacity={0.85}
              />
            );
          })
        )}

        {/* Junction Nodes & Approach Signal Heads */}
        {['J1', 'J2', 'J3', 'J4'].map((jId) => {
          const coords = nodeCoords[jId];
          const isSelected = selectedJunctionId === jId;
          const jData = intersections[jId];
          const signals = jData?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };

          return (
            <G key={jId} onPress={() => handleJunctionPress(jId)}>
              {/* Pulse Ring for Selected */}
              {isSelected && (
                <Circle cx={coords.x} cy={coords.y} r="22" fill="#38BDF8" opacity="0.2" />
              )}

              {/* Node Center Circle */}
              <Circle
                cx={coords.x}
                cy={coords.y}
                r="15"
                fill={isSelected ? '#0284C7' : '#1E293B'}
                stroke={isSelected ? '#38BDF8' : '#475569'}
                strokeWidth="2.5"
              />

              {/* Signal Status Dots on 4 Approaches */}
              {/* North */}
              <Circle cx={coords.x} cy={coords.y - 10} r="2.5" fill={signals.NORTH === 'GREEN' ? '#10B981' : '#EF4444'} />
              {/* South */}
              <Circle cx={coords.x} cy={coords.y + 10} r="2.5" fill={signals.SOUTH === 'GREEN' ? '#10B981' : '#EF4444'} />
              {/* East */}
              <Circle cx={coords.x + 10} cy={coords.y} r="2.5" fill={signals.EAST === 'GREEN' ? '#10B981' : '#EF4444'} />
              {/* West */}
              <Circle cx={coords.x - 10} cy={coords.y} r="2.5" fill={signals.WEST === 'GREEN' ? '#10B981' : '#EF4444'} />

              {/* Label */}
              <SvgText
                x={coords.x}
                y={coords.y + 26}
                fill="#E2E8F0"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {jId}
              </SvgText>
            </G>
          );
        })}

        {/* Hospital Destination Landmark */}
        <G>
          <Rect x="350" y="132" width="50" height="36" rx="8" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
          <SvgText x="375" y="154" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">
            HOSPITAL
          </SvgText>
        </G>
      </Svg>

      {/* Map Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Low (&lt;40%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
          <Text style={styles.legendText}>Mod (40-70%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>High (70-85%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Critical (&gt;85%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
          <Text style={styles.legendText}>Corridor</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1329',
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    elevation: 3,
  },
  svg: {
    width: '100%',
    height: 230,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
});
