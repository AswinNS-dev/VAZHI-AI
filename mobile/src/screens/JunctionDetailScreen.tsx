import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';
import { SignalBadge } from '../components/SignalBadge';
import { SpillbackGauge } from '../components/SpillbackGauge';

export const JunctionDetailScreen: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const selectedJunctionId = useTrafficStore((s) => s.selectedJunctionId);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);

  const junctions = frame?.intersections || {};
  const currentJunction = junctions[selectedJunctionId] || junctions['J2'];
  const approaches = currentJunction?.approaches || {};
  const spillbackData = frame?.spillback || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Junction Selector Bar */}
      <View style={styles.selectorBar}>
        {['J1', 'J2', 'J3', 'J4'].map((jId) => (
          <TouchableOpacity
            key={jId}
            style={[styles.selectorTab, selectedJunctionId === jId && styles.selectorTabActive]}
            onPress={() => setSelectedJunctionId(jId)}
          >
            <Text style={[styles.selectorTabText, selectedJunctionId === jId && styles.selectorTabTextActive]}>
              {jId}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Junction Header Card */}
      {currentJunction && (
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTitle}>{currentJunction.name}</Text>
              <Text style={styles.heroSub}>ID: {currentJunction.id} • Coordinated Node</Text>
            </View>
            <View style={styles.phasePill}>
              <Text style={styles.phasePillText}>{currentJunction.current_phase.replace('_', ' ')}</Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>{currentJunction.time_remaining}s</Text>
              <Text style={styles.heroStatLbl}>Time Remaining</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>{currentJunction.phase_duration}s</Text>
              <Text style={styles.heroStatLbl}>Phase Duration</Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatVal}>{currentJunction.total_phase_switches}</Text>
              <Text style={styles.heroStatLbl}>Total Switches</Text>
            </View>
          </View>
        </View>
      )}

      {/* Latest AI Decision Reason */}
      {currentJunction?.last_decision && (
        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <Text style={styles.decisionTitle}>🧠 Current AI Decision Analysis</Text>
            <Text style={styles.decisionTime}>{currentJunction.last_decision.timestamp}</Text>
          </View>
          {currentJunction.last_decision.reason.map((r, i) => (
            <View key={i} style={styles.decisionBulletRow}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.decisionText}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4 Approach Breakdown Cards */}
      <Text style={styles.sectionHeader}>APPROACHES BREAKDOWN</Text>

      {['NORTH', 'EAST', 'SOUTH', 'WEST'].map((dir) => {
        const app = approaches[dir];
        if (!app) return null;
        const outflowSpillback = spillbackData[app.outflow_road];

        return (
          <View key={dir} style={styles.approachCard}>
            <View style={styles.approachHeader}>
              <View style={styles.dirRow}>
                <Text style={styles.dirName}>{dir} APPROACH</Text>
                {app.has_emergency && (
                  <View style={styles.emergencyTag}>
                    <Text style={styles.emergencyTagText}>🚨 AMBULANCE</Text>
                  </View>
                )}
              </View>
              <SignalBadge color={app.signal_color} label={app.signal_color} />
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCell}>
                <Text style={styles.metricVal}>{app.vehicle_count}</Text>
                <Text style={styles.metricLbl}>Vehicles ({app.pcu_count} PCU)</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricVal}>{app.queue_length}</Text>
                <Text style={styles.metricLbl}>Queue Length</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricVal}>{Math.round(app.max_waiting_time)}s</Text>
                <Text style={styles.metricLbl}>Max Waiting</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={[styles.metricVal, { color: '#38BDF8' }]}>
                  {app.priority_score.toFixed(2)}
                </Text>
                <Text style={styles.metricLbl}>Priority Score</Text>
              </View>
            </View>

            {/* Downstream Spillback Gauge */}
            {outflowSpillback && (
              <SpillbackGauge
                occupancyPct={outflowSpillback.occupancy_pct}
                risk={outflowSpillback.risk}
                status={outflowSpillback.status}
                shouldHold={outflowSpillback.should_hold}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  content: {
    paddingBottom: 40,
  },
  selectorBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 8,
  },
  selectorTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  selectorTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  selectorTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
  },
  selectorTabTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  heroSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  phasePill: {
    backgroundColor: '#0284C722',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  phasePillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatVal: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  heroStatLbl: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  decisionCard: {
    backgroundColor: '#131D31',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  decisionTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  decisionTime: {
    color: '#64748B',
    fontSize: 11,
  },
  decisionBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bullet: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    marginRight: 6,
    lineHeight: 18,
  },
  decisionText: {
    color: '#E2E8F0',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  approachCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  approachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dirRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dirName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  emergencyTag: {
    backgroundColor: '#EF444422',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  emergencyTagText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
  },
  metricCell: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  metricLbl: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
