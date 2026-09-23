import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import {
  startSimulation,
  pauseSimulation,
  resetSimulation,
  setSimulationMode,
  triggerDemoScenario,
  injectAmbulance,
  injectCongestion,
  injectWaitingTime
} from '../services/api';
import { useTrafficStore } from '../store/trafficStore';

export const SimulationControlsModal: React.FC = () => {
  const isVisible = useTrafficStore((s) => s.isControlsVisible);
  const setVisible = useTrafficStore((s) => s.setControlsVisible);
  const frame = useTrafficStore((s) => s.frame);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const mode = frame?.mode || 'VAZHI_AI';
  const isPaused = frame?.is_paused ?? false;

  const handleAction = async (name: string, fn: () => Promise<any>) => {
    setLoadingAction(name);
    try {
      await fn();
    } catch (e) {
      console.warn('Action failed:', e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Simulation Command Center</Text>
              <Text style={styles.subtitle}>Real-time controls & live scenario triggers</Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Primary Demo Scenario Trigger */}
            <View style={styles.primaryDemoSection}>
              <Text style={styles.sectionHeader}>PRIMARY DEMO SEQUENCE</Text>
              <TouchableOpacity
                style={styles.demoButton}
                activeOpacity={0.85}
                onPress={() => handleAction('demo', triggerDemoScenario)}
              >
                {loadingAction === 'demo' ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.demoIcon}>⚡</Text>
                    <View style={styles.demoTextWrap}>
                      <Text style={styles.demoButtonText}>RUN EMERGENCY SCENARIO</Text>
                      <Text style={styles.demoSubtext}>Executes complete 12-step corridor & spillback test</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
              {frame?.scenario_description && (
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepText}>{frame.scenario_description}</Text>
                </View>
              )}
            </View>

            {/* Simulation Clock Controls */}
            <Text style={styles.sectionHeader}>SIMULATION CONTROLS</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, styles.startBtn]}
                onPress={() => handleAction('start', isPaused ? startSimulation : pauseSimulation)}
              >
                <Text style={styles.btnText}>{isPaused ? '▶ START' : '⏸ PAUSE'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.resetBtn]}
                onPress={() => handleAction('reset', resetSimulation)}
              >
                <Text style={styles.btnText}>↺ RESET</Text>
              </TouchableOpacity>
            </View>

            {/* Mode Toggle */}
            <Text style={styles.sectionHeader}>INTELLIGENCE MODE</Text>
            <View style={styles.modeToggleRow}>
              <TouchableOpacity
                style={[styles.modeBtn, mode === 'VAZHI_AI' && styles.modeBtnActive]}
                onPress={() => handleAction('mode_vazhi', () => setSimulationMode('VAZHI_AI'))}
              >
                <Text style={[styles.modeBtnText, mode === 'VAZHI_AI' && styles.modeBtnTextActive]}>
                  VAZHI-AI ADAPTIVE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeBtn, mode === 'FIXED_TIME' && styles.modeBtnActive]}
                onPress={() => handleAction('mode_fixed', () => setSimulationMode('FIXED_TIME'))}
              >
                <Text style={[styles.modeBtnText, mode === 'FIXED_TIME' && styles.modeBtnTextActive]}>
                  FIXED-TIME BASELINE
                </Text>
              </TouchableOpacity>
            </View>

            {/* Interactive Injections */}
            <Text style={styles.sectionHeader}>LIVE EVENT INJECTIONS</Text>
            <View style={styles.injectionGrid}>
              <TouchableOpacity
                style={styles.injectionCard}
                onPress={() => handleAction('amb', () => injectAmbulance('IN_J1_W', 'HOSPITAL'))}
              >
                <Text style={styles.injectionIcon}>🚑</Text>
                <Text style={styles.injectionTitle}>Inject Ambulance</Text>
                <Text style={styles.injectionDesc}>West Feeder ➔ Hospital</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.injectionCard}
                onPress={() => handleAction('cong', () => injectCongestion('ROAD_J2_J3', 30))}
              >
                <Text style={styles.injectionIcon}>⚠️</Text>
                <Text style={styles.injectionTitle}>Downstream Congestion</Text>
                <Text style={styles.injectionDesc}>Saturate J2-J3 (90%+ occ)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.injectionCard}
                onPress={() => handleAction('east', () => injectCongestion('ROAD_J1_J2', 25))}
              >
                <Text style={styles.injectionIcon}>🚗</Text>
                <Text style={styles.injectionTitle}>Surge East Traffic</Text>
                <Text style={styles.injectionDesc}>25+ vehicles at J2</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.injectionCard}
                onPress={() => handleAction('wait', () => injectWaitingTime('IN_J2_N', 75.0))}
              >
                <Text style={styles.injectionIcon}>⏱️</Text>
                <Text style={styles.injectionTitle}>North Starvation</Text>
                <Text style={styles.injectionDesc}>Add 75s wait time</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 8,
  },
  primaryDemoSection: {
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  demoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  demoTextWrap: {
    flex: 1,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  demoSubtext: {
    color: '#BAE6FD',
    fontSize: 11,
    marginTop: 2,
  },
  stepIndicator: {
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  stepText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    backgroundColor: '#10B981',
  },
  resetBtn: {
    backgroundColor: '#334155',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  modeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#0284C7',
  },
  modeBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  injectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  injectionCard: {
    backgroundColor: '#1E293B',
    width: '48%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  injectionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  injectionTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  injectionDesc: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
});
