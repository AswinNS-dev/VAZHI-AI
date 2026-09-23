import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';
import { injectAmbulance } from '../services/api';

export const EmergencyScreen: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const [isDispatching, setIsDispatching] = useState(false);

  const emergencies = frame?.emergencies || {};
  const activeEmergencies = Object.values(emergencies).filter((e) => e.active);
  const hasActive = activeEmergencies.length > 0;
  const currentAmb = activeEmergencies[0];

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      await injectAmbulance('IN_J1_W', 'HOSPITAL');
    } catch (err) {
      console.warn('Dispatch failed:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const formatEta = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Emergency Corridor Command</Text>
          <Text style={styles.subtitle}>Autonomous Green-Wave Signal Preemption</Text>
        </View>
      </View>

      {/* Active Corridor Card */}
      {hasActive && currentAmb ? (
        <View style={styles.corridorCard}>
          <View style={styles.cardHeader}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>🚨 CORRIDOR ACTIVE</Text>
            </View>
            <Text style={styles.ambIdText}>Ambulance {currentAmb.ambulance_id}</Text>
          </View>

          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>ESTIMATED TIME OF ARRIVAL</Text>
            <Text style={styles.etaDigits}>{formatEta(currentAmb.eta_seconds)}</Text>
            <Text style={styles.etaSub}>To Government Multi Super Speciality Hospital</Text>
          </View>

          {/* Route Progression Banner */}
          <View style={styles.routeBox}>
            <Text style={styles.routeLabel}>COORDINATED ROUTE</Text>
            <Text style={styles.routePath}>{currentAmb.route_display}</Text>
          </View>

          {/* Sequential Intersections Status Checklist */}
          <Text style={styles.checklistHeader}>PREEMPTION CHECKLIST</Text>
          <View style={styles.checklist}>
            {Object.entries(currentAmb.prepared_intersections || {}).map(([jId, prep]) => {
              let badgeColor = '#64748B';
              let badgeBg = '#1E293B';
              let symbol = '⏳';

              if (prep.status === 'READY') {
                badgeColor = '#10B981';
                badgeBg = '#05966922';
                symbol = 'READY ✓';
              } else if (prep.status === 'PASSING') {
                badgeColor = '#38BDF8';
                badgeBg = '#0284C722';
                symbol = 'PASSING ➔';
              } else if (prep.status === 'RELEASED') {
                badgeColor = '#64748B';
                badgeBg = '#1E293B';
                symbol = 'RELEASED';
              } else if (prep.status === 'PREPARING') {
                badgeColor = '#FBBF24';
                badgeBg = '#D9770622';
                symbol = 'PREPARING...';
              }

              return (
                <View key={jId} style={styles.checkItem}>
                  <View style={styles.checkLeft}>
                    <Text style={styles.checkJunction}>{jId}</Text>
                    <Text style={styles.checkSub}>Step {prep.step} in Corridor</Text>
                  </View>
                  <View style={[styles.checkStatusBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
                    <Text style={[styles.checkStatusText, { color: badgeColor }]}>{symbol}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.idleCard}>
          <Text style={styles.idleIcon}>🏥</Text>
          <Text style={styles.idleTitle}>No Active Emergency Corridors</Text>
          <Text style={styles.idleDesc}>
            All network signals operating in standard adaptive multi-approach equilibrium.
          </Text>
        </View>
      )}

      {/* Dispatch Action Button */}
      <View style={styles.actionSection}>
        <Text style={styles.actionHeader}>SIMULATION CONTROLLER</Text>
        <TouchableOpacity
          style={styles.dispatchBtn}
          activeOpacity={0.85}
          disabled={isDispatching}
          onPress={handleDispatch}
        >
          {isDispatching ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.dispatchIcon}>🚑</Text>
              <View>
                <Text style={styles.dispatchTitle}>DISPATCH TEST AMBULANCE</Text>
                <Text style={styles.dispatchSub}>Spawns at West Feeder heading for Government Hospital</Text>
              </View>
            </>
          )}
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
  corridorCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    backgroundColor: '#EF444422',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
  ambIdText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  etaContainer: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  etaLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  etaDigits: {
    color: '#38BDF8',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 4,
  },
  etaSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  routeBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  routeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  routePath: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  checklistHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
  },
  checkLeft: {},
  checkJunction: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  checkSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  checkStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  idleCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  idleIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  idleTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  idleDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  actionSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  actionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  dispatchBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F87171',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  dispatchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dispatchTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dispatchSub: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
  },
});
