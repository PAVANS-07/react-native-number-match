/**
 * GameScreen.tsx
 * Main gameplay screen — wires GameState, GameBoard, HUD, and modals together.
 */

import React, { useCallback, useReducer } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameBoard } from '../components/GameBoard';
import { HUD } from '../components/HUD';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { StuckModal } from '../components/StuckModal';
import { canAddRow } from '../game/AddRowLogic';
import { createInitialState, gameReducer } from '../game/GameState';

interface GameScreenProps {
  initialLevel?: number;
  onHome: () => void;
}

export function GameScreen({ initialLevel = 1, onHome }: GameScreenProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(initialLevel)
  );

  const handleCellPress = useCallback(
    (id: string) => dispatch({ type: 'SELECT_CELL', cellId: id }),
    []
  );

  const handleAddRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), []);
  const handleNextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL' }), []);
  const handleRestart = useCallback(() => dispatch({ type: 'RESTART_LEVEL' }), []);

  const addable = canAddRow(state.addRowCount);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onHome} style={styles.homeBtn}>
          <Text style={styles.homeBtnText}>‹ Home</Text>
        </TouchableOpacity>
        <Text style={styles.gameName}>Number Match</Text>
        <TouchableOpacity onPress={handleRestart} style={styles.restartBtn}>
          <Text style={styles.restartBtnText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* HUD */}
      <HUD
        level={state.level}
        score={state.score}
        addRowCount={state.addRowCount}
        canAddRow={addable}
        onAddRow={handleAddRow}
        lastRescueTriggered={state.lastRescueTriggered}
        lastStragglerTriggered={state.lastStragglerTriggered}
      />

      {/* Board */}
      <View style={styles.boardContainer}>
        <GameBoard board={state.board} onCellPress={handleCellPress} />
      </View>

      {/* Modals */}
      <LevelCompleteModal
        visible={state.status === 'won'}
        level={state.level}
        score={state.score}
        addRowsUsed={state.addRowCount}
        onNextLevel={handleNextLevel}
        onRestart={handleRestart}
      />
      <StuckModal
        visible={state.status === 'stuck'}
        level={state.level}
        onRestart={handleRestart}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  homeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  homeBtnText: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '600',
  },
  gameName: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  restartBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  restartBtnText: {
    color: '#64748B',
    fontSize: 20,
  },
  boardContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
