import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenShell from '../components/ScreenShell';
import { useAppTheme } from '../context/ThemeContext';
import useIrrigationData from '../hooks/useIrrigationData';

function getAlertTone(text) {
  const value = String(text || '').toLowerCase();

  if (
    value.includes('critical') ||
    value.includes('error') ||
    value.includes('warning') ||
    value.includes('low') ||
    value.includes('rain')
  ) {
    return 'danger';
  }

  return 'normal';
}

function AlertsScreen() {
  const theme = useAppTheme();
  const { alerts, loading } = useIrrigationData();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.purple }]}>SYSTEM STATUS</Text>
        <Text style={[styles.title, { color: theme.text }]}>Alerts</Text>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>Recent irrigation activity and warnings</Text>
      </View>

      {alerts.map((alert, index) => {
        const tone = getAlertTone(alert.text);
        const color = tone === 'danger' ? theme.danger : theme.success;
        const icon = tone === 'danger' ? 'warning' : 'checkmark-circle';

        return (
          <View
            key={`${alert.text}-${alert.timestamp}-${index}`}
            style={[
              styles.alertCard,
              {
                backgroundColor: tone === 'danger' ? 'rgba(254,226,226,0.94)' : theme.card,
                borderColor: tone === 'danger' ? 'rgba(220,38,38,0.18)' : theme.border,
                shadowColor: tone === 'danger' ? theme.danger : theme.shadow,
              },
            ]}>
            <View style={[styles.iconBox, { backgroundColor: `${color}16`, borderColor: `${color}24` }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertText, { color: tone === 'danger' ? theme.danger : theme.text }]}>
                {alert.text}
              </Text>
              <Text style={[styles.alertTimestamp, { color: theme.secondary }]}>{alert.timestamp}</Text>
            </View>
          </View>
        );
      })}
    </ScreenShell>
  );
}

export default React.memo(AlertsScreen);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  hero: {
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  alertCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    gap: 13,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 7,
    fontWeight: '800',
  },
  alertTimestamp: {
    fontSize: 12,
    fontWeight: '700',
  },
});
