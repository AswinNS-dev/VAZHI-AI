import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DecisionData } from '../types/traffic';

interface DecisionItemProps {
  decision: DecisionData;
  isLatest?: boolean;
}

export const DecisionItem: React.FC<DecisionItemProps> = ({ decision, isLatest = false }) => {
  const isEmergency = decision.emergency_override || decision.selected_phase.includes('EMERGENCY');

  return (
    <View style={[styles.card, isLatest && styles.latestCard, isEmergency && styles.emergencyCard]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.junctionBadge}>
          <Text style={styles.junctionText}>{decision.intersection}</Text>
        </View>
        <Text style={styles.phaseText}>➔ {decision.selected_phase.replace('_', ' ')}</Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{decision.duration}s</Text>
        </View>
        <Text style={styles.timeText}>{decision.timestamp}</Text>
      </View>

      {/* Explainable Reasons */}
      <View style={styles.reasonsList}>
        <Text style={styles.reasonHeader}>Explainable AI Rationale:</Text>
        {decision.reason.map((r, i) => (
          <View key={i} style={styles.reasonRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reasonText}>{r}</Text>
          </View>
        ))}
      </View>

      {/* Next Planned Phase */}
      {decision.next_planned_phase && (
        <View style={styles.nextPhaseRow}>
          <Text style={styles.nextPhaseLabel}>Next Planned Phase:</Text>
          <Text style={styles.nextPhaseValue}>{decision.next_planned_phase.replace('_', ' ')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  latestCard: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  emergencyCard: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  junctionBadge: {
    backgroundColor: '#38BDF822',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  junctionText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 13,
  },
  phaseText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  durationText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 11,
  },
  timeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  reasonsList: {
    backgroundColor: '#0F172A88',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  reasonHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 3,
  },
  bullet: {
    color: '#38BDF8',
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  reasonText: {
    color: '#E2E8F0',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  nextPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  nextPhaseLabel: {
    color: '#64748B',
    fontSize: 11,
    marginRight: 6,
  },
  nextPhaseValue: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
});
