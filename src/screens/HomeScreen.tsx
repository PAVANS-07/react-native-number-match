/**
 * HomeScreen.tsx
 * Landing screen — select a level or start from Level 1.
 */

import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LEVEL_CONFIGS } from '../game/DifficultyConfig';

interface HomeScreenProps {
  onStartGame: (level: number) => void;
}

const LEVELS = Object.values(LEVEL_CONFIGS);

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>◈</Text>
        <Text style={styles.title}>Number Match</Text>
        <Text style={styles.subtitle}>
          Match pairs that are equal or sum to 10
        </Text>
      </View>

      {/* Rules card */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>How to Play</Text>
        <Text style={styles.ruleItem}>• Tap two numbers to match them</Text>
        <Text style={styles.ruleItem}>• Same number (5 &amp; 5) or sum to 10 (3 &amp; 7)</Text>
        <Text style={styles.ruleItem}>• Match across rows, columns, diagonals &amp; wrap-around</Text>
        <Text style={styles.ruleItem}>• Use (+) Add Row if you're stuck — up to 6 times</Text>
        <Text style={styles.ruleItem}>• Clear the entire board to win!</Text>
      </View>

      {/* Level grid */}
      <Text style={styles.sectionLabel}>SELECT LEVEL</Text>
      <ScrollView style={styles.levelScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.levelGrid}>
          {LEVELS.map((cfg) => {
            const isRelief = cfg.level === 6 || cfg.level === 11;
            return (
              <TouchableOpacity
                key={cfg.level}
                style={[styles.levelBtn, isRelief && styles.reliefBtn]}
                onPress={() => onStartGame(cfg.level)}
                activeOpacity={0.8}
              >
                <Text style={styles.levelNum}>{cfg.level}</Text>
                {isRelief && <Text style={styles.reliefTag}>Relief</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Quick start */}
      <TouchableOpacity style={styles.startBtn} onPress={() => onStartGame(1)}>
        <Text style={styles.startBtnText}>▶  Start from Level 1</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
    color: '#3B82F6',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  rulesCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  rulesTitle: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 6,
  },
  ruleItem: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 20,
  },
  sectionLabel: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  levelScroll: {
    flex: 1,
    marginBottom: 12,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reliefBtn: {
    backgroundColor: '#1C2038',
    borderColor: '#3B82F6',
  },
  levelNum: {
    color: '#F1F5F9',
    fontSize: 18,
    fontWeight: '800',
  },
  reliefTag: {
    color: '#3B82F6',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
