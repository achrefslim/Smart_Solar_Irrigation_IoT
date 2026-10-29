import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../context/ThemeContext';

function getCardMeta(title, active, theme) {
  if (title.includes('Rain')) {
    return {
      icon: active ? 'rainy' : 'sunny',
      accentColor: active ? theme.primary : theme.warning,
      tint: active ? 'rgba(219,234,254,0.9)' : 'rgba(255,251,235,0.95)',
      description: 'Rain sensor reading',
    };
  }

  if (title.includes('Pump')) {
    return {
      icon: 'water',
      accentColor: active ? theme.primary : theme.secondary,
      tint: active ? 'rgba(219,234,254,0.96)' : 'rgba(248,250,252,0.9)',
      description: 'Water pump control',
    };
  }

  return {
    icon: 'settings',
    accentColor: active ? theme.purple : theme.secondary,
    tint: active ? 'rgba(245,243,255,0.96)' : 'rgba(248,250,252,0.9)',
    description: 'Irrigation motor control',
  };
}

export default function SensorCard({ title, status, active }) {
  const theme = useAppTheme();
  const meta = getCardMeta(title, active, theme);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.darkMode ? theme.cardAlt : meta.tint,
          borderColor: active ? `${meta.accentColor}44` : theme.border,
          shadowColor: meta.accentColor,
        },
      ]}>
      <View style={[styles.accentLine, { backgroundColor: meta.accentColor }]} />
      <Ionicons name={meta.icon} size={88} color={meta.accentColor} style={styles.ghostIcon} />

      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.muted }]}>{title}</Text>
        <View style={[styles.dot, { backgroundColor: active ? theme.success : theme.secondary }]} />
      </View>

      <View style={[styles.iconBox, { backgroundColor: `${meta.accentColor}18`, borderColor: `${meta.accentColor}25` }]}>
        <Ionicons name={meta.icon} size={28} color={meta.accentColor} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.status, { color: active ? meta.accentColor : theme.text }]}>{status}</Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.description, { color: theme.secondary }]}>{meta.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 14,
    borderWidth: 1,
    minHeight: 176,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 5,
    position: 'relative',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    opacity: 0.95,
  },
  ghostIcon: {
    position: 'absolute',
    top: 14,
    right: 10,
    opacity: 0.08,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    fontWeight: '900',
    flex: 1,
    paddingRight: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  footer: {
    marginTop: 2,
  },
  status: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 9,
  },
  divider: {
    height: 1,
    marginBottom: 9,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
