import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTrafficStore } from '../store/trafficStore';

export const ConnectionBadge: React.FC = () => {
  const connectionStatus = useTrafficStore((s) => s.connectionStatus);
  const lastUpdatedTime = useTrafficStore((s) => s.lastUpdatedTime);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastUpdatedTime) {
        setSecondsAgo(Math.floor((Date.now() - lastUpdatedTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdatedTime]);

  let bg = '#10B981'; // Green
  let text = 'LIVE';

  if (connectionStatus === 'CONNECTING') {
    bg = '#F59E0B'; // Amber
    text = 'CONNECTING...';
  } else if (connectionStatus === 'CONNECTION LOST') {
    bg = '#EF4444'; // Red
    text = lastUpdatedTime ? `CONNECTION LOST • ${secondsAgo}s AGO` : 'OFFLINE';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg + '22', borderColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: bg }]} />
      <Text style={[styles.text, { color: bg }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
