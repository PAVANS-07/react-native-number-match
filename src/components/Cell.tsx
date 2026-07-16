/**
 * Cell.tsx
 * Individual number cell component.
 *
 * States:
 *   - default:  White/light background, dark text
 *   - selected: Highlighted border + blue tint
 *   - matched:  Invisible (opacity 0, but space preserved to keep grid layout)
 *   - straggler: Subtle orange tint (only 1 cell left in its row)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CellProps {
  id: string;
  value: number;
  matched: boolean;
  selected: boolean;
  isStraggler?: boolean;
  onPress: (id: string) => void;
}

export function Cell({ id, value, matched, selected, isStraggler, onPress }: CellProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(matched ? 0 : 1)).current;

  // Animate match-out (fade + shrink)
  useEffect(() => {
    if (matched) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.4, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [matched]);

  // Pulse animation on select
  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      ]).start();
    } else if (!matched) {
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
    }
  }, [selected]);

  return (
    <TouchableOpacity
      onPress={() => !matched && onPress(id)}
      activeOpacity={matched ? 1 : 0.7}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.cell,
          selected && styles.selected,
          isStraggler && !selected && styles.straggler,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {!matched && (
          <Text style={[styles.text, selected && styles.selectedText]}>
            {value}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const CELL_SIZE = 34;

const styles = StyleSheet.create({
  touchable: {
    padding: 2,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  straggler: {
    backgroundColor: '#1C2038',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
