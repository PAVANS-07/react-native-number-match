/**
 * App.tsx
 * Root of the Number Match Puzzle Game.
 * Simple two-screen navigation: Home ↔ Game.
 */

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';

type Screen = 'home' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedLevel, setSelectedLevel] = useState(1);

  return (
    <SafeAreaProvider>
      {screen === 'game' ? (
        <GameScreen
          initialLevel={selectedLevel}
          onHome={() => setScreen('home')}
        />
      ) : (
        <HomeScreen
          onStartGame={(level) => {
            setSelectedLevel(level);
            setScreen('game');
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
