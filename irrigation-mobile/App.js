import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { enableScreens } from 'react-native-screens';

import AlertsScreen from './src/screens/AlertsScreen';
import ControlScreen from './src/screens/ControlScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { IrrigationControllerProvider, useIrrigationController } from './src/context/IrrigationControllerContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { IrrigationDataProvider } from './src/hooks/useIrrigationData';
import { auth } from './src/firebase/config';

enableScreens();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size, focused }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.activeTabIndicator} />}
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

function SmartTabBar({ state, descriptors, navigation }) {
  const { running, formattedTimeLeft, startIrrigation, stopIrrigation } = useIrrigationController();
  const theme = useAppTheme();

  return (
    <View style={styles.tabShell}>
      {running && (
        <Pressable
          style={[
            styles.miniStatusBar,
            {
              backgroundColor: theme.darkMode ? 'rgba(52,211,153,0.12)' : 'rgba(220,252,231,0.96)',
              borderColor: theme.darkMode ? 'rgba(52,211,153,0.24)' : 'rgba(5,150,105,0.16)',
            },
          ]}
          onPress={() => navigation.navigate('Control')}>
          <View style={styles.miniStatusDot} />
          <Text style={styles.miniStatusText}>
            Irrigation Active - {formattedTimeLeft} remaining
          </Text>
        </Pressable>
      )}

      <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const color = isFocused ? theme.primary : theme.tabInactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = {
            Dashboard: 'home',
            Control: 'options',
            Alerts: 'notifications',
            Profile: 'person',
          }[route.name];

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
              <View style={styles.tabIconWrap}>
                <TabIcon name={iconName} size={24} color={color} focused={isFocused} />
              </View>
              <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => (running ? stopIrrigation(false) : startIrrigation())}
        onLongPress={() => navigation.navigate('Control')}
        style={({ pressed }) => [
          styles.fab,
          running ? styles.fabRunning : styles.fabIdle,
          pressed && styles.fabPressed,
        ]}>
        <Ionicons name={running ? 'stop' : 'play'} size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}

function MainTabs({ user, darkMode, toggleTheme }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <SmartTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        tabBarHideOnKeyboard: true,
      }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Control" component={ControlScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            {...props}
            user={user}
            darkMode={darkMode}
            toggleTheme={toggleTheme}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = React.useCallback(() => setDarkMode((current) => !current), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: darkMode ? '#101827' : '#ebe7ff' }]}>
        <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#101827' : '#ebe7ff'} />
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={[styles.loadingText, { color: darkMode ? '#f8fafc' : '#1e1b4b' }]}>Loading irrigation system...</Text>
      </View>
    );
  }

  const appTheme = {
    ...(darkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(darkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: darkMode ? '#101827' : '#ebe7ff',
      card: darkMode ? '#172033' : '#f8fbff',
      text: darkMode ? '#f8fafc' : '#1e1b4b',
      border: darkMode ? 'rgba(147,197,253,0.18)' : 'rgba(109,40,217,0.14)',
      primary: '#2563eb',
    },
  };

  return (
    <ThemeProvider darkMode={darkMode}>
    <NavigationContainer theme={appTheme}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#101827' : '#ebe7ff'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs">
            {() => (
              <IrrigationControllerProvider>
                <IrrigationDataProvider>
                  <MainTabs user={user} darkMode={darkMode} toggleTheme={toggleTheme} />
                </IrrigationDataProvider>
              </IrrigationControllerProvider>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ebe7ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#f0f4ff',
    fontSize: 16,
  },
  tabShell: {
    backgroundColor: 'transparent',
  },
  miniStatusBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#059669',
    marginRight: 8,
  },
  miniStatusText: {
    color: '#059669',
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8fbff',
    borderTopWidth: 1,
    height: 76,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 30,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: '#6b7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  fabIdle: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
  },
  fabRunning: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
});
