import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SignalColor } from '../types/traffic';

interface SignalBadgeProps {
  color: SignalColor;
  label?: string;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ color, label }) => {
  const colorMap = {
    GREEN: { bg: '#059669', dot: '#10B981', text: '#ECFDF5' },
    YELLOW: { bg: '#D97706', dot: '#FBBF24', text: '#FFFBEB' },
    RED: { bg: '#DC2626', dot: '#F87171', text: '#FEF2F2' },
  };

  const style = colorMap[color] || colorMap.RED;

  return (
    <View style={[styles.badge, { backgroundColor: style.bg + '25', borderColor: style.dot }]}>
      <View style={[styles.dot, { backgroundColor: style.dot }]} />
      {label && <Text style={[styles.label, { color: style.dot }]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
