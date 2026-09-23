import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';
import { ConnectionBadge } from '../components/ConnectionBadge';
import { EmergencyBanner } from '../components/EmergencyBanner';

interface HomeScreenProps {
  onNavigateTab: (tabKey: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab }) => {
  const frame = useTrafficStore((s) => s.frame);
  const setControlsVisible = useTrafficStore((s) => s.setControlsVisible);

  const metrics = frame?.metrics;
  const emergencies = frame?.emergencies || {};
  const activeEmergenciesCount = Object.values(emergencies).filter((e) => e.active).length;

  const intersections = frame?.intersections || {};
  const congestedJunctionsCount = Object.values(intersections).filter((j) =>
    Object.values(j.approaches).some((app) => app.downstream_occupancy >= 0.70 || app.queue_length > 15)
  ).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>VAZHI-AI</Text>
          <Text style={styles.brandSubtitle}>Real-Time Traffic & Emergency Intelligence</Text>
        </View>
        <ConnectionBadge />
      </View>

      {/* Prototype Network Disclaimer */}
      <View style={styles.disclaimerPill}>
        <Text style={styles.disclaimerText}>
          PROTOTYPE / SIMULATION NETWORK • TAMIL NADU CORRIDOR
        </Text>
      </View>

      {/* Emergency Alert Banner */}
      <EmergencyBanner emergencies={emergencies} onPress={() => onNavigateTab('emergency')} />

      {/* Live Status Cards Grid */}
      <View style={styles.grid}>
        <View style={[styles.card, styles.emergencyCard]}>
          <Text style={styles.cardIcon}>🚨</Text>
          <Text style={styles.cardValue}>{activeEmergenciesCount}</Text>
          <Text style={styles.cardLabel}>Active Emergencies</Text>
          <Text style={styles.cardSub}>{activeEmergenciesCount > 0 ? 'Corridor Active' : 'All Clear'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🚦</Text>
          <Text style={styles.cardValue}>{congestedJunctionsCount}</Text>
          <Text style={styles.cardLabel}>Congested Junctions</Text>
          <Text style={styles.cardSub}>Of 4 Monitored</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>⏱️</Text>
          <Text style={styles.cardValue}>{metrics?.average_waiting_time ?? 0}s</Text>
          <Text style={styles.cardLabel}>Avg Waiting Time</Text>
          <Text style={styles.cardSub}>Network Mean</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🚗</Text>
          <Text style={styles.cardValue}>{metrics?.traffic_throughput ?? 0}</Text>
          <Text style={styles.cardLabel}>Throughput</Text>
          <Text style={styles.cardSub}>Vehicles Cleared</Text>
        </View>
      </View>

      {/* Mode Status Card */}
      <View style={styles.modeCard}>
        <View style={styles.modeRow}>
          <View>
            <Text style={styles.modeHeader}>OPERATING MODE</Text>
            <Text style={styles.modeTitle}>
              {frame?.mode === 'VAZHI_AI' ? 'VAZHI-AI Network Adaptive' : 'Fixed-Timer Baseline'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => setControlsVisible(true)}
          >
            <Text style={styles.controlPillText}>SIM CONTROLS ⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.modeDesc}>
          {frame?.mode === 'VAZHI_AI'
            ? 'Coordinating J1-J4 with downstream spillback protection & dynamic starvation prevention.'
            : 'Static 30-second cycles running without downstream network awareness.'}
        </Text>
      </View>

      {/* Main View Live Map CTA */}
      <TouchableOpacity
        style={styles.mainCtaButton}
        activeOpacity={0.85}
        onPress={() => onNavigateTab('map')}
      >
        <Text style={styles.ctaIcon}>🗺️</Text>
        <View style={styles.ctaTextContainer}>
          <Text style={styles.ctaTitle}>VIEW LIVE MAP</Text>
          <Text style={styles.ctaSubtitle}>Monitor corridor signals, moving vehicles & queues</Text>
        </View>
        <Text style={styles.ctaArrow}>➔</Text>
      </TouchableOpacity>

      {/* Quick Navigation Rows */}
      <View style={styles.quickNavContainer}>
        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => onNavigateTab('junctions')}
        >
          <Text style={styles.quickNavIcon}>🔍</Text>
          <Text style={styles.quickNavTitle}>Junction Details</Text>
          <Text style={styles.quickNavSub}>Approach breakdowns</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => onNavigateTab('decisions')}
        >
          <Text style={styles.quickNavIcon}>🧠</Text>
          <Text style={styles.quickNavTitle}>AI Decisions</Text>
          <Text style={styles.quickNavSub}>Explainability timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickNavBtn}
          onPress={() => onNavigateTab('analytics')}
        >
          <Text style={styles.quickNavIcon}>📊</Text>
          <Text style={styles.quickNavTitle}>Analytics & A/B</Text>
          <Text style={styles.quickNavSub}>Fixed vs VAZHI-AI</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandTitle: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  disclaimerPill: {
    backgroundColor: '#1E293B88',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 10,
    gap: 10,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emergencyCard: {
    borderColor: '#EF444444',
  },
  cardIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  cardValue: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
  },
  cardLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  cardSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  modeCard: {
    backgroundColor: '#131D31',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeHeader: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  controlPill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  controlPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modeDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },
  mainCtaButton: {
    backgroundColor: '#0284C7',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ctaSubtitle: {
    color: '#BAE6FD',
    fontSize: 11,
    marginTop: 2,
  },
  ctaArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  quickNavContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  quickNavBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  quickNavIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickNavTitle: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  quickNavSub: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
});
