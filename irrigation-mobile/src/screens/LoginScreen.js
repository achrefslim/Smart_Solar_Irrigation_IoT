import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../firebase/config';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getFriendlyError = (error) => {
    switch (error?.code) {
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled in this Firebase project.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return error?.message || 'Unable to sign in right now.';
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password to continue.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setErrorMessage(getFriendlyError(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <View style={styles.panelShapeLeft} />
      <View style={styles.panelShapeRight} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <View style={styles.logoRing}>
              <Ionicons name="sunny" size={30} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.eyebrow}>SOLAR IRRIGATION</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to monitor sensors and control your irrigation system.</Text>

          <View style={styles.formBlock}>
            <View style={styles.inputWrap}>
              <Ionicons name="mail" size={18} color="#2563eb" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="operator@email.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed" size={18} color="#2563eb" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                style={styles.input}
              />
            </View>

            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={16} color="#dc2626" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>

          <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="log-in" size={18} color="#ffffff" />
                <Text style={styles.buttonText}>Access Dashboard</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebe7ff',
    position: 'relative',
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#7c3aed',
    opacity: 0.14,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#2563eb',
    opacity: 0.12,
  },
  panelShapeLeft: {
    position: 'absolute',
    left: -42,
    top: 105,
    width: 136,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.16)',
    transform: [{ rotate: '-8deg' }],
    opacity: 0.5,
  },
  panelShapeRight: {
    position: 'absolute',
    right: -46,
    bottom: 145,
    width: 136,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.16)',
    transform: [{ rotate: '9deg' }],
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 36,
  },
  card: {
    backgroundColor: 'rgba(248,251,255,0.96)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.16)',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRing: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  eyebrow: {
    color: '#7c3aed',
    fontSize: 12,
    letterSpacing: 1.4,
    marginBottom: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  title: {
    color: '#1e1b4b',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '600',
  },
  formBlock: {
    gap: 14,
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 19,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(109,40,217,0.15)',
    color: '#1e1b4b',
    paddingLeft: 46,
    paddingRight: 16,
    paddingVertical: 17,
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.22)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    marginTop: 22,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 9,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.94,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    flex: 1,
  },
});
