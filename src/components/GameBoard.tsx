/**
 * GameBoard.tsx
 * Renders the 9-column dynamic board as a scrollable grid.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Board, countStragglerRows } from '../game/MatchEngine';
import { Cell } from './Cell';

interface GameBoardProps {
  board: Board;
  onCellPress: (id: string) => void;
}

export function GameBoard({ board, onCellPress }: GameBoardProps) {
  // Identify straggler rows (rows with exactly 1 unmatched cell)
  const stragglerRowIndices = useMemo(() => {
    const indices = new Set<number>();
    board.forEach((row, rIdx) => {
      const unmatched = row.filter((c) => !c.matched).length;
      if (unmatched === 1) indices.add(rIdx);
    });
    return indices;
  }, [board]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell) => (
            <Cell
              key={cell.id}
              id={cell.id}
              value={cell.value}
              matched={cell.matched}
              selected={cell.selected}
              isStraggler={stragglerRowIndices.has(rowIndex) && !cell.matched}
              onPress={onCellPress}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
});
