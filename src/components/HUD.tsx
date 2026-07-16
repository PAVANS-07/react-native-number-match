/**
 * HUD.tsx
 * Heads-Up Display: shows level info, score, and the Add Row button.
 */

import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MAX_ADD_ROWS_PER_LEVEL } from '../game/DifficultyConfig';

interface HUDProps {
  level: number;
  score: number;
  addRowCount: number;
  canAddRow: boolean;
  onAddRow: () => void;
  lastRescueTriggered: boolean;
  lastStragglerTriggered: boolean;
}

export function HUD({
  level,
  score,
  addRowCount,
  canAddRow,
  onAddRow,
  lastRescueTriggered,
  lastStragglerTriggered,
}: HUDProps) {
  const rescueAnim = useRef(new Animated.Value(0)).current;
  const btnScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lastRescueTriggered || lastStragglerTriggered) {
      Animated.sequence([
        Animated.timing(rescueAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(rescueAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [lastRescueTriggered, lastStragglerTriggered]);

  const handleAddRow = () => {
    if (!canAddRow) return;
    Animated.sequence([
      Animated.timing(btnScaleAnim, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onAddRow();
  };

  const remainingAdds = MAX_ADD_ROWS_PER_LEVEL - addRowCount;
  const label = lastRescueTriggered
    ? '🆘 Rescue!'
    : lastStragglerTriggered
    ? '🧹 Cleanup!'
    : null;

  return (
    <View style={styles.container}>
      {/* Level + Score */}
      <View style={styles.infoRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>LEVEL</Text>
          <Text style={styles.badgeValue}>{level}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>SCORE</Text>
          <Text style={styles.badgeValue}>{score}</Text>
        </View>
      </View>

      {/* Rescue/Straggler toast */}
      {label && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: rescueAnim,
              transform: [
                {
                  translateY: rescueAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{label}</Text>
        </Animated.View>
      )}

      {/* Add Row button + pip indicators */}
      <View style={styles.addRowSection}>
        <View style={styles.pips}>
          {Array.from({ length: MAX_ADD_ROWS_PER_LEVEL }).map((_, i) => (
            <View
              key={i}
              style={[styles.pip, i < remainingAdds ? styles.pipActive : styles.pipUsed]}
            />
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: btnScaleAnim }] }}>
          <TouchableOpacity
            style={[styles.addBtn, !canAddRow && styles.addBtnDisabled]}
            onPress={handleAddRow}
            disabled={!canAddRow}
            activeOpacity={0.75}
          >
            <Text style={styles.addBtnIcon}>＋</Text>
            <Text style={styles.addBtnText}>Add Row</Text>
            <Text style={styles.addBtnCount}>{remainingAdds} left</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 80,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 1.5,
  },
  badgeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  addRowSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pips: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pipActive: {
    backgroundColor: '#3B82F6',
  },
  pipUsed: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnDisabled: {
    backgroundColor: '#1E293B',
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtnIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  addBtnCount: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '500',
  },
});
