import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmergencyData } from '../types/traffic';
import { Ionicons } from '@expo/vector-icons';

interface EmergencyBannerProps {
  emergencies: Record<string, EmergencyData>;
  onPress?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ emergencies, onPress }) => {
  const activeEmergencies = Object.values(emergencies || {}).filter((e) => e.active);

  if (activeEmergencies.length === 0) return null;

  const amb = activeEmergencies[0];
  const minutes = Math.floor(amb.eta_seconds / 60);
  const seconds = amb.eta_seconds % 60;
  const etaFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.banner}>
      <View style={styles.leftRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🚨</Text>
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>EMERGENCY CORRIDOR ACTIVE</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{amb.ambulance_id}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Route: {amb.route_display}
          </Text>
        </View>
      </View>
      <View style={styles.etaContainer}>
        <Text style={styles.etaLabel}>ETA</Text>
        <Text style={styles.etaValue}>{etaFormatted}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  icon: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  etaContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  etaLabel: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '700',
  },
  etaValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
