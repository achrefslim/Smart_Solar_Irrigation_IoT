import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';

export default function ToggleSwitch({ value, onToggle }) {
  const theme = useAppTheme();
  const slideAnim = useRef(new Animated.Value(value ? 24 : 0)).current;
  const activeColor = theme.primary;
  const inactiveColor = theme.secondary;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: value ? 24 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, value]);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.stateLabel, { color: value ? theme.success : theme.secondary }]}>
        {value ? 'ON' : 'OFF'}
      </Text>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={({ pressed }) => [
          styles.track,
          {
            backgroundColor: value ? activeColor : 'rgba(148,163,184,0.24)',
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            borderColor: value ? `${activeColor}55` : `${inactiveColor}44`,
            shadowColor: value ? activeColor : inactiveColor,
          },
        ]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateLabel: {
    minWidth: 28,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    letterSpacing: 0.8,
  },
  track: {
    width: 56,
    height: 30,
    borderRadius: 20,
    paddingHorizontal: 3,
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    position: 'absolute',
    left: 3,
    top: 3,
  },
});
