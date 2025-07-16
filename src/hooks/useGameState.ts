import { useState, useCallback, useRef } from 'react';
import { GameState, Player, Weapon, Armor, BloodSplatter, Particle, CombatAction, Wound, SeveredLimb, Level } from '../types/game';
import { soundSystem } from '../utils/soundSystem';
import { checkWeaponHit, calculateLocationDamage, constrainToArena, updateParticlePhysics } from '../utils/physics';

const WEAPONS: Record<string, Weapon> = {
  longsword: { type: 'longsword', damage: 35, speed: 0.8, reach: 1.5, staminaCost: 25, armorPiercing: 0.3, criticalChance: 0.1, bloodLevel: 0, lastBloodTime: 0 },
  dagger: { type: 'dagger', damage: 20, speed: 1.5, reach: 0.8, staminaCost: 15, armorPiercing: 0.6, criticalChance: 0.2, bloodLevel: 0, lastBloodTime: 0 },
  mace: { type: 'mace', damage: 45, speed: 0.6, reach: 1.2, staminaCost: 35, armorPiercing: 0.8, criticalChance: 0.05, bloodLevel: 0, lastBloodTime: 0 },
  battleaxe: { type: 'battleaxe', damage: 50, speed: 0.5, reach: 1.3, staminaCost: 40, armorPiercing: 0.7, criticalChance: 0.15, bloodLevel: 0, lastBloodTime: 0 },
  warhammer: { type: 'warhammer', damage: 55, speed: 0.4, reach: 1.1, staminaCost: 45, armorPiercing: 0.9, criticalChance: 0.08, bloodLevel: 0, lastBloodTime: 0 },
  rapier: { type: 'rapier', damage: 25, speed: 1.2, reach: 1.4, staminaCost: 20, armorPiercing: 0.4, criticalChance: 0.25, bloodLevel: 0, lastBloodTime: 0 },
  greatsword: { type: 'greatsword', damage: 60, speed: 0.3, reach: 1.8, staminaCost: 50, armorPiercing: 0.5, criticalChance: 0.12, bloodLevel: 0, lastBloodTime: 0 },
  flail: { type: 'flail', damage: 40, speed: 0.7, reach: 1.3, staminaCost: 30, armorPiercing: 0.6, criticalChance: 0.18, bloodLevel: 0, lastBloodTime: 0 },
};

const ARMORS: Record<string, Armor> = {
  none: { type: 'none', protection: 0, weight: 0, durability: 100, maxDurability: 100 },
  leather: { type: 'leather', protection: 0.15, weight: 5, durability: 80, maxDurability: 80 },
  chainmail: { type: 'chainmail', protection: 0.35, weight: 15, durability: 120, maxDurability: 120 },
  scale: { type: 'scale', protection: 0.45, weight: 20, durability: 100, maxDurability: 100 },
  brigandine: { type: 'brigandine', protection: 0.55, weight: 25, durability: 140, maxDurability: 140 },
  plate: { type: 'plate', protection: 0.7, weight: 35, durability: 200, maxDurability: 200 },
};

