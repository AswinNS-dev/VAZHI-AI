import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';
import { DecisionItem } from '../components/DecisionItem';

export const DecisionsScreen: React.FC = () => {
  const frame = useTrafficStore((s) => s.frame);
  const [filterJunction, setFilterJunction] = useState<string>('ALL');

  const decisions = frame?.recent_decisions || [];
  const filteredDecisions = filterJunction === 'ALL'
    ? decisions
    : decisions.filter((d) => d.intersection === filterJunction);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Decision Timeline</Text>
          <Text style={styles.subtitle}>Explainable multi-approach reasoning stream</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['ALL', 'J1', 'J2', 'J3', 'J4'].map((jId) => (
          <TouchableOpacity
            key={jId}
            style={[styles.filterTab, filterJunction === jId && styles.filterTabActive]}
            onPress={() => setFilterJunction(jId)}
          >
            <Text style={[styles.filterText, filterJunction === jId && styles.filterTextActive]}>
              {jId}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Decisions List */}
      <View style={styles.list}>
        {filteredDecisions.length > 0 ? (
          filteredDecisions.map((decision, index) => (
            <DecisionItem
              key={`${decision.intersection}_${decision.timestamp}_${index}`}
              decision={decision}
              isLatest={index === 0}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>Listening for AI Decisions...</Text>
            <Text style={styles.emptySub}>
              Decisions are generated each time a signal phase completes or an emergency override triggers.
            </Text>
          </View>
        )}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 14,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  filterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
