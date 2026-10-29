import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export default function ScreenShell({ children, contentStyle, scroll = true, showsVerticalScrollIndicator = false }) {
  const theme = useAppTheme();
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? {
        contentContainerStyle: [styles.content, contentStyle],
        showsVerticalScrollIndicator,
      }
    : { style: [styles.content, styles.staticContent, contentStyle] };

  return (
    <View style={[styles.shell, { backgroundColor: theme.bg }]}>
      <View style={[styles.blob, styles.blobTop, { backgroundColor: theme.purple }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: theme.primary }]} />
      <View style={[styles.blob, styles.blobCenter, { backgroundColor: theme.teal }]} />
      <View style={[styles.panelShape, styles.panelLeft, { borderColor: theme.border }]} />
      <View style={[styles.panelShape, styles.panelRight, { borderColor: theme.border }]} />
      <Content style={scroll ? styles.scroll : undefined} {...contentProps}>
        {children}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  staticContent: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.12,
  },
  blobTop: {
    width: 260,
    height: 260,
    top: -90,
    right: -100,
  },
  blobBottom: {
    width: 300,
    height: 300,
    bottom: -120,
    left: -130,
  },
  blobCenter: {
    width: 180,
    height: 180,
    top: '38%',
    right: -80,
  },
  panelShape: {
    position: 'absolute',
    width: 130,
    height: 86,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.38,
  },
  panelLeft: {
    top: 78,
    left: -42,
    transform: [{ rotate: '-8deg' }],
  },
  panelRight: {
    bottom: 135,
    right: -44,
    transform: [{ rotate: '9deg' }],
  },
});
