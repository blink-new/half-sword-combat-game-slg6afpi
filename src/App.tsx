import { useEffect, useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useScreenEffects } from './hooks/useScreenEffects';
import CombatArena from './components/CombatArena';
import CombatUI from './components/CombatUI';
import EnemyAI from './components/EnemyAI';
import LevelSelect from './components/LevelSelect';
import { CombatAction } from './types/game';
import { isWebGLSupported, isPerformanceAdequate } from './utils/webgl';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [performanceWarning, setPerformanceWarning] = useState(false);

  const {
    gameState,
    performAttack,
    setBlocking,
    regenerateStamina,
    changeWeapon,
    changeArmor,
    resetGame,
    updateParticles,
    startLevel,
    returnToLevelSelect,
    LEVELS,
  } = useGameState();

  const { effects, triggerShake, triggerFlash, triggerBloodOverlay } = useScreenEffects();

  // Check WebGL support on mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const supported = isWebGLSupported();
        setWebglSupported(supported);
        
        if (supported && !isPerformanceAdequate()) {
          setPerformanceWarning(true);
        }
      } catch (error) {
        console.warn('WebGL check failed:', error);
        setWebglSupported(false);
      }
    };

    checkWebGL();
  }, []);

  // Regenerate stamina with reduced frequency
  useEffect(() => {
    if (!gameState.isGameActive) return;

    const staminaInterval = setInterval(() => {
      try {
        regenerateStamina();
      } catch (error) {
        console.warn('Stamina regeneration error:', error);
      }
    }, 250); // Reduced frequency

    return () => clearInterval(staminaInterval);
  }, [regenerateStamina, gameState.isGameActive]);

  const handlePlayerAttack = useCallback((action: CombatAction) => {
    try {
      performAttack('player', action);
      triggerShake(150); // Reduced duration
    } catch (error) {
      console.error('Player attack error:', error);
    }
  }, [performAttack, triggerShake]);

  const handlePlayerBlock = useCallback((blocking: boolean) => {
    try {
      setBlocking('player', blocking);
    } catch (error) {
      console.error('Player block error:', error);
    }
  }, [setBlocking]);

  const handlePlayerWeaponChange = useCallback((weaponType: 'longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail') => {
    try {
      changeWeapon('player', weaponType);
    } catch (error) {
      console.error('Weapon change error:', error);
    }
  }, [changeWeapon]);

  const handlePlayerArmorChange = useCallback((armorType: 'none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine') => {
    try {
      changeArmor('player', armorType);
    } catch (error) {
      console.error('Armor change error:', error);
    }
  }, [changeArmor]);

  const handleEnemyAttack = useCallback((action: CombatAction) => {
    try {
      performAttack('enemy', action);
      triggerFlash(100); // Reduced duration
      triggerBloodOverlay(200); // Reduced duration
    } catch (error) {
      console.error('Enemy attack error:', error);
    }
  }, [performAttack, triggerFlash, triggerBloodOverlay]);

  const handleEnemyBlock = useCallback((blocking: boolean) => {
    try {
      setBlocking('enemy', blocking);
    } catch (error) {
      console.error('Enemy block error:', error);
    }
  }, [setBlocking]);

  const handleResetGame = useCallback(() => {
    try {
      resetGame();
    } catch (error) {
      console.error('Reset game error:', error);
    }
  }, [resetGame]);

  const handleStartLevel = useCallback((levelId: number) => {
    try {
      startLevel(levelId);
    } catch (error) {
      console.error('Start level error:', error);
    }
  }, [startLevel]);

  const handleReturnToLevelSelect = useCallback(() => {
    try {
      returnToLevelSelect();
    } catch (error) {
      console.error('Return to level select error:', error);
    }
  }, [returnToLevelSelect]);

  // Get current level data for enemy aggression
  const currentLevelData = LEVELS.find(l => l.id === gameState.currentLevel);

  // Show WebGL not supported error
  if (webglSupported === false) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="font-cinzel-decorative text-2xl text-red-500 mb-4">
            WebGL Not Supported
          </h2>
          <p className="font-cinzel text-muted-foreground mb-6">
            Your browser or device doesn't support WebGL, which is required for the 3D combat arena. 
            Please try using a modern browser like Chrome, Firefox, or Safari.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="font-cinzel"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Show loading while checking WebGL
  if (webglSupported === null) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="font-cinzel text-secondary">Initializing Combat Arena...</p>
        </div>
      </div>
    );
  }

  // Show level select screen
  if (gameState.isInLevelSelect) {
    return (
      <ErrorBoundary>
        {performanceWarning && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="p-4 bg-yellow-900/80 border-yellow-600">
              <p className="font-cinzel text-yellow-200 text-sm text-center">
                ⚠️ Your device may experience performance issues with 3D graphics
              </p>
            </Card>
          </div>
        )}
        <LevelSelect
          levels={LEVELS}
          completedLevels={gameState.completedLevels}
          currentLevel={gameState.currentLevel}
          onSelectLevel={handleStartLevel}
          onResetProgress={handleResetGame}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`w-screen h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden ${
        effects.shake ? 'animate-pulse' : ''
      }`}>
        {/* Screen Effects */}
        {effects.flash && (
          <div className="absolute inset-0 bg-white opacity-20 z-50 pointer-events-none animate-ping" />
        )}
        {effects.bloodOverlay && (
          <div className="absolute inset-0 bg-red-900 opacity-15 z-40 pointer-events-none animate-pulse" />
        )}
        
        {/* Combat Arena */}
        <CombatArena
          player={gameState.player}
          enemy={gameState.enemy}
          particles={gameState.particles}
          onUpdateParticles={updateParticles}
        />

        {/* Combat UI Overlay */}
        <CombatUI
          player={gameState.player}
          enemy={gameState.enemy}
          isGameActive={gameState.isGameActive}
          winner={gameState.winner}
          combatLog={gameState.combatLog}
          onAttack={handlePlayerAttack}
          onBlock={handlePlayerBlock}
          onChangeWeapon={handlePlayerWeaponChange}
          onChangeArmor={handlePlayerArmorChange}
          onResetGame={handleReturnToLevelSelect}
          availableWeapons={gameState.availableWeapons}
          availableArmors={gameState.availableArmors}
          currentLevel={gameState.currentLevel}
          levelName={currentLevelData?.name || 'Unknown Level'}
        />

        {/* Enemy AI */}
        <EnemyAI
          enemy={gameState.enemy}
          player={gameState.player}
          isGameActive={gameState.isGameActive}
          onEnemyAttack={handleEnemyAttack}
          onEnemyBlock={handleEnemyBlock}
          aggression={currentLevelData?.enemyAggression || 0.5}
        />

        {/* Medieval Title */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <h1 className="font-cinzel-decorative text-4xl md:text-6xl text-secondary text-center drop-shadow-2xl">
            HALF SWORD
          </h1>
          <p className="font-cinzel text-lg md:text-xl text-center text-muted-foreground mt-2">
            Level {gameState.currentLevel}: {currentLevelData?.name || 'Medieval Combat Arena'}
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;