import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { wsClient } from './src/services/websocket';
import { useTrafficStore } from './src/store/trafficStore';
import { HomeScreen } from './src/screens/HomeScreen';
import { LiveMapScreen } from './src/screens/LiveMapScreen';
import { JunctionDetailScreen } from './src/screens/JunctionDetailScreen';
import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { DecisionsScreen } from './src/screens/DecisionsScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SimulationControlsModal } from './src/components/SimulationControlsModal';

type TabKey = 'home' | 'map' | 'junctions' | 'emergency' | 'decisions' | 'analytics';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const frame = useTrafficStore((s) => s.frame);
  const setSelectedJunctionId = useTrafficStore((s) => s.setSelectedJunctionId);

  useEffect(() => {
    // Establish resilient WebSocket connection
    wsClient.connect();
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const activeEmergencies = Object.values(frame?.emergencies || {}).filter((e) => e.active);

  const handleNavigateToJunction = (id: string) => {
    setSelectedJunctionId(id);
    setActiveTab('junctions');
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigateTab={(tab) => setActiveTab(tab as TabKey)} />;
      case 'map':
        return <LiveMapScreen onNavigateToJunction={handleNavigateToJunction} />;
      case 'junctions':
        return <JunctionDetailScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      case 'decisions':
        return <DecisionsScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      default:
        return <HomeScreen onNavigateTab={(tab) => setActiveTab(tab as TabKey)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1D" />
      <View style={styles.container}>
        {/* Main Screen Body */}
        <View style={styles.screenContainer}>
          {renderActiveScreen()}
        </View>

        {/* Floating Simulation Command Center Modal */}
        <SimulationControlsModal />

        {/* Bottom Tab Navigation Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={styles.tabIcon}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'map' && styles.tabItemActive]}
            onPress={() => setActiveTab('map')}
          >
            <Text style={styles.tabIcon}>🗺️</Text>
            <Text style={[styles.tabLabel, activeTab === 'map' && styles.tabLabelActive]}>Live Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'junctions' && styles.tabItemActive]}
            onPress={() => setActiveTab('junctions')}
          >
            <Text style={styles.tabIcon}>🚦</Text>
            <Text style={[styles.tabLabel, activeTab === 'junctions' && styles.tabLabelActive]}>Junctions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'emergency' && styles.tabItemActive]}
            onPress={() => setActiveTab('emergency')}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.tabIcon}>🚨</Text>
              {activeEmergencies.length > 0 && <View style={styles.badgeDot} />}
            </View>
            <Text style={[styles.tabLabel, activeTab === 'emergency' && styles.tabLabelActive]}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'decisions' && styles.tabItemActive]}
            onPress={() => setActiveTab('decisions')}
          >
            <Text style={styles.tabIcon}>🧠</Text>
            <Text style={[styles.tabLabel, activeTab === 'decisions' && styles.tabLabelActive]}>Decisions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'analytics' && styles.tabItemActive]}
            onPress={() => setActiveTab('analytics')}
          >
            <Text style={styles.tabIcon}>📊</Text>
            <Text style={[styles.tabLabel, activeTab === 'analytics' && styles.tabLabelActive]}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F1D',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    transform: [{ scale: 1.05 }],
  },
  iconWrap: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#38BDF8',
  },
});