const LEVELS: Level[] = [
  {
    id: 1,
    name: "The Peasant Uprising",
    description: "Face a desperate peasant armed with only a dagger. Your first taste of blood.",
    enemyName: "Desperate Peasant",
    enemyWeapon: "dagger",
    enemyArmor: "none",
    enemyHealthMultiplier: 0.7,
    enemyStaminaMultiplier: 0.8,
    enemySpeedMultiplier: 1.2,
    enemyAggression: 0.3,
    rewardWeapon: "dagger",
    backgroundTheme: "dungeon",
  },
  {
    id: 2,
    name: "The Village Guard",
    description: "A town guard challenges your authority. He's better equipped but still green.",
    enemyName: "Village Guard",
    enemyWeapon: "longsword",
    enemyArmor: "leather",
    enemyHealthMultiplier: 0.9,
    enemyStaminaMultiplier: 0.9,
    enemySpeedMultiplier: 1.0,
    enemyAggression: 0.4,
    rewardArmor: "leather",
    backgroundTheme: "castle",
  },
  {
    id: 3,
    name: "The Bandit Leader",
    description: "A ruthless bandit who's survived many battles. His mace has crushed many skulls.",
    enemyName: "Bandit Leader",
    enemyWeapon: "mace",
    enemyArmor: "leather",
    enemyHealthMultiplier: 1.0,
    enemyStaminaMultiplier: 1.0,
    enemySpeedMultiplier: 0.9,
    enemyAggression: 0.6,
    rewardWeapon: "mace",
    backgroundTheme: "forest",
  },
  {
    id: 4,
    name: "The Mercenary",
    description: "A battle-hardened mercenary with chainmail and a sharp blade. No mercy expected.",
    enemyName: "Grizzled Mercenary",
    enemyWeapon: "longsword",
    enemyArmor: "chainmail",
    enemyHealthMultiplier: 1.1,
    enemyStaminaMultiplier: 1.1,
    enemySpeedMultiplier: 1.0,
    enemyAggression: 0.5,
    rewardArmor: "chainmail",
    backgroundTheme: "dungeon",
  },
  {
    id: 5,
    name: "The Executioner",
    description: "The king's executioner wields a massive battleaxe. One wrong move means death.",
    enemyName: "Royal Executioner",
    enemyWeapon: "battleaxe",
    enemyArmor: "chainmail",
    enemyHealthMultiplier: 1.2,
    enemyStaminaMultiplier: 1.0,
    enemySpeedMultiplier: 0.8,
    enemyAggression: 0.7,
    rewardWeapon: "battleaxe",
    backgroundTheme: "castle",
    specialEffects: ["blood_rain"],
  },
  {
    id: 6,
    name: "The Duelist",
    description: "A noble duelist with a rapier. Fast, precise, and deadly in the right hands.",
    enemyName: "Noble Duelist",
    enemyWeapon: "rapier",
    enemyArmor: "brigandine",
    enemyHealthMultiplier: 0.9,
    enemyStaminaMultiplier: 1.3,
    enemySpeedMultiplier: 1.4,
    enemyAggression: 0.4,
    rewardWeapon: "rapier",
    backgroundTheme: "castle",
  },
  {
    id: 7,
    name: "The Berserker",
    description: "A wild berserker from the north. His warhammer can shatter bones and armor alike.",
    enemyName: "Northern Berserker",
    enemyWeapon: "warhammer",
    enemyArmor: "scale",
    enemyHealthMultiplier: 1.3,
    enemyStaminaMultiplier: 1.2,
    enemySpeedMultiplier: 0.7,
    enemyAggression: 0.8,
    rewardWeapon: "warhammer",
    backgroundTheme: "ice",
    specialEffects: ["frost_breath"],
  },
  {
    id: 8,
    name: "The Knight Errant",
    description: "A wandering knight in scale armor. Honorable but deadly in combat.",
    enemyName: "Knight Errant",
    enemyWeapon: "longsword",
    enemyArmor: "scale",
    enemyHealthMultiplier: 1.2,
    enemyStaminaMultiplier: 1.1,
    enemySpeedMultiplier: 0.9,
    enemyAggression: 0.5,
    rewardArmor: "scale",
    backgroundTheme: "forest",
  },
  {
    id: 9,
    name: "The Crusader",
    description: "A holy warrior with brigandine armor and unwavering faith. His flail seeks justice.",
    enemyName: "Holy Crusader",
    enemyWeapon: "flail",
    enemyArmor: "brigandine",
    enemyHealthMultiplier: 1.3,
    enemyStaminaMultiplier: 1.2,
    enemySpeedMultiplier: 0.8,
    enemyAggression: 0.6,
    rewardWeapon: "flail",
    backgroundTheme: "castle",
    specialEffects: ["holy_light"],
  },
  {
    id: 10,
    name: "The Desert Warrior",
    description: "A warrior from the southern deserts. His curved blade dances like the wind.",
    enemyName: "Desert Scimitar",
    enemyWeapon: "longsword",
    enemyArmor: "brigandine",
    enemyHealthMultiplier: 1.1,
    enemyStaminaMultiplier: 1.4,
    enemySpeedMultiplier: 1.2,
    enemyAggression: 0.7,
    rewardArmor: "brigandine",
    backgroundTheme: "desert",
    specialEffects: ["sand_storm"],
  },
  {
    id: 11,
    name: "The Champion",
    description: "The arena champion with a massive greatsword. Many have tried, all have failed.",
    enemyName: "Arena Champion",
    enemyWeapon: "greatsword",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.4,
    enemyStaminaMultiplier: 1.1,
    enemySpeedMultiplier: 0.6,
    enemyAggression: 0.6,
    rewardWeapon: "greatsword",
    backgroundTheme: "castle",
    specialEffects: ["crowd_cheers"],
  },
  {
    id: 12,
    name: "The Black Knight",
    description: "A mysterious knight in black plate armor. His identity is unknown, his skill legendary.",
    enemyName: "Black Knight",
    enemyWeapon: "longsword",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.5,
    enemyStaminaMultiplier: 1.3,
    enemySpeedMultiplier: 1.0,
    enemyAggression: 0.7,
    rewardArmor: "plate",
    backgroundTheme: "dungeon",
    specialEffects: ["dark_aura"],
  },
  {
    id: 13,
    name: "The Demon Spawn",
    description: "A creature from the depths of hell. Its claws are sharper than any blade.",
    enemyName: "Demon Spawn",
    enemyWeapon: "dagger",
    enemyArmor: "none",
    enemyHealthMultiplier: 1.2,
    enemyStaminaMultiplier: 1.5,
    enemySpeedMultiplier: 1.6,
    enemyAggression: 0.9,
    backgroundTheme: "hell",
    specialEffects: ["hellfire", "demon_roar"],
  },
  {
    id: 14,
    name: "The Lich King",
    description: "An undead sorcerer-warrior. Death has only made him stronger and more ruthless.",
    enemyName: "Lich King",
    enemyWeapon: "battleaxe",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.6,
    enemyStaminaMultiplier: 1.4,
    enemySpeedMultiplier: 0.8,
    enemyAggression: 0.8,
    backgroundTheme: "hell",
    specialEffects: ["necromancy", "bone_rain"],
  },
  {
    id: 15,
    name: "The Ice Lord",
    description: "A frozen tyrant from the far north. His warhammer can freeze blood in your veins.",
    enemyName: "Ice Lord",
    enemyWeapon: "warhammer",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.7,
    enemyStaminaMultiplier: 1.2,
    enemySpeedMultiplier: 0.7,
    enemyAggression: 0.6,
    backgroundTheme: "ice",
    specialEffects: ["ice_storm", "frozen_ground"],
  },
  {
    id: 16,
    name: "The Dragon Slayer",
    description: "A legendary warrior who has slain dragons. His greatsword is forged from dragon bone.",
    enemyName: "Dragon Slayer",
    enemyWeapon: "greatsword",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.8,
    enemyStaminaMultiplier: 1.5,
    enemySpeedMultiplier: 0.9,
    enemyAggression: 0.7,
    backgroundTheme: "castle",
    specialEffects: ["dragon_fire", "roar"],
  },
  {
    id: 17,
    name: "The Void Walker",
    description: "A being from beyond reality. It wields weapons of pure darkness.",
    enemyName: "Void Walker",
    enemyWeapon: "longsword",
    enemyArmor: "plate",
    enemyHealthMultiplier: 1.9,
    enemyStaminaMultiplier: 1.6,
    enemySpeedMultiplier: 1.1,
    enemyAggression: 0.8,
    backgroundTheme: "hell",
    specialEffects: ["void_tendrils", "reality_tear"],
  },
  {
    id: 18,
    name: "The God of War",
    description: "The ultimate challenge. A deity of battle itself. Only the worthy may face him.",
    enemyName: "God of War",
    enemyWeapon: "greatsword",
    enemyArmor: "plate",
    enemyHealthMultiplier: 2.0,
    enemyStaminaMultiplier: 1.8,
    enemySpeedMultiplier: 1.2,
    enemyAggression: 0.9,
    backgroundTheme: "hell",
    specialEffects: ["divine_wrath", "blood_moon", "earthquake"],
  },
];

