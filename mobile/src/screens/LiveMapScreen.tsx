import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';
import { NetworkMap } from '../components/NetworkMap';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { SignalBadge } from '../components/SignalBadge';

interface LiveMapScreenProps {
  onNavigateToJunction?: (id: string) => void;
}

export const LiveMapScreen: React.FC<LiveMapScreenProps> = ({ onNavigateToJunction }) => {
  const frame = useTrafficStore((s) => s.frame);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setControlsVisible = useTrafficStore((s) => s.setControlsVisible);

  const selectedJunction = frame?.intersections[selectedJunctionId];
  const activeEmergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Traffic Map</Text>
          <Text style={styles.subtitle}>Tamil Nadu Prototype Network</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.simBtn}
            onPress={() => setControlsVisible(true)}
          >
            <Text style={styles.simBtnText}>COMMANDS ⚡</Text>
          </TouchableOpacity>
          <ConnectionBadge />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Interactive Network Map Component */}
        <NetworkMap
          frame={frame}
          onSelectJunction={(id) => onNavigateToJunction && onNavigateToJunction(id)}
        />

        {/* Selected Junction Live Inspector Card */}
        {selectedJunction && (
          <View style={styles.inspectorCard}>
            <View style={styles.inspectorHeader}>
              <View>
                <Text style={styles.inspectorTitle}>{selectedJunction.name} ({selectedJunction.id})</Text>
                <Text style={styles.phaseLabel}>
                  Current Phase: <Text style={styles.phaseValue}>{selectedJunction.current_phase.replace('_', ' ')}</Text>
                </Text>
              </View>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{selectedJunction.time_remaining}s</Text>
                <Text style={styles.timerLabel}>REMAINING</Text>
              </View>
            </View>

            {/* Approaches Mini-Summary */}
            <View style={styles.approachRow}>
              {['NORTH', 'EAST', 'SOUTH', 'WEST'].map((dir) => {
                const app = selectedJunction.approaches[dir];
                const signal = selectedJunction.signals[dir as keyof typeof selectedJunction.signals];
                return (
                  <View key={dir} style={styles.approachCol}>
                    <SignalBadge color={signal} label={dir.substring(0, 1)} />
                    <Text style={styles.approachCount}>{app?.vehicle_count ?? 0} veh</Text>
                    <Text style={styles.approachWait}>{Math.round(app?.max_waiting_time ?? 0)}s wait</Text>
                  </View>
                );
              })}
            </View>

            {/* Last Decision Explanation Snippet */}
            {selectedJunction.last_decision && (
              <View style={styles.decisionSnippet}>
                <Text style={styles.decisionSnippetTitle}>🧠 AI Rationale:</Text>
                <Text style={styles.decisionSnippetText}>
                  {selectedJunction.last_decision.reason[0] || 'Optimized for current demand'}
                </Text>
              </View>
            )}

            {onNavigateToJunction && (
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => onNavigateToJunction(selectedJunctionId)}
              >
                <Text style={styles.detailBtnText}>OPEN FULL JUNCTION DETAILS ➔</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Active Emergency Info if exists */}
        {activeEmergencies.length > 0 && (
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyTitle}>🚨 Active Emergency: {activeEmergencies[0].ambulance_id}</Text>
              <Text style={styles.emergencyEta}>ETA: {activeEmergencies[0].eta_seconds}s</Text>
            </View>
            <Text style={styles.emergencyRoute}>
              Corridor Path: {activeEmergencies[0].route_display}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  simBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inspectorCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inspectorTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  phaseLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  phaseValue: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  timerBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF844',
  },
  timerValue: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
  },
  timerLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
  },
  approachRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  approachCol: {
    alignItems: 'center',
    flex: 1,
  },
  approachCount: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  approachWait: {
    color: '#64748B',
    fontSize: 10,
  },
  decisionSnippet: {
    backgroundColor: '#0F172A88',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  decisionSnippetTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  decisionSnippetText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  detailBtn: {
    backgroundColor: '#0284C722',
    borderColor: '#0284C7',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  emergencyCard: {
    backgroundColor: '#DC262622',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyTitle: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  emergencyEta: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  emergencyRoute: {
    color: '#FCA5A5',
    fontSize: 11,
    marginTop: 4,
  },
});
