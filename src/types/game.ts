export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  weapon: Weapon;
  armor: Armor;
  isBlocking: boolean;
  isAttacking: boolean;
  isDead: boolean;
  bloodSplatters: BloodSplatter[];
  wounds: Wound[];
  severedLimbs: SeveredLimb[];
}

export interface Weapon {
  type: 'longsword' | 'dagger' | 'mace' | 'battleaxe' | 'warhammer' | 'rapier' | 'greatsword' | 'flail';
  damage: number;
  speed: number;
  reach: number;
  staminaCost: number;
  armorPiercing: number; // 0-1, how well it penetrates armor
  criticalChance: number; // 0-1, chance for critical hit
  bloodLevel?: number; // 0-1, how much blood is on the weapon
  lastBloodTime?: number; // timestamp of last blood application
}

export interface Armor {
  type: 'none' | 'leather' | 'chainmail' | 'plate' | 'scale' | 'brigandine';
  protection: number; // 0-1, damage reduction
  weight: number; // affects stamina regeneration
  durability: number;
  maxDurability: number;
}

export interface BloodSplatter {
  id: string;
  position: { x: number; y: number; z: number };
  size: number;
  opacity: number;
  timestamp: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  enemyName: string;
  enemyWeapon: Weapon['type'];
  enemyArmor: Armor['type'];
  enemyHealthMultiplier: number;
  enemyStaminaMultiplier: number;
  enemySpeedMultiplier: number;
  enemyAggression: number; // 0-1, how aggressive the AI is
  rewardWeapon?: Weapon['type'];
  rewardArmor?: Armor['type'];
  backgroundTheme: 'dungeon' | 'castle' | 'forest' | 'hell' | 'ice' | 'desert';
  specialEffects?: string[];
}

export interface GameState {
  player: Player;
  enemy: Player;
  isGameActive: boolean;
  winner: string | null;
  combatLog: string[];
  particles: Particle[];
  currentLevel: number;
  completedLevels: number[];
  availableWeapons: Weapon['type'][];
  availableArmors: Armor['type'][];
  isInLevelSelect: boolean;
}

export interface Particle {
  id: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface Wound {
  id: string;
  type: 'slash' | 'stab' | 'crush';
  bodyPart: 'torso' | 'head' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  position: { x: number; y: number; z: number };
  severity: 'minor' | 'major' | 'critical';
  timestamp: number;
  showsGuts: boolean;
  showsBone: boolean;
}

export interface SeveredLimb {
  id: string;
  bodyPart: 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  timestamp: number;
  showsBone: boolean;
  bloodTrail: BloodSplatter[];
}

export interface CombatAction {
  type: 'attack' | 'block' | 'parry';
  direction: 'left' | 'right' | 'overhead' | 'thrust';
  damage?: number;
  success: boolean;
}