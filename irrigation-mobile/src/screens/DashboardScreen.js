import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import ScreenShell from '../components/ScreenShell';
import SensorCard from '../components/SensorCard';
import WaterGauge from '../components/WaterGauge';
import { useIrrigationController } from '../context/IrrigationControllerContext';
import { useAppTheme } from '../context/ThemeContext';
import useIrrigationData from '../hooks/useIrrigationData';

function DashboardScreen() {
  const theme = useAppTheme();
  const { sensorData, loading, isOnline } = useIrrigationData();
  const { running, formattedTimeLeft } = useIrrigationController();

  const sensorCards = useMemo(
    () => [
      {
        title: 'Rain Sensor',
        status: sensorData.etat === 'PLUIE' ? 'Rain Detected' : 'Clear',
        active: sensorData.etat === 'PLUIE',
      },
      {
        title: 'Water Pump',
        status: sensorData.pump ? 'Running' : 'Stopped',
        active: sensorData.pump,
      },
      {
        title: 'Irrigation Motor',
        status: sensorData.motor ? 'Running' : 'Stopped',
        active: sensorData.motor,
      },
    ],
    [sensorData.motor, sensorData.pump, sensorData.etat]
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={[styles.eyebrow, { color: theme.purple }]}>SOLAR IRRIGATION</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Control Dashboard</Text>
          <Text style={[styles.heroSubtitle, { color: theme.secondary }]}>Live field data and reservoir status</Text>
        </View>
        <View style={[styles.heroBadge, { backgroundColor: theme.cardAlt, borderColor: theme.border, shadowColor: theme.shadow }]}>
          <Text style={[styles.heroBadgeValue, { color: theme.primary }]}>{sensorData.eau}%</Text>
          <Text style={[styles.heroBadgeLabel, { color: theme.secondary }]}>Water</Text>
        </View>
      </View>

      <View style={[styles.onlineBadge, { backgroundColor: isOnline ? 'rgba(220,252,231,0.92)' : 'rgba(254,226,226,0.92)', borderColor: isOnline ? 'rgba(5,150,105,0.18)' : 'rgba(220,38,38,0.18)' }]}>
        <View style={[styles.onlineDot, { backgroundColor: isOnline ? theme.success : theme.danger }]} />
        <Text style={[styles.onlineText, { color: isOnline ? theme.success : theme.danger }]}>
          Data Stream {isOnline ? 'Online' : 'Offline - sensor data may be stale'}
        </Text>
      </View>

      {running && (
        <View style={[styles.activeBanner, { backgroundColor: theme.darkMode ? 'rgba(52,211,153,0.12)' : 'rgba(220,252,231,0.94)', borderColor: theme.darkMode ? 'rgba(52,211,153,0.24)' : 'rgba(5,150,105,0.16)' }]}>
          <View style={[styles.activeDot, { backgroundColor: theme.success }]} />
          <Text style={[styles.activeBannerText, { color: theme.success }]}>Irrigation active for {formattedTimeLeft}</Text>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Sensors</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>Realtime field status and device activity</Text>
        {sensorCards.map((card) => (
          <SensorCard key={card.title} title={card.title} status={card.status} active={card.active} />
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: theme.cardAlt, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Rain Detail</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>Raw rain sensor value and current state</Text>
        <View style={styles.rainRow}>
          <View style={styles.rainItem}>
            <Text style={[styles.rainLabel, { color: theme.secondary }]}>Raw Value</Text>
            <Text style={[styles.rainValue, { color: theme.text }]}>{sensorData.pluie}</Text>
          </View>
          <View style={[styles.rainDivider, { backgroundColor: theme.border }]} />
          <View style={styles.rainItem}>
            <Text style={[styles.rainLabel, { color: theme.secondary }]}>State</Text>
            <Text style={[styles.rainValue, { color: sensorData.etat === 'PLUIE' ? theme.primary : theme.success }]}>
              {sensorData.etat}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, styles.waterSection, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Water Gauge</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>Reservoir monitoring with live percentage reading</Text>
        <WaterGauge value={sensorData.eau} />
      </View>
    </ScreenShell>
  );
}

export default React.memo(DashboardScreen);

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '700' },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 14,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontWeight: '600',
  },
  heroBadge: {
    width: 86,
    minHeight: 76,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBadgeValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  heroBadgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  onlineDot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 },
  onlineText: { fontSize: 13, fontWeight: '800', flex: 1 },
  activeBanner: {
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: { width: 10, height: 10, borderRadius: 10, marginRight: 10 },
  activeBannerText: { fontSize: 14, fontWeight: '800' },
  section: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  waterSection: {
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    fontWeight: '600',
  },
  rainRow: { flexDirection: 'row', alignItems: 'center' },
  rainItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  rainDivider: { width: 1, height: 48 },
  rainLabel: { fontSize: 12, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '800' },
  rainValue: { fontSize: 25, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