const createPlayer = (id: string, name: string, weapon: Weapon, armor: Armor, position: { x: number; y: number; z: number }): Player => ({
  id,
  name,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  position,
  rotation: { x: 0, y: 0, z: 0 },
  weapon,
  armor,
  isBlocking: false,
  isAttacking: false,
  isDead: false,
  bloodSplatters: [],
  wounds: [],
  severedLimbs: [],
});

const createEnemyForLevel = (level: Level): Player => {
  const baseWeapon = WEAPONS[level.enemyWeapon];
  const baseArmor = ARMORS[level.enemyArmor];
  
  const enhancedWeapon: Weapon = {
    ...baseWeapon,
    damage: Math.floor(baseWeapon.damage * level.enemySpeedMultiplier),
    speed: baseWeapon.speed * level.enemySpeedMultiplier,
  };

  return createPlayer(
    'enemy',
    level.enemyName,
    enhancedWeapon,
    baseArmor,
    { x: 2, y: 0, z: 0 }
  );
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    player: createPlayer('player', 'Knight', WEAPONS.longsword, ARMORS.chainmail, { x: -2, y: 0, z: 0 }),
    enemy: createEnemyForLevel(LEVELS[0]),
    isGameActive: false,
    winner: null,
    combatLog: [],
    particles: [],
    currentLevel: 1,
    completedLevels: [],
    availableWeapons: ['longsword'],
    availableArmors: ['chainmail'],
    isInLevelSelect: true,
  }));

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const addBloodSplatter = useCallback((playerId: string, position: { x: number; y: number; z: number }) => {
    const splatter: BloodSplatter = {
      id: `blood-${Date.now()}-${Math.random()}`,
      position,
      size: Math.random() * 0.5 + 0.3,
      opacity: 0.8,
      timestamp: Date.now(),
    };

    setGameState(prev => {
      const playerKey = playerId === 'player' ? 'player' : 'enemy';
      const currentSplatters = prev[playerKey].bloodSplatters;
      
      // Reduced blood splatters for better performance
      const maxSplatters = 5; // Reduced from 10 to 5
      let newSplatters = [...currentSplatters, splatter];
      
      if (newSplatters.length > maxSplatters) {
        newSplatters = newSplatters.slice(-maxSplatters);
      }

      return {
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          bloodSplatters: newSplatters,
        },
      };
    });

    // Remove blood splatter after 5 seconds (reduced from 10)
    const timeoutId = setTimeout(() => {
      setGameState(prev => {
        const playerKey = playerId === 'player' ? 'player' : 'enemy';
        return {
          ...prev,
          [playerKey]: {
            ...prev[playerKey],
            bloodSplatters: prev[playerKey].bloodSplatters.filter(b => b.id !== splatter.id),
          },
        };
      });
    }, 5000);

    // Store timeout ID for potential cleanup
    return () => clearTimeout(timeoutId);
  }, []);

  const addParticles = useCallback((position: { x: number; y: number; z: number }, count: number = 5, particleType: 'blood' | 'bone' | 'guts' = 'blood') => {
    const newParticles: Particle[] = [];
    const actualCount = Math.min(count, 5); // Cap at 5 particles max
    
    for (let i = 0; i < actualCount; i++) {
      let color = '#8B0000'; // Default blood color
      let size = Math.random() * 0.1 + 0.05;
      
      if (particleType === 'bone') {
        color = '#F5F5DC'; // Bone white
        size = Math.random() * 0.15 + 0.08;
      } else if (particleType === 'guts') {
        color = Math.random() > 0.5 ? '#8B0000' : '#4B0000'; // Dark red for guts
        size = Math.random() * 0.2 + 0.1;
      }
      
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        position: { ...position },
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 1,
          z: (Math.random() - 0.5) * 4,
        },
        color,
        size,
        life: 1,
        maxLife: 1,
      });
    }

    setGameState(prev => {
      // Limit total particles to prevent memory issues
      const maxTotalParticles = 20;
      const allParticles = [...prev.particles, ...newParticles];
      const limitedParticles = allParticles.slice(-maxTotalParticles);
      
      return {
        ...prev,
        particles: limitedParticles,
      };
    });
  }, []);

  const addWound = useCallback((playerId: string, woundType: 'slash' | 'stab' | 'crush', bodyPart: 'torso' | 'head' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg', severity: 'minor' | 'major' | 'critical', position: { x: number; y: number; z: number }) => {
    const wound: Wound = {
      id: `wound-${Date.now()}-${Math.random()}`,
      type: woundType,
      bodyPart,
      position,
      severity,
      timestamp: Date.now(),
      showsGuts: severity === 'critical' && (woundType === 'slash' || woundType === 'stab') && bodyPart === 'torso',
      showsBone: severity === 'critical' && woundType === 'crush',
    };

    setGameState(prev => ({
      ...prev,
      [playerId === 'player' ? 'player' : 'enemy']: {
        ...prev[playerId === 'player' ? 'player' : 'enemy'],
        wounds: [...prev[playerId === 'player' ? 'player' : 'enemy'].wounds, wound],
      },
    }));

    // Add appropriate particles
    if (wound.showsGuts) {
      addParticles(position, 3, 'guts');
    }
    if (wound.showsBone) {
      addParticles(position, 2, 'bone');
    }
  }, [addParticles]);

  const severLimb = useCallback((playerId: string, bodyPart: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg', position: { x: number; y: number; z: number }) => {
    const severedLimb: SeveredLimb = {
      id: `severed-${Date.now()}-${Math.random()}`,
      bodyPart,
      position: {
        x: position.x + (Math.random() - 0.5) * 2,
        y: position.y - 0.5,
        z: position.z + (Math.random() - 0.5) * 2,
      },
      rotation: {
        x: Math.random() * Math.PI,
        y: Math.random() * Math.PI,
        z: Math.random() * Math.PI,
      },
      timestamp: Date.now(),
      showsBone: true,
      bloodTrail: [],
    };

    // Create blood trail for severed limb
    const bloodTrail: BloodSplatter[] = [];
    for (let i = 0; i < 5; i++) {
      bloodTrail.push({
        id: `trail-${Date.now()}-${i}`,
        position: {
          x: position.x + (Math.random() - 0.5) * 1,
          y: 0.1,
          z: position.z + (Math.random() - 0.5) * 1,
        },
        size: Math.random() * 0.3 + 0.2,
        opacity: 0.9,
        timestamp: Date.now(),
      });
    }
    severedLimb.bloodTrail = bloodTrail;

    setGameState(prev => ({
      ...prev,
      [playerId === 'player' ? 'player' : 'enemy']: {
        ...prev[playerId === 'player' ? 'player' : 'enemy'],
        severedLimbs: [...prev[playerId === 'player' ? 'player' : 'enemy'].severedLimbs, severedLimb],
      },
    }));

    // Add bone and blood particles
    addParticles(position, 3, 'bone');
    addParticles(position, 5, 'blood');
  }, [addParticles]);

  const updateParticles = useCallback(() => {
    setGameState(prev => {
      // Use physics-based particle updates
      const maxParticles = 15;
      const deltaTime = 0.033; // ~30fps
      
      let updatedParticles = updateParticlePhysics(prev.particles, deltaTime);
      
      // Update life for each particle
      updatedParticles = updatedParticles.map(particle => ({
        ...particle,
        life: particle.life - 0.05, // Faster decay
      })).filter(particle => particle.life > 0);

      // Remove oldest particles if we exceed the limit
      if (updatedParticles.length > maxParticles) {
        updatedParticles = updatedParticles.slice(-maxParticles);
      }

      return {
        ...prev,
        particles: updatedParticles,
      };
    });
  }, []);

  const completeLevel = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;

    setGameState(prev => {
      const newCompletedLevels = [...prev.completedLevels];
      if (!newCompletedLevels.includes(levelId)) {
        newCompletedLevels.push(levelId);
      }

      const newAvailableWeapons = [...prev.availableWeapons];
      const newAvailableArmors = [...prev.availableArmors];

      // Add rewards
      if (level.rewardWeapon && !newAvailableWeapons.includes(level.rewardWeapon)) {
        newAvailableWeapons.push(level.rewardWeapon);
      }
      if (level.rewardArmor && !newAvailableArmors.includes(level.rewardArmor)) {
        newAvailableArmors.push(level.rewardArmor);
      }

      return {
        ...prev,
        completedLevels: newCompletedLevels,
        availableWeapons: newAvailableWeapons,
        availableArmors: newAvailableArmors,
        isInLevelSelect: true,
        isGameActive: false,
        combatLog: [
          ...prev.combatLog,
          `VICTORY! Level ${levelId} completed!`,
          level.rewardWeapon ? `Unlocked weapon: ${level.rewardWeapon}` : '',
          level.rewardArmor ? `Unlocked armor: ${level.rewardArmor}` : '',
        ].filter(Boolean),
      };
    });
  }, []);

  const performAttack = useCallback((attackerId: string, action: CombatAction) => {
    const attacker = gameStateRef.current[attackerId === 'player' ? 'player' : 'enemy'];
    const defender = gameStateRef.current[attackerId === 'player' ? 'enemy' : 'player'];

    if (attacker.stamina < attacker.weapon.staminaCost || attacker.isAttacking || attacker.isDead) {
      return;
    }

    // Physics-based collision detection
    const collisionResult = checkWeaponHit(
      attacker.position,
      defender.position,
      attacker.weapon.type,
      action.direction,
      attacker.weapon.reach
    );
    
    // Base hit chance modified by physics collision
    let hitChance = 0.6 + (attacker.weapon.speed * 0.2);
    
    // If physics says no collision, greatly reduce hit chance
    if (!collisionResult.hit) {
      hitChance *= 0.1; // Very low chance if no physical collision
    } else {
      // Adjust hit chance based on collision distance
      const distance = collisionResult.distance || 0;
      const weaponReach = attacker.weapon.reach;
      
      if (distance > weaponReach * 0.9) {
        hitChance *= 0.7; // Reduced chance at edge of range
      }
    }
    
    // Blocking effectiveness based on timing and weapon type
    if (defender.isBlocking) {
      let blockEffectiveness = 0.8; // Base block effectiveness
      
      // Heavy weapons are harder to block
      if (attacker.weapon.type === 'greatsword' || attacker.weapon.type === 'warhammer' || attacker.weapon.type === 'battleaxe') {
        blockEffectiveness *= 0.6;
      }
      
      // Fast weapons are easier to block if you're ready
      if (attacker.weapon.type === 'dagger' || attacker.weapon.type === 'rapier') {
        blockEffectiveness *= 1.2;
      }
      
      hitChance *= (1 - blockEffectiveness);
    }

    // Stamina affects accuracy
    const staminaFactor = attacker.stamina / attacker.maxStamina;
    hitChance *= (0.7 + staminaFactor * 0.3);

    // Health affects accuracy (wounded fighters are less accurate)
    const healthFactor = attacker.health / attacker.maxHealth;
    hitChance *= (0.8 + healthFactor * 0.2);

    const hit = Math.random() < hitChance;
    let damage = 0;
    let isCritical = false;
    let isParried = false;

    if (hit) {
      // Enhanced damage calculation
      const baseDamage = attacker.weapon.damage;
      const damageVariance = baseDamage * 0.3; // 30% variance
      damage = baseDamage + (Math.random() - 0.5) * damageVariance;
      
      // Attack direction affects damage
      switch (action.direction) {
        case 'overhead':
          damage *= 1.3; // Overhead attacks do more damage
          break;
        case 'thrust':
          damage *= 1.2; // Thrusts are precise
          break;
        case 'left':
        case 'right':
          damage *= 1.0; // Side attacks are standard
          break;
      }
      
      // Check for critical hit with enhanced conditions
      let critChance = attacker.weapon.criticalChance;
      
      // Higher crit chance on overhead attacks
      if (action.direction === 'overhead') {
        critChance *= 1.5;
      }
      
      // Higher crit chance when enemy is low health
      if (defender.health < defender.maxHealth * 0.3) {
        critChance *= 1.3;
      }
      
      isCritical = Math.random() < critChance;
      if (isCritical) {
        damage *= 2.2; // Increased crit multiplier
      }

      // Check for parry (only if blocking and good timing)
      if (defender.isBlocking && Math.random() < 0.15) {
        isParried = true;
        damage *= 0.1; // Parried attacks do minimal damage
        
        // Parrying drains attacker's stamina more
        setGameState(prev => ({
          ...prev,
          [attackerId === 'player' ? 'player' : 'enemy']: {
            ...prev[attackerId === 'player' ? 'player' : 'enemy'],
            stamina: Math.max(0, prev[attackerId === 'player' ? 'player' : 'enemy'].stamina - attacker.weapon.staminaCost * 0.5)
          }
        }));
      }

      // Enhanced armor calculation
      let armorProtection = defender.armor.protection;
      
      // Armor effectiveness depends on attack type and weapon
      if (attacker.weapon.type === 'mace' || attacker.weapon.type === 'warhammer') {
        // Blunt weapons are better against armor
        armorProtection *= (1 - attacker.weapon.armorPiercing * 1.2);
      } else if (attacker.weapon.type === 'dagger' || attacker.weapon.type === 'rapier') {
        // Piercing weapons find gaps in armor
        armorProtection *= (1 - attacker.weapon.armorPiercing * 1.1);
      } else {
        armorProtection *= (1 - attacker.weapon.armorPiercing);
      }
      
      // Damaged armor is less effective
      const armorCondition = defender.armor.durability / defender.armor.maxDurability;
      armorProtection *= armorCondition;
      
      damage *= (1 - Math.max(0, armorProtection));

      // Blocking reduces damage further
      if (defender.isBlocking && !isParried) {
        damage *= 0.3; // Reduced from 0.4 for more realistic blocking
      }

      damage = Math.max(1, Math.floor(damage));

      // Enhanced armor damage system
      if (defender.armor.type !== 'none') {
        let armorDamage = Math.floor(damage * 0.15);
        
        // Heavy weapons damage armor more
        if (attacker.weapon.type === 'battleaxe' || attacker.weapon.type === 'warhammer' || attacker.weapon.type === 'greatsword') {
          armorDamage *= 1.5;
        }
        
        // Critical hits damage armor more
        if (isCritical) {
          armorDamage *= 2;
        }
        
        setGameState(prev => ({
          ...prev,
          [attackerId === 'player' ? 'enemy' : 'player']: {
            ...prev[attackerId === 'player' ? 'enemy' : 'player'],
            armor: {
              ...prev[attackerId === 'player' ? 'enemy' : 'player'].armor,
              durability: Math.max(0, prev[attackerId === 'player' ? 'enemy' : 'player'].armor.durability - armorDamage)
            }
          }
        }));
      }
    }

    setGameState(prev => {
      const newAttacker = {
        ...prev[attackerId === 'player' ? 'player' : 'enemy'],
        stamina: Math.max(0, prev[attackerId === 'player' ? 'player' : 'enemy'].stamina - attacker.weapon.staminaCost),
        isAttacking: true,
      };

      const newDefender = {
        ...prev[attackerId === 'player' ? 'enemy' : 'player'],
        health: hit ? Math.max(0, prev[attackerId === 'player' ? 'enemy' : 'player'].health - damage) : prev[attackerId === 'player' ? 'enemy' : 'player'].health,
        isDead: hit ? prev[attackerId === 'player' ? 'enemy' : 'player'].health - damage <= 0 : prev[attackerId === 'player' ? 'enemy' : 'player'].isDead,
      };

      let logMessage = '';
      if (hit) {
        if (isParried) {
          logMessage = `${defender.name} PARRIES ${attacker.name}'s attack! Minimal damage dealt.`;
        } else if (isCritical) {
          logMessage = `${attacker.name} CRITICAL HIT on ${defender.name} for ${damage} damage!`;
        } else {
          logMessage = `${attacker.name} hits ${defender.name} for ${damage} damage!`;
        }
      } else {
        logMessage = defender.isBlocking 
          ? `${defender.name} blocks ${attacker.name}'s attack!`
          : `${attacker.name} misses ${defender.name}!`;
      }

      const newState = {
        ...prev,
        [attackerId === 'player' ? 'player' : 'enemy']: newAttacker,
        [attackerId === 'player' ? 'enemy' : 'player']: newDefender,
        winner: newDefender.isDead ? attacker.name : prev.winner,
        isGameActive: !newDefender.isDead,
      };

      // If player wins, complete the level after a delay
      if (newDefender.isDead && attackerId === 'player') {
        setTimeout(() => {
          completeLevel(prev.currentLevel);
        }, 2000);
      }

      return newState;
    });

    if (hit) {
      addBloodSplatter(attackerId === 'player' ? 'enemy' : 'player', defender.position);
      
      // Play appropriate sound effects
      if (isParried) {
        soundSystem.playParrySound();
      } else {
        soundSystem.playHitSound(isCritical);
      }
      
      // Add blood to the attacker's weapon
      const bloodIncrease = isCritical ? 0.3 : 0.15; // More blood for critical hits
      setGameState(prev => ({
        ...prev,
        [attackerId === 'player' ? 'player' : 'enemy']: {
          ...prev[attackerId === 'player' ? 'player' : 'enemy'],
          weapon: {
            ...prev[attackerId === 'player' ? 'player' : 'enemy'].weapon,
            bloodLevel: Math.min(1, (prev[attackerId === 'player' ? 'player' : 'enemy'].weapon.bloodLevel || 0) + bloodIncrease),
            lastBloodTime: Date.now()
          }
        }
      }));
      
      // Determine wound type based on weapon
      let woundType: 'slash' | 'stab' | 'crush' = 'slash';
      if (attacker.weapon.type === 'dagger' || attacker.weapon.type === 'rapier') {
        woundType = 'stab';
      } else if (attacker.weapon.type === 'mace' || attacker.weapon.type === 'warhammer') {
        woundType = 'crush';
      }

      // Use physics-based hit location if available
      let bodyPart: 'torso' | 'head' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' = 'torso';
      let locationDamageMultiplier = 1.0;
      
      if (collisionResult.hit && collisionResult.point) {
        const locationResult = calculateLocationDamage(collisionResult.point, defender.position, damage);
        damage = locationResult.damage;
        bodyPart = locationResult.bodyPart as typeof bodyPart;
        locationDamageMultiplier = locationResult.multiplier;
      } else {
        // Fallback to direction-based body part determination
        if (action.direction === 'overhead') {
          bodyPart = Math.random() > 0.7 ? 'head' : 'torso';
        } else if (action.direction === 'left') {
          bodyPart = Math.random() > 0.5 ? 'rightArm' : 'torso';
        } else if (action.direction === 'right') {
          bodyPart = Math.random() > 0.5 ? 'leftArm' : 'torso';
        } else if (action.direction === 'thrust') {
          bodyPart = Math.random() > 0.3 ? 'torso' : (Math.random() > 0.5 ? 'leftLeg' : 'rightLeg');
        }
      }

      // Determine wound severity
      let severity: 'minor' | 'major' | 'critical' = 'minor';
      if (isCritical) {
        severity = 'critical';
      } else if (damage > attacker.weapon.damage * 0.8 || locationDamageMultiplier > 1.5) {
        severity = 'major';
      }

      // Add wound
      addWound(attackerId === 'player' ? 'enemy' : 'player', woundType, bodyPart, severity, defender.position);

      // Check for limb severing (only on critical hits with slashing weapons to limbs)
      let limbSevered = false;
      if (isCritical && woundType === 'slash' && (bodyPart === 'leftArm' || bodyPart === 'rightArm' || bodyPart === 'leftLeg' || bodyPart === 'rightLeg')) {
        const severChance = attacker.weapon.type === 'greatsword' || attacker.weapon.type === 'battleaxe' ? 0.3 : 0.15;
        if (Math.random() < severChance) {
          severLimb(attackerId === 'player' ? 'enemy' : 'player', bodyPart as 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg', defender.position);
          limbSevered = true;
        }
      }

      // Update log message with gore details
      if (hit) {
        if (limbSevered) {
          const limbName = bodyPart === 'leftArm' ? 'left arm' : bodyPart === 'rightArm' ? 'right arm' : bodyPart === 'leftLeg' ? 'left leg' : 'right leg';
          logMessage += ` ${attacker.name} SEVERS ${defender.name}'s ${limbName}! Bone and blood spray everywhere!`;
        } else if (severity === 'critical') {
          if (woundType === 'slash' && bodyPart === 'torso') {
            logMessage += ` Guts spill from the gaping wound!`;
          } else if (woundType === 'crush') {
            logMessage += ` Bone cracks and splinters!`;
          } else if (woundType === 'stab' && bodyPart === 'torso') {
            logMessage += ` The blade pierces deep, revealing entrails!`;
          }
        }
      }

      // Update the combat log with the enhanced message
      setGameState(prev => ({
        ...prev,
        combatLog: [...prev.combatLog.slice(-4), logMessage],
      }));

      addParticles(defender.position, 3);
    } else {
      // Play miss sound for failed attacks
      soundSystem.playMissSound();
    }

    // Reset attacking state after animation
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        [attackerId === 'player' ? 'player' : 'enemy']: {
          ...prev[attackerId === 'player' ? 'player' : 'enemy'],
          isAttacking: false,
        },
      }));
    }, 600);
  }, [addBloodSplatter, addParticles, addWound, severLimb, completeLevel]);

  const setBlocking = useCallback((playerId: string, blocking: boolean) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 'player' ? 'player' : 'enemy']: {
        ...prev[playerId === 'player' ? 'player' : 'enemy'],
        isBlocking: blocking,
      },
    }));
  }, []);

  const regenerateStamina = useCallback(() => {
    setGameState(prev => {
      const playerRegenRate = (prev.player.isBlocking ? 0.5 : 1) * (1 - prev.player.armor.weight * 0.01);
      const enemyRegenRate = (prev.enemy.isBlocking ? 0.5 : 1) * (1 - prev.enemy.armor.weight * 0.01);
      
      // Gradually clean blood from weapons over time
      const currentTime = Date.now();
      const bloodDecayRate = 0.002; // Blood fades slowly over time
      
      const cleanPlayerWeapon = {
        ...prev.player.weapon,
        bloodLevel: Math.max(0, (prev.player.weapon.bloodLevel || 0) - bloodDecayRate)
      };
      
      const cleanEnemyWeapon = {
        ...prev.enemy.weapon,
        bloodLevel: Math.max(0, (prev.enemy.weapon.bloodLevel || 0) - bloodDecayRate)
      };
      
      return {
        ...prev,
        player: {
          ...prev.player,
          stamina: Math.min(prev.player.maxStamina, prev.player.stamina + playerRegenRate),
          weapon: cleanPlayerWeapon,
        },
        enemy: {
          ...prev.enemy,
          stamina: Math.min(prev.enemy.maxStamina, prev.enemy.stamina + enemyRegenRate),
          weapon: cleanEnemyWeapon,
        },
      };
    });
  }, []);

  const changeWeapon = useCallback((playerId: string, weaponType: keyof typeof WEAPONS) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 'player' ? 'player' : 'enemy']: {
        ...prev[playerId === 'player' ? 'player' : 'enemy'],
        weapon: {
          ...WEAPONS[weaponType],
          bloodLevel: 0, // New weapons start clean
          lastBloodTime: 0,
        },
      },
    }));
  }, []);

  const changeArmor = useCallback((playerId: string, armorType: keyof typeof ARMORS) => {
    setGameState(prev => ({
      ...prev,
      [playerId === 'player' ? 'player' : 'enemy']: {
        ...prev[playerId === 'player' ? 'player' : 'enemy'],
        armor: ARMORS[armorType],
      },
    }));
  }, []);

  const updatePlayerPosition = useCallback((position: { x: number; y: number; z: number }) => {
    // Constrain player movement within arena bounds
    const constrainedPosition = constrainToArena(position);
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        position: constrainedPosition,
      },
    }));
  }, []);

  const startLevel = useCallback((levelId: number) => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;

    const enemy = createEnemyForLevel(level);
    // Apply level multipliers to enemy stats
    enemy.health = Math.floor(enemy.maxHealth * level.enemyHealthMultiplier);
    enemy.maxHealth = Math.floor(enemy.maxHealth * level.enemyHealthMultiplier);
    enemy.stamina = Math.floor(enemy.maxStamina * level.enemyStaminaMultiplier);
    enemy.maxStamina = Math.floor(enemy.maxStamina * level.enemyStaminaMultiplier);

    setGameState(prev => ({
      ...prev,
      enemy,
      currentLevel: levelId,
      isGameActive: true,
      isInLevelSelect: false,
      winner: null,
      combatLog: [`Level ${levelId}: ${level.name}`, level.description],
      particles: [],
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      player: createPlayer('player', 'Knight', WEAPONS.longsword, ARMORS.chainmail, { x: -2, y: 0, z: 0 }),
      enemy: createEnemyForLevel(LEVELS[0]),
      isGameActive: false,
      winner: null,
      combatLog: [],
      particles: [],
      currentLevel: 1,
      completedLevels: [],
      availableWeapons: ['longsword'],
      availableArmors: ['chainmail'],
      isInLevelSelect: true,
    });
  }, []);

  const returnToLevelSelect = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isInLevelSelect: true,
      isGameActive: false,
      winner: null,
    }));
  }, []);

  return {
    gameState,
    performAttack,
    setBlocking,
    regenerateStamina,
    changeWeapon,
    changeArmor,
    resetGame,
    updateParticles,
    updatePlayerPosition,
    startLevel,
    completeLevel,
    returnToLevelSelect,
    WEAPONS,
    ARMORS,
    LEVELS,
  };
};