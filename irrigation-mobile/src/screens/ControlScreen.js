import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';

import ScreenShell from '../components/ScreenShell';
import ToggleSwitch from '../components/ToggleSwitch';
import { useIrrigationController } from '../context/IrrigationControllerContext';
import { useAppTheme } from '../context/ThemeContext';
import useIrrigationData from '../hooks/useIrrigationData';

function ControlScreen() {
  const theme = useAppTheme();
  const { sensorData, loading, updatingDevice, handleToggle, isOnline } = useIrrigationData();
  const [progressAnim] = useState(() => new Animated.Value(100));
  const {
    duration,
    setDuration,
    formattedTimeLeft,
    running,
    completed,
    timerState,
    timerStatusText,
    progress,
    startIrrigation,
    stopIrrigation,
  } = useIrrigationController();
  const timerPresets = [1, 2, 5, 10];
  const timerStatusColor = running ? theme.success : completed ? theme.primary : theme.secondary;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const onTogglePress = useCallback(async (key) => {
    try {
      await handleToggle(key);
    } catch (error) {
      Alert.alert('Update failed', error.message || 'Could not update device state.');
    }
  }, [handleToggle]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading control system...</Text>
      </View>
    );
  }

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.purple }]}>DEVICE CONTROL</Text>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Irrigation Timer</Text>
        <Text style={[styles.heroSubtitle, { color: theme.secondary }]}>Start the full wash cycle, or control each device separately.</Text>
      </View>

      <View style={[styles.onlineBadge, { backgroundColor: isOnline ? 'rgba(220,252,231,0.92)' : 'rgba(254,226,226,0.92)', borderColor: isOnline ? 'rgba(5,150,105,0.18)' : 'rgba(220,38,38,0.18)' }]}>
        <View style={[styles.onlineDot, { backgroundColor: isOnline ? theme.success : theme.danger }]} />
        <Text style={[styles.onlineText, { color: isOnline ? theme.success : theme.danger }]}>
          Simulator {isOnline ? 'Online - commands are syncing' : 'Offline - updates are not responding'}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Smart Cycle</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>Choose duration and start irrigation</Text>

        <View
          style={[
            styles.timerCard,
            { backgroundColor: theme.cardAlt, borderColor: theme.border, shadowColor: running ? theme.success : theme.shadow },
            running && styles.timerCardRunning,
          ]}>
          <Text
            style={[
              styles.timerValue,
              {
                color: running ? theme.success : theme.primary,
                textShadowColor: running ? 'rgba(5,150,105,0.2)' : 'rgba(37,99,235,0.16)',
              },
            ]}>
            {running ? formattedTimeLeft : `${duration}:00`}
          </Text>
          <Text style={[styles.timerCountdownLabel, { color: theme.secondary }]}>Time Remaining</Text>

          <View style={[styles.timerProgressTrack, { backgroundColor: theme.track }]}>
            <Animated.View
              style={[
                styles.timerProgressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: running ? theme.success : theme.primary,
                },
              ]}
            />
          </View>

          <View style={styles.sliderShell}>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.track}
              thumbTintColor={theme.purple}
              disabled={running}
              style={styles.nativeSlider}
            />
          </View>

          <View style={styles.timerPresetRow}>
            {timerPresets.map((preset) => {
              const selected = preset === duration;

              return (
                <Pressable
                  key={preset}
                  onPress={() => setDuration(preset)}
                  disabled={running}
                  style={({ pressed }) => [
                    styles.timerPreset,
                    { backgroundColor: selected ? theme.primary : theme.card, borderColor: selected ? theme.primary : theme.border },
                    running && styles.timerDisabledButton,
                    pressed && styles.buttonPressed,
                  ]}>
                  <Text
                    style={[
                      styles.timerPresetText,
                      { color: selected ? '#ffffff' : theme.text },
                    ]}>
                    {preset} min
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {running ? (
            <Pressable
              onPress={() => stopIrrigation(false)}
              style={({ pressed }) => [styles.timerStopButton, pressed && styles.timerButtonPressed]}>
              <Text style={styles.timerButtonText}>STOP IRRIGATION</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={startIrrigation}
              style={({ pressed }) => [styles.timerStartButton, pressed && styles.timerButtonPressed]}>
              <Text style={styles.timerButtonText}>START IRRIGATION</Text>
            </Pressable>
          )}

          <View style={styles.timerStatusRow}>
            <View style={[styles.timerStatusDot, { backgroundColor: timerStatusColor }]} />
            <Text style={[styles.timerStatusText, { color: timerStatusColor }]}>
              {timerStatusText}
            </Text>
          </View>
          <Text style={[styles.timerStateText, { color: theme.secondary }]}>{timerState}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Device Controls</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.secondary }]}>Direct control for the irrigation simulation</Text>

        <View style={[styles.controlRow, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.controlLabel, { color: theme.text }]}>Pump</Text>
            <Text style={[styles.controlStatus, { color: sensorData.pump ? theme.success : theme.secondary }]}>{sensorData.pump ? 'Running' : 'Stopped'}</Text>
          </View>
          <View style={styles.controlAction}>
            {updatingDevice === 'pump' ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <ToggleSwitch value={sensorData.pump} onToggle={() => onTogglePress('pump')} />
            )}
          </View>
        </View>

        <View style={[styles.controlRow, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.controlLabel, { color: theme.text }]}>Motor</Text>
            <Text style={[styles.controlStatus, { color: sensorData.motor ? theme.success : theme.secondary }]}>{sensorData.motor ? 'Running' : 'Stopped'}</Text>
          </View>
          <View style={styles.controlAction}>
            {updatingDevice === 'motor' ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <ToggleSwitch value={sensorData.motor} onToggle={() => onTogglePress('motor')} />
            )}
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

export default React.memo(ControlScreen);

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
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    fontWeight: '600',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  onlineDot: { width: 9, height: 9, borderRadius: 5, marginRight: 9 },
  onlineText: { fontSize: 13, fontWeight: '800', flex: 1 },
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
  timerCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  timerCardRunning: {
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
  timerValue: {
    fontSize: 60,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    fontVariant: ['tabular-nums'],
  },
  timerCountdownLabel: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    fontWeight: '700',
  },
  timerProgressTrack: {
    height: 10,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 18,
  },
  timerProgressFill: {
    height: '100%',
    borderRadius: 10,
  },
  sliderShell: {
    minHeight: 38,
    justifyContent: 'center',
    marginBottom: 15,
  },
  nativeSlider: {
    width: '100%',
    height: 38,
  },
  timerPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  timerPreset: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerPresetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timerStartButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  timerStopButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    shadowColor: '#dc2626',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  timerDisabledButton: {
    opacity: 0.55,
  },
  timerButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  timerStatusRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
    marginRight: 8,
  },
  timerStatusText: {
    fontWeight: '800',
  },
  timerStateText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 1.6,
    fontWeight: '800',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 12,
  },
  controlLabel: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  controlStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  controlAction: {
    minWidth: 92,
    alignItems: 'flex-end',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
