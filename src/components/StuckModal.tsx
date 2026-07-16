/**
 * StuckModal.tsx
 * Shown when the player runs out of moves and Add Rows (stuck state).
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

interface StuckModalProps {
  visible: boolean;
  level: number;
  onRestart: () => void;
}

export function StuckModal({ visible, level, onRestart }: StuckModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 7, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          <Text style={styles.emoji}>😵</Text>
          <Text style={styles.title}>No More Moves</Text>
          <Text style={styles.subtitle}>
            All Add Row uses are spent and no matches remain. Try again!
          </Text>

          <TouchableOpacity style={styles.btn} onPress={onRestart}>
            <Text style={styles.btnText}>↺  Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 280,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#F1F5F9', marginBottom: 8 },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  btn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
