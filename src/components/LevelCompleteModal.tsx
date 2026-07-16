/**
 * LevelCompleteModal.tsx
 * Shown when the player clears the board (all cells matched).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LevelCompleteModalProps {
  visible: boolean;
  level: number;
  score: number;
  addRowsUsed: number;
  onNextLevel: () => void;
  onRestart: () => void;
}

export function LevelCompleteModal({
  visible,
  level,
  score,
  addRowsUsed,
  onNextLevel,
  onRestart,
}: LevelCompleteModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  // Stars based on add-row usage (fewer = more stars)
  const stars = addRowsUsed === 0 ? 3 : addRowsUsed <= 2 ? 2 : 1;
  const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Level {level} Complete!</Text>
          <Text style={styles.stars}>{starStr}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{addRowsUsed}</Text>
              <Text style={styles.statLabel}>Add Rows Used</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onNextLevel}>
            <Text style={styles.primaryBtnText}>Next Level →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onRestart}>
            <Text style={styles.secondaryBtnText}>Replay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 300,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  stars: {
    fontSize: 28,
    color: '#FBBF24',
    marginBottom: 20,
    letterSpacing: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 28,
    gap: 16,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    minWidth: 80,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1E293B',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 10,
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
