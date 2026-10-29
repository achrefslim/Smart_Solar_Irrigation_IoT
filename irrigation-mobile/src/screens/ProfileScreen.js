import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

import ScreenShell from '../components/ScreenShell';
import { useAppTheme } from '../context/ThemeContext';
import { auth } from '../firebase/config';

function ProfileScreen({ user, darkMode, toggleTheme }) {
  const theme = useAppTheme();
  const username = user?.displayName || user?.email?.split('@')[0] || 'Operator';
  const initials = username
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <ScreenShell>
      <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.purple }]}>OPERATOR PROFILE</Text>
            <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>Account and appearance settings</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.secondary }]}>Username</Text>
          <Text style={[styles.value, { color: theme.text }]}>{username}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.label, { color: theme.secondary }]}>Theme</Text>
            <Text style={[styles.value, { color: theme.text }]}>{darkMode ? 'Dark' : 'Light'}</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#bfdbfe', true: '#60a5fa' }}
            thumbColor={darkMode ? '#f8fafc' : '#2563eb'}
          />
        </View>

        <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={19} color="#ffffff" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

export default React.memo(ProfileScreen);

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  infoBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 16,
    fontWeight: '900',
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
