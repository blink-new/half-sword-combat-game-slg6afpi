// Physics utilities for realistic combat
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

export interface CollisionResult {
  hit: boolean;
  point?: Vector3;
  normal?: Vector3;
  distance?: number;
}

// Calculate distance between two 3D points
export function distance3D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate 2D distance (ignoring Y axis for ground-based movement)
export function distance2D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// Normalize a vector
export function normalize(v: Vector3): Vector3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

// Vector addition
export function add(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

// Vector subtraction
export function subtract(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

// Vector scaling
export function scale(v: Vector3, factor: number): Vector3 {
  return {
    x: v.x * factor,
    y: v.y * factor,
    z: v.z * factor
  };
}

// Dot product
export function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Check if a point is within a bounding box
export function pointInBoundingBox(point: Vector3, box: BoundingBox): boolean {
  return point.x >= box.min.x && point.x <= box.max.x &&
         point.y >= box.min.y && point.y <= box.max.y &&
         point.z >= box.min.z && point.z <= box.max.z;
}

// Check collision between two bounding boxes
export function boundingBoxCollision(box1: BoundingBox, box2: BoundingBox): boolean {
  return box1.min.x <= box2.max.x && box1.max.x >= box2.min.x &&
         box1.min.y <= box2.max.y && box1.max.y >= box2.min.y &&
         box1.min.z <= box2.max.z && box1.max.z >= box2.min.z;
}

// Create bounding box for a player at given position
export function createPlayerBoundingBox(position: Vector3): BoundingBox {
  const width = 0.6;
  const height = 1.8;
  const depth = 0.3;
  
  return {
    min: {
      x: position.x - width / 2,
      y: position.y,
      z: position.z - depth / 2
    },
    max: {
      x: position.x + width / 2,
      y: position.y + height,
      z: position.z + depth / 2
    }
  };
}

// Create weapon collision box based on weapon type and attack direction
export function createWeaponCollisionBox(
  playerPosition: Vector3,
  weaponType: string,
  attackDirection: 'left' | 'right' | 'overhead' | 'thrust',
  weaponReach: number
): BoundingBox {
  let width = 0.1;
  let height = 0.1;
  let depth = weaponReach;
  let offsetX = 0;
  let offsetY = 1.2; // Weapon height
  let offsetZ = 0;

  // Adjust collision box based on weapon type
  switch (weaponType) {
    case 'dagger':
      width = 0.05;
      depth = weaponReach * 0.8;
      break;
    case 'rapier':
      width = 0.03;
      depth = weaponReach;
      break;
    case 'longsword':
    case 'greatsword':
      width = 0.08;
      height = 0.15;
      depth = weaponReach;
      break;
    case 'mace':
    case 'warhammer':
      width = 0.12;
      height = 0.12;
      depth = weaponReach * 0.9;
      break;
    case 'battleaxe':
      width = 0.15;
      height = 0.1;
      depth = weaponReach * 0.9;
      break;
    case 'flail':
      width = 0.1;
      height = 0.1;
      depth = weaponReach * 1.1; // Flails have extended reach
      break;
  }

  // Adjust position based on attack direction
  switch (attackDirection) {
    case 'left':
      offsetX = -weaponReach * 0.7;
      offsetZ = weaponReach * 0.3;
      break;
    case 'right':
      offsetX = weaponReach * 0.7;
      offsetZ = weaponReach * 0.3;
      break;
    case 'overhead':
      offsetY = 1.8;
      offsetZ = weaponReach * 0.5;
      height = weaponReach * 0.8;
      break;
    case 'thrust':
      offsetZ = weaponReach * 0.8;
      break;
  }

  const weaponCenter = {
    x: playerPosition.x + offsetX,
    y: playerPosition.y + offsetY,
    z: playerPosition.z + offsetZ
  };

  return {
    min: {
      x: weaponCenter.x - width / 2,
      y: weaponCenter.y - height / 2,
      z: weaponCenter.z - depth / 2
    },
    max: {
      x: weaponCenter.x + width / 2,
      y: weaponCenter.y + height / 2,
      z: weaponCenter.z + depth / 2
    }
  };
}

// Check if weapon attack hits target
export function checkWeaponHit(
  attackerPosition: Vector3,
  defenderPosition: Vector3,
  weaponType: string,
  attackDirection: 'left' | 'right' | 'overhead' | 'thrust',
  weaponReach: number
): CollisionResult {
  const weaponBox = createWeaponCollisionBox(attackerPosition, weaponType, attackDirection, weaponReach);
  const defenderBox = createPlayerBoundingBox(defenderPosition);
  
  const hit = boundingBoxCollision(weaponBox, defenderBox);
  
  if (hit) {
    // Calculate hit point (center of overlap)
    const overlapMin = {
      x: Math.max(weaponBox.min.x, defenderBox.min.x),
      y: Math.max(weaponBox.min.y, defenderBox.min.y),
      z: Math.max(weaponBox.min.z, defenderBox.min.z)
    };
    
    const overlapMax = {
      x: Math.min(weaponBox.max.x, defenderBox.max.x),
      y: Math.min(weaponBox.max.y, defenderBox.max.y),
      z: Math.min(weaponBox.max.z, defenderBox.max.z)
    };
    
    const hitPoint = {
      x: (overlapMin.x + overlapMax.x) / 2,
      y: (overlapMin.y + overlapMax.y) / 2,
      z: (overlapMin.z + overlapMax.z) / 2
    };
    
    // Calculate normal (direction from attacker to defender)
    const direction = subtract(defenderPosition, attackerPosition);
    const normal = normalize(direction);
    
    return {
      hit: true,
      point: hitPoint,
      normal,
      distance: distance3D(attackerPosition, defenderPosition)
    };
  }
  
  return { hit: false };
}

// Calculate realistic damage based on hit location
export function calculateLocationDamage(
  hitPoint: Vector3,
  defenderPosition: Vector3,
  baseDamage: number
): { damage: number; bodyPart: string; multiplier: number } {
  const relativeY = hitPoint.y - defenderPosition.y;
  const relativeX = hitPoint.x - defenderPosition.x;
  
  let bodyPart = 'torso';
  let multiplier = 1.0;
  
  // Determine body part based on hit location
  if (relativeY > 1.6) {
    bodyPart = 'head';
    multiplier = 2.0; // Head shots do double damage
  } else if (relativeY > 1.2) {
    if (Math.abs(relativeX) > 0.2) {
      bodyPart = relativeX > 0 ? 'rightArm' : 'leftArm';
      multiplier = 0.8; // Arm hits do less damage
    } else {
      bodyPart = 'torso';
      multiplier = 1.0;
    }
  } else if (relativeY > 0.6) {
    bodyPart = 'torso';
    multiplier = 1.2; // Center mass hits
  } else {
    bodyPart = relativeX > 0 ? 'rightLeg' : 'leftLeg';
    multiplier = 0.7; // Leg hits do less damage
  }
  
  return {
    damage: Math.floor(baseDamage * multiplier),
    bodyPart,
    multiplier
  };
}

// Apply physics to particles
export function updateParticlePhysics(
  particles: Array<{
    position: Vector3;
    velocity: Vector3;
    life: number;
    maxLife: number;
  }>,
  deltaTime: number,
  gravity = -9.8
): Array<{
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
}> {
  return particles.map(particle => {
    // Apply gravity
    const newVelocity = {
      ...particle.velocity,
      y: particle.velocity.y + gravity * deltaTime
    };
    
    // Update position
    const newPosition = {
      x: particle.position.x + newVelocity.x * deltaTime,
      y: particle.position.y + newVelocity.y * deltaTime,
      z: particle.position.z + newVelocity.z * deltaTime
    };
    
    // Apply air resistance
    const airResistance = 0.98;
    const resistedVelocity = scale(newVelocity, airResistance);
    
    // Ground collision
    if (newPosition.y <= 0) {
      newPosition.y = 0;
      resistedVelocity.y = Math.abs(resistedVelocity.y) * -0.3; // Bounce with energy loss
      resistedVelocity.x *= 0.8; // Friction
      resistedVelocity.z *= 0.8;
    }
    
    return {
      ...particle,
      position: newPosition,
      velocity: resistedVelocity,
      life: particle.life - deltaTime
    };
  }).filter(particle => particle.life > 0 && particle.position.y > -2);
}

// Check if player can move to a position (collision with arena bounds)
export function canMoveTo(position: Vector3, arenaSize = 8): boolean {
  return position.x >= -arenaSize && position.x <= arenaSize &&
         position.z >= -arenaSize && position.z <= arenaSize;
}

// Constrain position within arena bounds
export function constrainToArena(position: Vector3, arenaSize = 8): Vector3 {
  return {
    x: Math.max(-arenaSize, Math.min(arenaSize, position.x)),
    y: position.y,
    z: Math.max(-arenaSize, Math.min(arenaSize, position.z))
  };
}