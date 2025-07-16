import { useEffect, useRef } from 'react';
import { Player, CombatAction } from '../types/game';

interface EnemyAIProps {
  enemy: Player;
  player: Player;
  isGameActive: boolean;
  onEnemyAttack: (action: CombatAction) => void;
  onEnemyBlock: (blocking: boolean) => void;
  aggression?: number; // 0-1, how aggressive the AI is
}

export default function EnemyAI({
  enemy,
  player,
  isGameActive,
  onEnemyAttack,
  onEnemyBlock,
  aggression = 0.5,
}: EnemyAIProps) {
  const lastActionTime = useRef(0);
  const isBlocking = useRef(false);
  const blockingTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastPlayerAction = useRef<string>('');
  const consecutiveAttacks = useRef(0);
  const reactionTime = useRef(300 + Math.random() * 200); // Variable reaction time

  useEffect(() => {
    if (!isGameActive || enemy.isDead) return;

    let aiInterval: NodeJS.Timeout;
    
    const startAI = () => {
      aiInterval = setInterval(() => {
        const now = Date.now();
        
        // Variable action frequency based on aggression and health
        const baseDelay = 1200 - (aggression * 400); // 1200ms to 800ms
        const healthMultiplier = (enemy.health / enemy.maxHealth) < 0.3 ? 0.7 : 1; // Faster when desperate
        const actionDelay = baseDelay * healthMultiplier;
        
        if (now - lastActionTime.current < actionDelay) return;

        // Enhanced AI Decision Making
        const playerDistance = Math.abs(player.position.x - enemy.position.x);
        const enemyHealthPercent = enemy.health / enemy.maxHealth;
        const playerHealthPercent = player.health / player.maxHealth;
        const enemyStaminaPercent = enemy.stamina / enemy.maxStamina;
        const playerStaminaPercent = player.stamina / player.maxStamina;

        // Advanced decision weights
        let attackChance = 0.15 + (aggression * 0.35);
        let blockChance = 0.3 - (aggression * 0.15);
        let waitChance = 0.3;
        let counterAttackChance = 0.1;

        // Adaptive behavior based on enemy health
        if (enemyHealthPercent < 0.2) {
          // Desperate - very aggressive or very defensive
          if (Math.random() < 0.6) {
            attackChance += 0.4; // Berserker mode
            blockChance -= 0.2;
          } else {
            blockChance += 0.4; // Turtle mode
            attackChance -= 0.2;
          }
        } else if (enemyHealthPercent < 0.5) {
          // Wounded - more cautious
          blockChance += 0.2;
          attackChance -= 0.1;
          waitChance += 0.1;
        }

        // React to player's health
        if (playerHealthPercent < 0.3) {
          // Player is weak - press the advantage
          attackChance += 0.3;
          blockChance -= 0.15;
        } else if (playerHealthPercent > 0.8) {
          // Player is strong - be more defensive
          blockChance += 0.2;
          attackChance -= 0.1;
        }

        // Stamina management
        if (enemyStaminaPercent < 0.2) {
          // Very low stamina - must be defensive
          attackChance = 0.05;
          blockChance += 0.3;
          waitChance += 0.4;
        } else if (enemyStaminaPercent < 0.4) {
          // Low stamina - reduce attacks
          attackChance *= 0.6;
          blockChance += 0.2;
        }

        // Take advantage of player's low stamina
        if (playerStaminaPercent < 0.3) {
          attackChance += 0.25;
          blockChance -= 0.1;
        }

        // Distance-based decisions
        if (playerDistance > 2.5) {
          // Too far - mostly wait or move closer
          waitChance += 0.4;
          attackChance *= 0.3;
        } else if (playerDistance < 1.0) {
          // Very close - higher chance of attacks
          attackChance += 0.2;
        }

        // React to player actions with realistic delay
        if (player.isAttacking && (now - lastActionTime.current) > reactionTime.current) {
          // Player is attacking - high chance to block or counter
          blockChance += 0.4;
          counterAttackChance += 0.2;
          attackChance -= 0.2;
        }

        // Prevent spam attacks - reduce chance after consecutive attacks
        if (consecutiveAttacks.current > 2) {
          attackChance *= 0.4;
          waitChance += 0.3;
        }

        // Pattern breaking - occasionally do unexpected moves
        if (Math.random() < 0.1) {
          const randomAction = Math.random();
          if (randomAction < 0.4) {
            attackChance += 0.3;
          } else if (randomAction < 0.7) {
            blockChance += 0.3;
          } else {
            waitChance += 0.3;
          }
        }

        const random = Math.random();
        const totalChance = attackChance + blockChance + counterAttackChance;

        if (random < attackChance / totalChance && enemy.stamina >= enemy.weapon.staminaCost) {
          // Choose attack direction based on strategy
          const directions: Array<'left' | 'right' | 'overhead' | 'thrust'> = ['left', 'right', 'overhead', 'thrust'];
          
          // Smart direction choice based on previous attacks and player position
          let chosenDirection: 'left' | 'right' | 'overhead' | 'thrust';
          
          if (playerHealthPercent < 0.3) {
            // Go for killing blow - overhead or thrust
            chosenDirection = Math.random() < 0.6 ? 'overhead' : 'thrust';
          } else if (player.isBlocking) {
            // Try to break guard with heavy attacks
            chosenDirection = Math.random() < 0.7 ? 'overhead' : 'thrust';
          } else {
            // Mix up attacks to be unpredictable
            chosenDirection = directions[Math.floor(Math.random() * directions.length)];
          }

          const action: CombatAction = {
            type: 'attack',
            direction: chosenDirection,
            success: true,
          };

          onEnemyAttack(action);
          lastActionTime.current = now;
          consecutiveAttacks.current++;

          // Stop blocking if we were blocking
          if (isBlocking.current) {
            isBlocking.current = false;
            onEnemyBlock(false);
            if (blockingTimeout.current) {
              clearTimeout(blockingTimeout.current);
              blockingTimeout.current = null;
            }
          }

          // Vary reaction time for next action
          reactionTime.current = 200 + Math.random() * 300;

        } else if (random < (attackChance + counterAttackChance) / totalChance && 
                   enemy.stamina >= enemy.weapon.staminaCost && 
                   player.isAttacking) {
          
          // Counter-attack - immediate response to player attack
          const counterDirections: Array<'left' | 'right' | 'overhead' | 'thrust'> = ['thrust', 'overhead'];
          const direction = counterDirections[Math.floor(Math.random() * counterDirections.length)];

          const action: CombatAction = {
            type: 'attack',
            direction,
            success: true,
          };

          onEnemyAttack(action);
          lastActionTime.current = now;
          consecutiveAttacks.current++;

          // Stop blocking
          if (isBlocking.current) {
            isBlocking.current = false;
            onEnemyBlock(false);
            if (blockingTimeout.current) {
              clearTimeout(blockingTimeout.current);
              blockingTimeout.current = null;
            }
          }

        } else if (random < (attackChance + counterAttackChance + blockChance) / totalChance && !isBlocking.current) {
          // Start blocking with intelligent duration
          isBlocking.current = true;
          onEnemyBlock(true);
          lastActionTime.current = now;
          consecutiveAttacks.current = 0; // Reset attack counter

          // Smart block duration based on situation
          let blockDuration = 800 + Math.random() * 1200; // Base 0.8-2.0 seconds
          
          if (player.isAttacking) {
            blockDuration = 400 + Math.random() * 600; // Shorter block during player attack
          } else if (enemyStaminaPercent < 0.3) {
            blockDuration *= 1.5; // Longer block when low stamina
          } else if (playerHealthPercent < 0.3) {
            blockDuration *= 0.7; // Shorter block when player is weak
          }

          blockingTimeout.current = setTimeout(() => {
            if (isBlocking.current) {
              isBlocking.current = false;
              onEnemyBlock(false);
            }
          }, blockDuration);

        } else {
          // Wait/idle - reset consecutive attacks
          consecutiveAttacks.current = Math.max(0, consecutiveAttacks.current - 1);
        }

        // Update last player action for pattern recognition
        if (player.isAttacking && lastPlayerAction.current !== 'attacking') {
          lastPlayerAction.current = 'attacking';
          reactionTime.current = 150 + Math.random() * 200; // Faster reaction to attacks
        } else if (player.isBlocking && lastPlayerAction.current !== 'blocking') {
          lastPlayerAction.current = 'blocking';
        } else if (!player.isAttacking && !player.isBlocking) {
          lastPlayerAction.current = 'idle';
        }

      }, 200); // Check every 200ms for more responsive AI
    };

    startAI();

    return () => {
      if (aiInterval) {
        clearInterval(aiInterval);
      }
      if (blockingTimeout.current) {
        clearTimeout(blockingTimeout.current);
        blockingTimeout.current = null;
      }
    };
  }, [isGameActive, enemy, player, onEnemyAttack, onEnemyBlock, aggression]);

  // This component doesn't render anything
  return null;
}