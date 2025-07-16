import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Player, CombatAction } from '../types/game';
import { Sword, Shield, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundSystem } from '../utils/soundSystem';

interface CombatUIProps {
  player: Player;
  enemy: Player;
  isGameActive: boolean;
  winner: string | null;
  combatLog: string[];
  onAttack: (action: CombatAction) => void;
  onBlock: (blocking: boolean) => void;
  onChangeWeapon: (weaponType: 'longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail') => void;
  onChangeArmor: (armorType: 'none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine') => void;
  onResetGame: () => void;
  availableWeapons?: ('longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail')[];
  availableArmors?: ('none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine')[];
  currentLevel?: number;
  levelName?: string;
}

export default function CombatUI({
  player,
  enemy,
  isGameActive,
  winner,
  combatLog,
  onAttack,
  onBlock,
  onChangeWeapon,
  onChangeArmor,
  onResetGame,
  availableWeapons = ['longsword', 'dagger', 'mace', 'battleaxe', 'warhammer', 'rapier', 'greatsword', 'flail'],
  availableArmors = ['none', 'leather', 'chainmail', 'plate', 'scale', 'brigandine'],
  currentLevel = 1,
  levelName = 'Medieval Combat Arena',
}: CombatUIProps) {
  const [isBlocking, setIsBlocking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedWeapon, setSelectedWeapon] = useState<'longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail'>('longsword');
  const [selectedArmor, setSelectedArmor] = useState<'none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine'>('chainmail');

  const handleAttack = useCallback((direction: 'left' | 'right' | 'overhead' | 'thrust') => {
    if (!isGameActive || player.stamina < player.weapon.staminaCost) return;

    const action: CombatAction = {
      type: 'attack',
      direction,
      success: true,
    };

    onAttack(action);

    // Play realistic attack sound
    if (soundEnabled) {
      soundSystem.setSoundEnabled(true);
      soundSystem.resumeAudioContext();
      soundSystem.playAttackSound(player.weapon.type);
    }
  }, [isGameActive, player.stamina, player.weapon.staminaCost, onAttack, soundEnabled, player.weapon.type]);

  const handleBlock = useCallback((blocking: boolean) => {
    setIsBlocking(blocking);
    onBlock(blocking);
    
    // Play block sound when starting to block
    if (blocking && soundEnabled) {
      soundSystem.setSoundEnabled(true);
      soundSystem.resumeAudioContext();
      soundSystem.playBlockSound();
    }
  }, [onBlock, soundEnabled]);

  useEffect(() => {
    if (!isGameActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for space key to avoid page scrolling
      if (e.key === ' ') {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'q':
          e.preventDefault();
          handleAttack('left');
          break;
        case 'e':
          e.preventDefault();
          handleAttack('overhead');
          break;
        case 'r':
          e.preventDefault();
          handleAttack('right');
          break;
        case 't':
          e.preventDefault();
          handleAttack('thrust');
          break;
        case ' ':
          handleBlock(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleBlock(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameActive, handleAttack, handleBlock]);

  const handleWeaponChange = (weaponType: 'longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail') => {
    setSelectedWeapon(weaponType);
    onChangeWeapon(weaponType);
  };

  const handleArmorChange = (armorType: 'none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine') => {
    setSelectedArmor(armorType);
    onChangeArmor(armorType);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        {/* Player Stats */}
        <Card className="combat-ui p-4 min-w-[280px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel-decorative text-lg text-secondary">{player.name}</h3>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-secondary border-secondary text-xs">
                  {player.weapon.type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-secondary border-secondary text-xs">
                  {player.armor.type.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>{player.health}/{player.maxHealth}</span>
              </div>
              <Progress 
                value={(player.health / player.maxHealth) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Stamina</span>
                <span>{Math.floor(player.stamina)}/{player.maxStamina}</span>
              </div>
              <Progress 
                value={(player.stamina / player.maxStamina) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Armor</span>
                <span>{player.armor.durability}/{player.armor.maxDurability}</span>
              </div>
              <Progress 
                value={(player.armor.durability / player.armor.maxDurability) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </Card>

        {/* Enemy Stats */}
        <Card className="combat-ui p-4 min-w-[280px]">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-cinzel-decorative text-lg text-primary">{enemy.name}</h3>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-primary border-primary text-xs">
                  {enemy.weapon.type.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-primary border-primary text-xs">
                  {enemy.armor.type.toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Health</span>
                <span>{enemy.health}/{enemy.maxHealth}</span>
              </div>
              <Progress 
                value={(enemy.health / enemy.maxHealth) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Stamina</span>
                <span>{Math.floor(enemy.stamina)}/{enemy.maxStamina}</span>
              </div>
              <Progress 
                value={(enemy.stamina / enemy.maxStamina) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Armor</span>
                <span>{enemy.armor.durability}/{enemy.armor.maxDurability}</span>
              </div>
              <Progress 
                value={(enemy.armor.durability / enemy.armor.maxDurability) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Combat Log */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <Card className="combat-ui p-3 min-w-[400px] max-w-[600px]">
          <div className="space-y-1 text-center">
            {combatLog.slice(-3).map((log, index) => (
              <p key={index} className="text-sm font-cinzel text-secondary">
                {log}
              </p>
            ))}
            {combatLog.length === 0 && (
              <p className="text-sm font-cinzel text-muted-foreground">
                Click to lock mouse cursor. WASD to move, Q/E/R/T to attack, SPACE to block
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
        {/* Equipment Selection */}
        <div className="flex gap-4">
          {/* Weapon Selection */}
          <Card className="combat-ui p-4">
            <h4 className="font-cinzel-decorative text-sm text-secondary mb-3">Weapons</h4>
            <div className="grid grid-cols-2 gap-2 max-w-[300px]">
              {availableWeapons.map((weapon) => (
                <Button
                  key={weapon}
                  variant={selectedWeapon === weapon ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleWeaponChange(weapon)}
                  disabled={!isGameActive}
                  className="font-cinzel text-xs"
                >
                  <Sword className="w-3 h-3 mr-1" />
                  {weapon}
                </Button>
              ))}
            </div>
          </Card>

          {/* Armor Selection */}
          <Card className="combat-ui p-4">
            <h4 className="font-cinzel-decorative text-sm text-secondary mb-3">Armor</h4>
            <div className="grid grid-cols-2 gap-2 max-w-[240px]">
              {availableArmors.map((armor) => (
                <Button
                  key={armor}
                  variant={selectedArmor === armor ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArmorChange(armor)}
                  disabled={!isGameActive}
                  className="font-cinzel text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {armor}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Movement Controls */}
        <Card className="combat-ui p-4">
          <h4 className="font-cinzel-decorative text-sm text-secondary mb-3">Movement</h4>
          <div className="grid grid-cols-3 gap-1 mb-3">
            <div></div>
            <Button
              variant="outline"
              size="sm"
              className="font-cinzel text-xs"
              disabled
            >
              W<br/>Forward
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="sm"
              className="font-cinzel text-xs"
              disabled
            >
              A<br/>Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-cinzel text-xs"
              disabled
            >
              S<br/>Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="font-cinzel text-xs"
              disabled
            >
              D<br/>Right
            </Button>
          </div>
        </Card>

        {/* Combat Controls */}
        <Card className="combat-ui p-4">
          <h4 className="font-cinzel-decorative text-sm text-secondary mb-3">Combat</h4>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttack('left')}
              disabled={!isGameActive || player.stamina < player.weapon.staminaCost}
              className="font-cinzel"
            >
              Q<br/>Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttack('overhead')}
              disabled={!isGameActive || player.stamina < player.weapon.staminaCost}
              className="font-cinzel"
            >
              E<br/>Over
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttack('right')}
              disabled={!isGameActive || player.stamina < player.weapon.staminaCost}
              className="font-cinzel"
            >
              R<br/>Right
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAttack('thrust')}
              disabled={!isGameActive || player.stamina < player.weapon.staminaCost}
              className="font-cinzel"
            >
              T<br/>Thrust
            </Button>
          </div>
          <Button
            variant={isBlocking ? "default" : "outline"}
            className="w-full font-cinzel"
            onMouseDown={() => handleBlock(true)}
            onMouseUp={() => handleBlock(false)}
            onMouseLeave={() => handleBlock(false)}
            disabled={!isGameActive}
          >
            <Shield className="w-4 h-4 mr-2" />
            SPACE - Block
          </Button>
        </Card>

        {/* Game Controls */}
        <Card className="combat-ui p-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newSoundEnabled = !soundEnabled;
                setSoundEnabled(newSoundEnabled);
                soundSystem.setSoundEnabled(newSoundEnabled);
              }}
              className="font-cinzel"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetGame}
              className="font-cinzel"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Game Over Screen */}
      {!isGameActive && winner && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto">
          <Card className="combat-ui p-8 text-center max-w-md">
            <h2 className="font-cinzel-decorative text-3xl mb-4 text-secondary">
              {winner === player.name ? 'VICTORY!' : 'DEFEAT!'}
            </h2>
            <p className="font-cinzel text-lg mb-6 text-muted-foreground">
              {winner} emerges victorious from the arena!
            </p>
            <Button
              onClick={onResetGame}
              className="font-cinzel-decorative text-lg px-8 py-3"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Return to Levels
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}