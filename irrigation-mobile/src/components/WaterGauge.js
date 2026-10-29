import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

function getGaugeColor(value, theme) {
  if (value < 20) {
    return theme.danger;
  }

  if (value < 50) {
    return theme.warning;
  }

  return theme.primary;
}

export default function WaterGauge({ value }) {
  const theme = useAppTheme();
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const gaugeColor = getGaugeColor(safeValue, theme);
  const fillHeight = `${safeValue}%`;
  const statusText = safeValue < 20 ? 'CRITICAL' : safeValue < 50 ? 'LOW' : 'OPTIMAL';

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.overline, { color: theme.purple }]}>WATER RESERVOIR</Text>
      <View style={[styles.overlineRule, { backgroundColor: gaugeColor }]} />
      <View style={[styles.gaugeShell, { shadowColor: gaugeColor }]}>
        <View style={[styles.gauge, { borderColor: `${gaugeColor}55`, backgroundColor: theme.cardAlt }]}>
          <View style={[styles.fill, { height: fillHeight, backgroundColor: gaugeColor }]} />
          <View style={[styles.wave, { backgroundColor: gaugeColor, bottom: fillHeight }]} />
          <View style={[styles.innerGlow, { borderColor: `${gaugeColor}22` }]} />
          <View style={styles.centerContent}>
            <Text style={[styles.value, { color: safeValue < 30 ? '#ffffff' : theme.text }]}>{safeValue}%</Text>
            <Text style={[styles.status, { color: safeValue < 30 ? '#ffffff' : gaugeColor }]}>{statusText}</Text>
            <Text style={[styles.meta, { color: safeValue < 30 ? 'rgba(255,255,255,0.82)' : theme.secondary }]}>Live reading</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.label, { color: theme.secondary }]}>Water Level</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  overline: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '900',
    marginBottom: 8,
  },
  overlineRule: {
    width: 130,
    height: 3,
    borderRadius: 3,
    marginBottom: 18,
    opacity: 0.86,
  },
  gaugeShell: {
    padding: 12,
    borderRadius: 140,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 7,
    marginBottom: 14,
  },
  gauge: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 7,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.72,
  },
  wave: {
    position: 'absolute',
    left: -18,
    right: -18,
    height: 26,
    borderRadius: 20,
    opacity: 0.28,
  },
  innerGlow: {
    position: 'absolute',
    inset: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 48,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.14)',
    textShadowRadius: 8,
  },
  status: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
});
