import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SpillbackGaugeProps {
  occupancyPct: number;
  risk: number;
  status: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  shouldHold?: boolean;
}

export const SpillbackGauge: React.FC<SpillbackGaugeProps> = ({
  occupancyPct,
  risk,
  status,
  shouldHold
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MODERATE': return '#FBBF24';
      default: return '#10B981';
    }
  };

  const color = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Downstream Occupancy</Text>
        <Text style={[styles.statusText, { color }]}>{status} ({occupancyPct}%)</Text>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${Math.min(100, Math.max(5, occupancyPct))}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.riskText}>Spillback Risk: {Math.round(risk * 100)}%</Text>
        {shouldHold && (
          <View style={styles.holdPill}>
            <Text style={styles.holdText}>HOLD TRAFFIC</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  riskText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  holdPill: {
    backgroundColor: '#EF444422',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  holdText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '800',
  },
});
