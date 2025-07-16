import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Plane, Text } from '@react-three/drei';
import { Player, BloodSplatter, Wound, SeveredLimb } from '../types/game';
import * as THREE from 'three';

interface RealisticPlayerModelProps {
  player: Player;
  isPlayer: boolean;
  isFirstPerson?: boolean;
}

// Enhanced realistic human proportions and anatomy
const BODY_PROPORTIONS = {
  head: { width: 0.20, height: 0.24, depth: 0.22 },
  neck: { width: 0.14, height: 0.10, depth: 0.14 },
  torso: { width: 0.40, height: 0.50, depth: 0.22 },
  upperArm: { width: 0.10, height: 0.30, depth: 0.10 },
  forearm: { width: 0.08, height: 0.27, depth: 0.08 },
  hand: { width: 0.10, height: 0.20, depth: 0.05 },
  upperLeg: { width: 0.14, height: 0.42, depth: 0.14 },
  lowerLeg: { width: 0.10, height: 0.37, depth: 0.10 },
  foot: { width: 0.10, height: 0.08, depth: 0.26 },
};

// Enhanced realistic skin and material colors
const MATERIALS = {
  skin: '#FDBCB4',
  skinLight: '#FFD4C4',
  skinDark: '#E8A584',
  hair: '#8B4513',
  hairDark: '#654321',
  eyes: '#4169E1',
  eyesDark: '#2F4F4F',
  teeth: '#FFFACD',
  leather: '#8B4513',
  chainmail: '#708090',
  plate: '#C0C0C0',
  cloth: '#654321',
  metal: '#B8860B',
  blood: '#8B0000',
  bloodDark: '#660000',
  bone: '#F5F5DC',
  steel: '#E6E6FA',
};

function EnhancedHead({ player, isPlayer }: { player: Player; isPlayer: boolean }) {
  const headRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (headRef.current) {
      // Enhanced head movement and breathing
      const time = Date.now() * 0.001;
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.08;
      headRef.current.position.y = 1.65 + Math.sin(time * 2) * 0.015;
      
      // Pain expression when low health
      if (player.health < player.maxHealth * 0.3) {
        headRef.current.rotation.x = -0.15 + Math.sin(time * 4) * 0.03;
        headRef.current.rotation.z = Math.sin(time * 3) * 0.02;
      }
      
      // Combat focus - look at enemy
      if (player.isAttacking || player.isBlocking) {
        headRef.current.rotation.y = isPlayer ? 0.2 : -0.2;
      }
    }

    // Eye blinking animation
    if (eyeLeftRef.current && eyeRightRef.current) {
      const blinkTime = Date.now() * 0.001;
      const blink = Math.sin(blinkTime * 0.3) > 0.95 ? 0.3 : 1.0;
      eyeLeftRef.current.scale.y = blink;
      eyeRightRef.current.scale.y = blink;
    }
  });

  return (
    <group ref={headRef} position={[0, 1.65, 0]}>
      {/* Enhanced Head Shape */}
      <Sphere args={[BODY_PROPORTIONS.head.width, 20, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={MATERIALS.skin}
          roughness={0.7}
          metalness={0.0}
          normalScale={[0.4, 0.4]}
        />
      </Sphere>
      
      {/* Enhanced Eyes with pupils */}
      <group>
        <Sphere ref={eyeLeftRef} args={[0.025]} position={[-0.07, 0.04, 0.16]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.015]} position={[-0.07, 0.04, 0.17]}>
          <meshStandardMaterial color={MATERIALS.eyes} />
        </Sphere>
        <Sphere args={[0.008]} position={[-0.07, 0.04, 0.175]}>
          <meshStandardMaterial color="#000000" />
        </Sphere>
        
        <Sphere ref={eyeRightRef} args={[0.025]} position={[0.07, 0.04, 0.16]}>
          <meshStandardMaterial color="#FFFFFF" />
        </Sphere>
        <Sphere args={[0.015]} position={[0.07, 0.04, 0.17]}>
          <meshStandardMaterial color={MATERIALS.eyes} />
        </Sphere>
        <Sphere args={[0.008]} position={[0.07, 0.04, 0.175]}>
          <meshStandardMaterial color="#000000" />
        </Sphere>
      </group>
      
      {/* Enhanced Nose */}
      <Box args={[0.025, 0.05, 0.04]} position={[0, -0.01, 0.17]}>
        <meshStandardMaterial color={MATERIALS.skinDark} roughness={0.8} />
      </Box>
      
      {/* Enhanced Mouth */}
      <Box args={[0.08, 0.015, 0.015]} position={[0, -0.09, 0.16]}>
        <meshStandardMaterial color={MATERIALS.blood} />
      </Box>
      
      {/* Teeth */}
      <Box args={[0.06, 0.008, 0.008]} position={[0, -0.085, 0.165]}>
        <meshStandardMaterial color={MATERIALS.teeth} />
      </Box>
      
      {/* Enhanced Hair with more detail */}
      <Sphere args={[BODY_PROPORTIONS.head.width * 1.15, 16, 12]} position={[0, 0.06, -0.03]}>
        <meshStandardMaterial 
          color={MATERIALS.hair}
          roughness={0.95}
          metalness={0.0}
        />
      </Sphere>
      
      {/* Hair strands for detail */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box 
          key={`hair-${i}`}
          args={[0.02, 0.08, 0.02]} 
          position={[
            (Math.random() - 0.5) * 0.3,
            0.15 + Math.random() * 0.1,
            -0.1 + Math.random() * 0.05
          ]}
          rotation={[
            Math.random() * 0.3,
            Math.random() * 0.3,
            Math.random() * 0.3
          ]}
        >
          <meshStandardMaterial color={MATERIALS.hairDark} roughness={0.9} />
        </Box>
      ))}
      
      {/* Helmet/Armor on head based on armor type */}
      {player.armor.type === 'plate' && (
        <group>
          <Sphere args={[BODY_PROPORTIONS.head.width * 1.2, 16, 12]} position={[0, 0, 0]}>
            <meshStandardMaterial 
              color={MATERIALS.plate}
              roughness={0.1}
              metalness={0.9}
              envMapIntensity={1.5}
            />
          </Sphere>
          {/* Helmet visor */}
          <Box args={[0.15, 0.08, 0.02]} position={[0, 0.02, 0.19]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.9} roughness={0.1} />
          </Box>
        </group>
      )}
      
      {player.armor.type === 'chainmail' && (
        <Sphere args={[BODY_PROPORTIONS.head.width * 1.1, 16, 12]} position={[0, -0.06, 0]}>
          <meshStandardMaterial 
            color={MATERIALS.chainmail}
            roughness={0.5}
            metalness={0.6}
          />
        </Sphere>
      )}

      {/* Facial hair for variety */}
      {Math.random() > 0.5 && (
        <Box args={[0.12, 0.06, 0.03]} position={[0, -0.12, 0.15]}>
          <meshStandardMaterial color={MATERIALS.hairDark} roughness={0.9} />
        </Box>
      )}
    </group>
  );
}

function EnhancedTorso({ player, isPlayer }: { player: Player; isPlayer: boolean }) {
  const torsoRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (torsoRef.current) {
      // Enhanced breathing animation
      const time = Date.now() * 0.001;
      const breathingScale = 1 + Math.sin(time * 2) * 0.025;
      torsoRef.current.scale.set(breathingScale, 1, breathingScale);
      
      // Enhanced damage effects
      if (player.health < player.maxHealth * 0.5) {
        torsoRef.current.rotation.z = Math.sin(time * 3) * 0.015;
        torsoRef.current.position.x = Math.sin(time * 5) * 0.005;
      }
      
      // Combat stance
      if (player.isAttacking) {
        torsoRef.current.rotation.x = -0.1;
      } else if (player.isBlocking) {
        torsoRef.current.rotation.x = 0.05;
      }
    }
  });

  const getArmorColor = () => {
    switch (player.armor.type) {
      case 'leather': return MATERIALS.leather;
      case 'chainmail': return MATERIALS.chainmail;
      case 'plate': return MATERIALS.plate;
      case 'scale': return '#2F4F4F';
      case 'brigandine': return '#654321';
      default: return MATERIALS.cloth;
    }
  };

  const getArmorMetalness = () => {
    switch (player.armor.type) {
      case 'plate': return 0.9;
      case 'chainmail': return 0.7;
      case 'scale': return 0.5;
      default: return 0.1;
    }
  };

  return (
    <group ref={torsoRef} position={[0, 1.0, 0]}>
      {/* Enhanced main torso */}
      <Box args={[BODY_PROPORTIONS.torso.width, BODY_PROPORTIONS.torso.height, BODY_PROPORTIONS.torso.depth]}>
        <meshStandardMaterial 
          color={getArmorColor()}
          roughness={player.armor.type === 'leather' ? 0.9 : 0.2}
          metalness={getArmorMetalness()}
          envMapIntensity={player.armor.type === 'plate' ? 1.5 : 0.5}
        />
      </Box>
      
      {/* Enhanced chest muscles definition (visible under light armor) */}
      {(player.armor.type === 'none' || player.armor.type === 'leather') && (
        <>
          <Box args={[0.14, 0.10, 0.06]} position={[-0.09, 0.12, 0.09]}>
            <meshStandardMaterial color={MATERIALS.skin} roughness={0.8} />
          </Box>
          <Box args={[0.14, 0.10, 0.06]} position={[0.09, 0.12, 0.09]}>
            <meshStandardMaterial color={MATERIALS.skin} roughness={0.8} />
          </Box>
          {/* Abs definition */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Box 
              key={`abs-${i}`}
              args={[0.06, 0.04, 0.02]} 
              position={[
                (i % 2 === 0 ? -0.04 : 0.04),
                0.05 - Math.floor(i / 2) * 0.08,
                0.11
              ]}
            >
              <meshStandardMaterial color={MATERIALS.skinDark} roughness={0.8} />
            </Box>
          ))}
        </>
      )}
      
      {/* Enhanced armor details */}
      {player.armor.type === 'plate' && (
        <>
          {/* Chest plate segments with rivets */}
          <Box args={[0.35, 0.18, 0.025]} position={[0, 0.12, 0.12]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.95} roughness={0.05} />
          </Box>
          <Box args={[0.30, 0.14, 0.025]} position={[0, -0.04, 0.12]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.95} roughness={0.05} />
          </Box>
          <Box args={[0.26, 0.12, 0.025]} position={[0, -0.16, 0.12]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.95} roughness={0.05} />
          </Box>
          
          {/* Armor rivets */}
          {Array.from({ length: 12 }).map((_, i) => (
            <Sphere 
              key={`rivet-${i}`}
              args={[0.008]} 
              position={[
                (i % 4 - 1.5) * 0.08,
                0.1 - Math.floor(i / 4) * 0.08,
                0.13
              ]}
            >
              <meshStandardMaterial color={MATERIALS.metal} metalness={0.9} roughness={0.1} />
            </Sphere>
          ))}
        </>
      )}
      
      {player.armor.type === 'chainmail' && (
        <>
          {/* Chainmail texture simulation */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Sphere 
              key={`chain-${i}`}
              args={[0.008]} 
              position={[
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.4,
                0.11 + Math.random() * 0.02
              ]}
            >
              <meshStandardMaterial color={MATERIALS.chainmail} metalness={0.7} roughness={0.3} />
            </Sphere>
          ))}
        </>
      )}
      
      {/* Enhanced neck */}
      <Cylinder args={[BODY_PROPORTIONS.neck.width/2, BODY_PROPORTIONS.neck.width/2, BODY_PROPORTIONS.neck.height]} 
                position={[0, 0.32, 0]}>
        <meshStandardMaterial color={MATERIALS.skin} roughness={0.8} />
      </Cylinder>
      
      {/* Neck protection for armored characters */}
      {(player.armor.type === 'chainmail' || player.armor.type === 'plate') && (
        <Cylinder args={[BODY_PROPORTIONS.neck.width/2 + 0.02, BODY_PROPORTIONS.neck.width/2 + 0.02, BODY_PROPORTIONS.neck.height]} 
                  position={[0, 0.32, 0]}>
          <meshStandardMaterial 
            color={getArmorColor()} 
            metalness={getArmorMetalness()} 
            roughness={0.3} 
          />
        </Cylinder>
      )}
    </group>
  );
}

function EnhancedArm({ 
  player, 
  isLeft, 
  isPlayer 
}: { 
  player: Player; 
  isLeft: boolean; 
  isPlayer: boolean; 
}) {
  const armRef = useRef<THREE.Group>(null);
  const upperArmRef = useRef<THREE.Mesh>(null);
  const forearmRef = useRef<THREE.Mesh>(null);
  const handRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (armRef.current) {
      const time = Date.now() * 0.001;
      const side = isLeft ? -1 : 1;
      
      if (player.isAttacking) {
        // Enhanced attack animation - more realistic sword swinging
        const attackTime = (Date.now() % Math.floor(600 / player.weapon.speed)) / Math.floor(600 / player.weapon.speed);
        const swingAngle = Math.sin(attackTime * Math.PI) * 1.4;
        
        if (upperArmRef.current) {
          upperArmRef.current.rotation.x = swingAngle * 0.6;
          upperArmRef.current.rotation.z = side * (0.4 + swingAngle * 0.5);
          upperArmRef.current.rotation.y = swingAngle * 0.2;
        }
        
        if (forearmRef.current) {
          forearmRef.current.rotation.x = swingAngle * 0.9;
          forearmRef.current.rotation.z = side * swingAngle * 0.3;
        }
        
        if (handRef.current) {
          handRef.current.rotation.x = swingAngle * 0.4;
          handRef.current.rotation.z = side * swingAngle * 0.2;
        }
      } else if (player.isBlocking) {
        // Enhanced blocking pose
        if (upperArmRef.current) {
          upperArmRef.current.rotation.x = -0.6;
          upperArmRef.current.rotation.z = side * 0.9;
          upperArmRef.current.rotation.y = side * 0.2;
        }
        if (forearmRef.current) {
          forearmRef.current.rotation.x = -1.3;
          forearmRef.current.rotation.z = side * 0.3;
        }
        if (handRef.current) {
          handRef.current.rotation.x = -0.2;
        }
      } else {
        // Enhanced idle animation - more natural arm movement
        const idleMovement = Math.sin(time * 1.5 + (isLeft ? 0 : Math.PI)) * 0.08;
        const breathingMovement = Math.sin(time * 2) * 0.02;
        
        if (upperArmRef.current) {
          upperArmRef.current.rotation.x = idleMovement + breathingMovement;
          upperArmRef.current.rotation.z = side * (0.15 + idleMovement * 0.6);
          upperArmRef.current.rotation.y = idleMovement * 0.3;
        }
        
        if (forearmRef.current) {
          forearmRef.current.rotation.x = -0.3 + idleMovement * 0.4;
          forearmRef.current.rotation.z = side * idleMovement * 0.2;
        }
        
        if (handRef.current) {
          handRef.current.rotation.x = idleMovement * 0.2;
        }
      }
    }
  });

  const armPosition = isLeft ? [-0.28, 1.18, 0] : [0.28, 1.18, 0];
  
  return (
    <group ref={armRef} position={armPosition}>
      {/* Enhanced upper arm */}
      <Box 
        ref={upperArmRef}
        args={[BODY_PROPORTIONS.upperArm.width, BODY_PROPORTIONS.upperArm.height, BODY_PROPORTIONS.upperArm.depth]}
        position={[0, -0.15, 0]}
      >
        <meshStandardMaterial 
          color={player.armor.type === 'none' ? MATERIALS.skin : MATERIALS.chainmail}
          roughness={0.7}
          metalness={player.armor.type === 'plate' ? 0.7 : 0.1}
        />
      </Box>
      
      {/* Shoulder muscle definition */}
      {player.armor.type === 'none' && (
        <Sphere args={[0.06]} position={[side * 0.02, -0.05, 0]}>
          <meshStandardMaterial color={MATERIALS.skinDark} roughness={0.8} />
        </Sphere>
      )}
      
      {/* Enhanced forearm */}
      <Box 
        ref={forearmRef}
        args={[BODY_PROPORTIONS.forearm.width, BODY_PROPORTIONS.forearm.height, BODY_PROPORTIONS.forearm.depth]}
        position={[0, -0.44, 0]}
      >
        <meshStandardMaterial 
          color={player.armor.type === 'none' ? MATERIALS.skin : MATERIALS.leather}
          roughness={0.8}
          metalness={0.1}
        />
      </Box>
      
      {/* Enhanced hand with individual fingers */}
      <group ref={handRef} position={[0, -0.62, 0]}>
        {/* Palm */}
        <Box args={[BODY_PROPORTIONS.hand.width, BODY_PROPORTIONS.hand.height, BODY_PROPORTIONS.hand.depth]}>
          <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
        </Box>
        
        {/* Individual fingers with joints */}
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={`finger-${i}`}>
            {/* Finger segments */}
            <Box 
              args={[0.012, 0.04, 0.012]}
              position={[-0.04 + i * 0.025, -0.12, 0.02]}
              rotation={[0.1, 0, i * 0.05 - 0.075]}
            >
              <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
            </Box>
            <Box 
              args={[0.01, 0.03, 0.01]}
              position={[-0.04 + i * 0.025, -0.16, 0.025]}
              rotation={[0.2, 0, i * 0.05 - 0.075]}
            >
              <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
            </Box>
            <Box 
              args={[0.008, 0.02, 0.008]}
              position={[-0.04 + i * 0.025, -0.19, 0.03]}
              rotation={[0.3, 0, i * 0.05 - 0.075]}
            >
              <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
            </Box>
          </group>
        ))}
        
        {/* Enhanced thumb with joints */}
        <group>
          <Box 
            args={[0.012, 0.03, 0.012]}
            position={[0.05, -0.08, 0]}
            rotation={[0, 0, 0.6]}
          >
            <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
          </Box>
          <Box 
            args={[0.01, 0.025, 0.01]}
            position={[0.065, -0.06, 0.01]}
            rotation={[0.1, 0, 0.7]}
          >
            <meshStandardMaterial color={MATERIALS.skin} roughness={0.9} />
          </Box>
        </group>
      </group>
      
      {/* Armor pieces for arms */}
      {player.armor.type === 'plate' && (
        <>
          {/* Shoulder pauldron */}
          <Sphere args={[0.08]} position={[side * 0.02, -0.02, 0]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.9} roughness={0.1} />
          </Sphere>
          {/* Elbow guard */}
          <Sphere args={[0.05]} position={[0, -0.3, 0]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.9} roughness={0.1} />
          </Sphere>
        </>
      )}
    </group>
  );
}

function EnhancedLeg({ 
  player, 
  isLeft, 
  isPlayer 
}: { 
  player: Player; 
  isLeft: boolean; 
  isPlayer: boolean; 
}) {
  const legRef = useRef<THREE.Group>(null);
  const upperLegRef = useRef<THREE.Mesh>(null);
  const lowerLegRef = useRef<THREE.Mesh>(null);
  const footRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (legRef.current) {
      const time = Date.now() * 0.001;
      const side = isLeft ? -1 : 1;
      
      // Enhanced walking/stance animation
      const walkCycle = Math.sin(time * 2 + (isLeft ? 0 : Math.PI)) * 0.12;
      const breathingMovement = Math.sin(time * 2) * 0.01;
      
      if (upperLegRef.current) {
        upperLegRef.current.rotation.x = walkCycle * 0.4 + breathingMovement;
        upperLegRef.current.rotation.z = side * walkCycle * 0.1;
      }
      
      if (lowerLegRef.current) {
        lowerLegRef.current.rotation.x = Math.abs(walkCycle) * 0.6 + breathingMovement;
      }
      
      if (footRef.current) {
        footRef.current.rotation.x = -walkCycle * 0.2;
      }
      
      // Enhanced combat stance adjustments
      if (player.isAttacking || player.isBlocking) {
        if (upperLegRef.current) {
          upperLegRef.current.rotation.x = side * 0.25;
          upperLegRef.current.rotation.z = side * 0.1;
        }
        if (lowerLegRef.current) {
          lowerLegRef.current.rotation.x = 0.3;
        }
      }
    }
  });

  const legPosition = isLeft ? [-0.12, 0.5, 0] : [0.12, 0.5, 0];
  
  return (
    <group ref={legRef} position={legPosition}>
      {/* Enhanced upper leg */}
      <Box 
        ref={upperLegRef}
        args={[BODY_PROPORTIONS.upperLeg.width, BODY_PROPORTIONS.upperLeg.height, BODY_PROPORTIONS.upperLeg.depth]}
        position={[0, -0.21, 0]}
      >
        <meshStandardMaterial 
          color={player.armor.type === 'plate' ? MATERIALS.plate : MATERIALS.cloth}
          roughness={0.7}
          metalness={player.armor.type === 'plate' ? 0.8 : 0.1}
        />
      </Box>
      
      {/* Thigh muscle definition */}
      {player.armor.type === 'none' && (
        <Box args={[0.11, 0.35, 0.11]} position={[0, -0.21, 0]}>
          <meshStandardMaterial color={MATERIALS.skinDark} roughness={0.8} />
        </Box>
      )}
      
      {/* Enhanced lower leg */}
      <Box 
        ref={lowerLegRef}
        args={[BODY_PROPORTIONS.lowerLeg.width, BODY_PROPORTIONS.lowerLeg.height, BODY_PROPORTIONS.lowerLeg.depth]}
        position={[0, -0.60, 0]}
      >
        <meshStandardMaterial 
          color={player.armor.type === 'plate' ? MATERIALS.plate : MATERIALS.leather}
          roughness={0.8}
          metalness={player.armor.type === 'plate' ? 0.7 : 0.2}
        />
      </Box>
      
      {/* Calf muscle definition */}
      {player.armor.type === 'none' && (
        <Box args={[0.08, 0.25, 0.12]} position={[0, -0.55, 0.02]}>
          <meshStandardMaterial color={MATERIALS.skinDark} roughness={0.8} />
        </Box>
      )}
      
      {/* Enhanced foot structure */}
      <group ref={footRef} position={[0, -0.80, 0.10]}>
        <Box args={[BODY_PROPORTIONS.foot.width, BODY_PROPORTIONS.foot.height, BODY_PROPORTIONS.foot.depth]}>
          <meshStandardMaterial color={MATERIALS.leather} roughness={0.9} metalness={0.1} />
        </Box>
        
        {/* Boot details */}
        <Box args={[0.12, 0.06, 0.28]} position={[0, 0.02, 0]}>
          <meshStandardMaterial color="#654321" roughness={0.9} metalness={0.1} />
        </Box>
        
        {/* Boot laces */}
        {Array.from({ length: 4 }).map((_, i) => (
          <Box 
            key={`lace-${i}`}
            args={[0.002, 0.04, 0.002]} 
            position={[0, 0.04, -0.08 + i * 0.04]}
          >
            <meshStandardMaterial color="#2F2F2F" />
          </Box>
        ))}
      </group>
      
      {/* Enhanced ankle bones */}
      <Sphere args={[0.018]} position={[-0.05, -0.77, 0.02]}>
        <meshStandardMaterial color={MATERIALS.skinLight} roughness={0.8} />
      </Sphere>
      <Sphere args={[0.018]} position={[0.05, -0.77, 0.02]}>
        <meshStandardMaterial color={MATERIALS.skinLight} roughness={0.8} />
      </Sphere>
      
      {/* Enhanced knee joint details */}
      <Sphere args={[0.045]} position={[0, -0.40, 0.07]}>
        <meshStandardMaterial 
          color={player.armor.type === 'none' ? MATERIALS.skinLight : MATERIALS.plate} 
          roughness={player.armor.type === 'none' ? 0.8 : 0.1}
          metalness={player.armor.type === 'plate' ? 0.9 : 0.1}
        />
      </Sphere>
      
      {/* Leg armor pieces */}
      {player.armor.type === 'plate' && (
        <>
          {/* Knee guard */}
          <Box args={[0.14, 0.08, 0.12]} position={[0, -0.40, 0.08]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.9} roughness={0.1} />
          </Box>
          {/* Shin guard */}
          <Box args={[0.12, 0.30, 0.08]} position={[0, -0.60, 0.06]}>
            <meshStandardMaterial color={MATERIALS.plate} metalness={0.9} roughness={0.1} />
          </Box>
        </>
      )}
    </group>
  );
}

function EnhancedWeapon({ player, isPlayer }: { player: Player; isPlayer: boolean }) {
  const weaponRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (weaponRef.current) {
      const time = Date.now() * 0.001;
      
      if (player.isAttacking) {
        // Enhanced weapon swing animation with realistic physics
        const attackTime = (Date.now() % Math.floor(600 / player.weapon.speed)) / Math.floor(600 / player.weapon.speed);
        const swingAngle = Math.sin(attackTime * Math.PI);
        
        weaponRef.current.rotation.x = swingAngle * 0.9;
        weaponRef.current.rotation.z = swingAngle * 0.7 + (isPlayer ? -0.4 : 0.4);
        weaponRef.current.rotation.y = swingAngle * 0.3;
        
        // Enhanced weapon trail effect during swing
        weaponRef.current.position.y = 1.2 + swingAngle * 0.25;
        weaponRef.current.position.x = (isPlayer ? 0.4 : -0.4) + swingAngle * 0.1;
      } else if (player.isBlocking) {
        weaponRef.current.rotation.x = -0.4;
        weaponRef.current.rotation.z = isPlayer ? -0.9 : 0.9;
        weaponRef.current.rotation.y = isPlayer ? 0.2 : -0.2;
        weaponRef.current.position.y = 1.5;
        weaponRef.current.position.x = isPlayer ? -0.2 : 0.2;
      } else {
        // Enhanced idle weapon position
        weaponRef.current.rotation.x = -0.25 + Math.sin(time * 2) * 0.03;
        weaponRef.current.rotation.z = (isPlayer ? -0.4 : 0.4) + Math.sin(time * 1.5) * 0.02;
        weaponRef.current.rotation.y = Math.sin(time * 1.2) * 0.01;
        weaponRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.015;
        weaponRef.current.position.x = (isPlayer ? 0.4 : -0.4) + Math.sin(time * 1.8) * 0.01;
      }
    }
  });

  // Enhanced weapon geometry with more realistic proportions
  const getWeaponGeometry = (weaponType: string) => {
    switch (weaponType) {
      case 'dagger':
        return { blade: [0.025, 0.28, 0.005], handle: [0.018, 0.14, 0.018], guard: [0.09, 0.012, 0.012] };
      case 'rapier':
        return { blade: [0.010, 0.85, 0.010], handle: [0.022, 0.16, 0.022], guard: [0.14, 0.025, 0.025] };
      case 'longsword':
        return { blade: [0.045, 0.75, 0.008], handle: [0.028, 0.20, 0.028], guard: [0.16, 0.025, 0.025] };
      case 'greatsword':
        return { blade: [0.055, 1.05, 0.010], handle: [0.035, 0.28, 0.035], guard: [0.20, 0.030, 0.030] };
      case 'mace':
        return { blade: [0.070, 0.18, 0.070], handle: [0.028, 0.42, 0.028], guard: null };
      case 'warhammer':
        return { blade: [0.085, 0.14, 0.045], handle: [0.028, 0.38, 0.028], guard: null };
      case 'battleaxe':
        return { blade: [0.14, 0.10, 0.025], handle: [0.032, 0.48, 0.032], guard: null };
      case 'flail':
        return { blade: [0.055, 0.12, 0.055], handle: [0.028, 0.32, 0.028], guard: null };
      default:
        return { blade: [0.045, 0.75, 0.008], handle: [0.028, 0.20, 0.028], guard: [0.16, 0.025, 0.025] };
    }
  };

  const weaponGeometry = getWeaponGeometry(player.weapon.type);
  const weaponPosition = isPlayer ? [0.4, 1.2, 0] : [-0.4, 1.2, 0];

  return (
    <group ref={weaponRef} position={weaponPosition}>
      {/* Enhanced weapon blade/head with better materials */}
      <Box args={weaponGeometry.blade} position={[0, weaponGeometry.blade[1] * 0.5, 0]}>
        <meshStandardMaterial 
          color={player.weapon.type.includes('mace') || player.weapon.type.includes('hammer') ? '#654321' : MATERIALS.steel}
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={2.0}
        />
      </Box>
      
      {/* Enhanced weapon handle with grip texture */}
      <Box args={weaponGeometry.handle} position={[0, -weaponGeometry.handle[1] * 0.5, 0]}>
        <meshStandardMaterial 
          color={MATERIALS.leather}
          roughness={0.95}
          metalness={0.05}
        />
      </Box>
      
      {/* Handle wrapping for better grip */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Cylinder
          key={`wrap-${i}`}
          args={[weaponGeometry.handle[0] * 0.6, weaponGeometry.handle[0] * 0.6, 0.01]}
          position={[0, -weaponGeometry.handle[1] * 0.8 + i * 0.025, 0]}
        >
          <meshStandardMaterial color="#2F2F2F" roughness={0.9} />
        </Cylinder>
      ))}
      
      {/* Enhanced cross guard (for swords) */}
      {weaponGeometry.guard && (
        <Box args={weaponGeometry.guard} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={MATERIALS.metal}
            metalness={0.9}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </Box>
      )}
      
      {/* Enhanced pommel with decorative elements */}
      <Sphere args={[0.035]} position={[0, -weaponGeometry.handle[1], 0]}>
        <meshStandardMaterial 
          color={MATERIALS.metal}
          metalness={0.9}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </Sphere>
      
      {/* Pommel decoration */}
      <Box args={[0.02, 0.02, 0.02]} position={[0, -weaponGeometry.handle[1], 0]}>
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </Box>
      
      {/* Enhanced blood effects on weapon with realistic physics */}
      {(player.weapon.bloodLevel || 0) > 0 && (
        <group>
          {/* Blood droplets with enhanced realism */}
          {Array.from({ length: Math.floor((player.weapon.bloodLevel || 0) * 10) }).map((_, index) => (
            <Sphere
              key={`weapon-blood-${index}`}
              args={[0.010 + Math.random() * 0.008]}
              position={[
                (Math.random() - 0.5) * weaponGeometry.blade[0] * 3,
                (Math.random() - 0.5) * weaponGeometry.blade[1] * 1.8 + weaponGeometry.blade[1] * 0.3,
                (Math.random() - 0.5) * weaponGeometry.blade[2] * 3
              ]}
            >
              <meshStandardMaterial 
                color={index % 2 === 0 ? MATERIALS.blood : MATERIALS.bloodDark} 
                transparent
                opacity={Math.min(0.95, (player.weapon.bloodLevel || 0) * 1.5)}
                emissive="#440000"
                emissiveIntensity={0.5}
                roughness={1.0}
                metalness={0.0}
              />
            </Sphere>
          ))}
          
          {/* Enhanced blood streaks along blade */}
          {Array.from({ length: Math.floor((player.weapon.bloodLevel || 0) * 6) }).map((_, index) => (
            <Box
              key={`weapon-blood-streak-${index}`}
              args={[0.008, 0.10 + Math.random() * 0.08, 0.003]}
              position={[
                (Math.random() - 0.5) * weaponGeometry.blade[0] * 2,
                (Math.random() - 0.5) * weaponGeometry.blade[1] * 0.9 + weaponGeometry.blade[1] * 0.3,
                weaponGeometry.blade[2] * 0.9
              ]}
              rotation={[
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.4,
                Math.random() * Math.PI * 2
              ]}
            >
              <meshStandardMaterial 
                color={MATERIALS.bloodDark} 
                transparent
                opacity={Math.min(0.9, (player.weapon.bloodLevel || 0) * 1.3)}
                emissive="#330000"
                emissiveIntensity={0.3}
                roughness={1.0}
                metalness={0.0}
              />
            </Box>
          ))}
          
          {/* Enhanced dripping blood from tip */}
          {(player.weapon.bloodLevel || 0) > 0.6 && (
            <group>
              <Sphere
                args={[0.012]}
                position={[0, weaponGeometry.blade[1] * 0.95, 0]}
              >
                <meshStandardMaterial 
                  color="#AA0000" 
                  transparent
                  opacity={0.95}
                  emissive="#550000"
                  emissiveIntensity={0.6}
                  roughness={0.8}
                  metalness={0.1}
                />
              </Sphere>
              
              {/* Blood drop falling */}
              <Sphere
                args={[0.008]}
                position={[0, weaponGeometry.blade[1] * 0.95 - 0.05, 0]}
              >
                <meshStandardMaterial 
                  color="#990000" 
                  transparent
                  opacity={0.8}
                  emissive="#440000"
                  emissiveIntensity={0.4}
                />
              </Sphere>
            </group>
          )}
        </group>
      )}
    </group>
  );
}

function EnhancedBloodAndWoundEffects({ player, isPlayer }: { player: Player; isPlayer: boolean }) {
  return (
    <group>
      {/* Enhanced blood splatters on body */}
      {player.bloodSplatters.slice(-4).map((splatter) => (
        <group key={splatter.id}>
          <Sphere
            args={[splatter.size * 0.8]}
            position={[
              splatter.position.x + (Math.random() - 0.5) * 0.15,
              splatter.position.y + 0.9 + Math.random() * 0.08,
              splatter.position.z + (Math.random() - 0.5) * 0.15
            ]}
          >
            <meshStandardMaterial 
              color={MATERIALS.blood} 
              transparent
              opacity={splatter.opacity * 0.9}
              emissive="#440000"
              emissiveIntensity={0.4}
              roughness={1.0}
              metalness={0.0}
            />
          </Sphere>
          
          {/* Blood drips */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={`drip-${i}`}
              args={[0.004, 0.08, 0.004]}
              position={[
                splatter.position.x + (Math.random() - 0.5) * 0.1,
                splatter.position.y + 0.85 - i * 0.05,
                splatter.position.z + (Math.random() - 0.5) * 0.1
              ]}
            >
              <meshStandardMaterial 
                color={MATERIALS.bloodDark} 
                transparent
                opacity={splatter.opacity * 0.7}
                emissive="#330000"
                emissiveIntensity={0.2}
              />
            </Box>
          ))}
        </group>
      ))}

      {/* Enhanced realistic wounds */}
      {player.wounds.slice(-3).map((wound) => (
        <group key={wound.id}>
          {/* Enhanced wound opening with realistic depth */}
          <Box
            args={[
              wound.type === 'stab' ? 0.04 : wound.type === 'slash' ? 0.15 : 0.25,
              wound.type === 'crush' ? 0.18 : 0.08,
              wound.type === 'stab' ? 0.08 : 0.12
            ]}
            position={[
              wound.position.x + (Math.random() - 0.5) * 0.12,
              wound.position.y + 0.9 + (Math.random() - 0.5) * 0.12,
              wound.position.z + (Math.random() - 0.5) * 0.12
            ]}
          >
            <meshStandardMaterial 
              color="#2B0000" 
              transparent
              opacity={0.95}
              emissive={MATERIALS.blood}
              emissiveIntensity={0.4}
              roughness={1.0}
              metalness={0.0}
            />
          </Box>

          {/* Enhanced bone exposure for critical wounds */}
          {wound.showsBone && (
            <Box
              args={[0.06, 0.28, 0.06]}
              position={[
                wound.position.x,
                wound.position.y + 0.9,
                wound.position.z
              ]}
              rotation={[
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
              ]}
            >
              <meshStandardMaterial 
                color={MATERIALS.bone} 
                transparent
                opacity={0.95}
                emissive="#FFFACD"
                emissiveIntensity={0.15}
                roughness={0.3}
                metalness={0.0}
              />
            </Box>
          )}

          {/* Guts spilling for severe torso wounds */}
          {wound.showsGuts && (
            <>
              <Sphere
                args={[0.18]}
                position={[
                  wound.position.x + (Math.random() - 0.5) * 0.3,
                  wound.position.y + 0.7,
                  wound.position.z + (Math.random() - 0.5) * 0.3
                ]}
              >
                <meshStandardMaterial 
                  color="#4B0000" 
                  transparent
                  opacity={0.85}
                  emissive="#8B0000"
                  emissiveIntensity={0.3}
                  roughness={0.9}
                  metalness={0.0}
                />
              </Sphere>
              <Sphere
                args={[0.12]}
                position={[
                  wound.position.x + (Math.random() - 0.5) * 0.5,
                  wound.position.y + 0.6,
                  wound.position.z + (Math.random() - 0.5) * 0.5
                ]}
              >
                <meshStandardMaterial 
                  color="#6B0000" 
                  transparent
                  opacity={0.8}
                  emissive="#8B0000"
                  emissiveIntensity={0.2}
                  roughness={0.9}
                  metalness={0.0}
                />
              </Sphere>
            </>
          )}
        </group>
      ))}

      {/* Enhanced severed limbs with realistic detail */}
      {player.severedLimbs.slice(-2).map((limb) => (
        <group key={limb.id}>
          {/* Enhanced severed limb with proper proportions */}
          <Box
            args={
              limb.bodyPart.includes('Arm') 
                ? [BODY_PROPORTIONS.upperArm.width, BODY_PROPORTIONS.upperArm.height, BODY_PROPORTIONS.upperArm.depth]
                : [BODY_PROPORTIONS.upperLeg.width, BODY_PROPORTIONS.upperLeg.height, BODY_PROPORTIONS.upperLeg.depth]
            }
            position={[limb.position.x, limb.position.y, limb.position.z]}
            rotation={[limb.rotation.x, limb.rotation.y, limb.rotation.z]}
          >
            <meshStandardMaterial 
              color={MATERIALS.skin}
              transparent
              opacity={0.85}
              roughness={0.8}
              metalness={0.0}
            />
          </Box>

          {/* Enhanced exposed bone at severed end */}
          {limb.showsBone && (
            <Cylinder
              args={[0.030, 0.030, 0.15]}
              position={[
                limb.position.x,
                limb.position.y + (limb.bodyPart.includes('Arm') ? 0.15 : 0.21),
                limb.position.z
              ]}
              rotation={[limb.rotation.x, limb.rotation.y, limb.rotation.z]}
            >
              <meshStandardMaterial 
                color={MATERIALS.bone} 
                emissive="#FFFACD"
                emissiveIntensity={0.25}
                roughness={0.2}
                metalness={0.0}
              />
            </Cylinder>
          )}

          {/* Enhanced blood pool around severed limb */}
          <Plane
            args={[0.6, 0.6]}
            position={[limb.position.x, -0.04, limb.position.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial 
              color={MATERIALS.blood} 
              transparent
              opacity={0.8}
              emissive="#440000"
              emissiveIntensity={0.3}
              roughness={1.0}
              metalness={0.0}
            />
          </Plane>

          {/* Enhanced blood trail */}
          {limb.bloodTrail.slice(-3).map((blood) => (
            <Sphere
              key={blood.id}
              args={[blood.size * 0.7]}
              position={[blood.position.x, blood.position.y, blood.position.z]}
            >
              <meshStandardMaterial 
                color={MATERIALS.blood} 
                transparent
                opacity={blood.opacity * 0.8}
                emissive="#440000"
                emissiveIntensity={0.4}
                roughness={1.0}
                metalness={0.0}
              />
            </Sphere>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function RealisticPlayerModel({ player, isPlayer, isFirstPerson = false }: RealisticPlayerModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (modelRef.current) {
      // Enhanced overall body positioning and movement
      const time = Date.now() * 0.001;
      
      // Enhanced subtle body sway
      modelRef.current.position.y = Math.sin(time * 2) * 0.015;
      modelRef.current.rotation.y = Math.sin(time * 0.8) * 0.025;
      
      // Enhanced combat stance adjustments
      if (player.isAttacking) {
        modelRef.current.rotation.x = -0.08;
        modelRef.current.position.z = player.position.z + 0.15;
        modelRef.current.rotation.y += isPlayer ? 0.1 : -0.1;
      } else if (player.isBlocking) {
        modelRef.current.rotation.x = 0.08;
        modelRef.current.position.z = player.position.z - 0.15;
        modelRef.current.rotation.y += isPlayer ? -0.05 : 0.05;
      }
      
      // Enhanced health-based posture changes
      if (player.health < player.maxHealth * 0.3) {
        modelRef.current.rotation.x = -0.15 + Math.sin(time * 4) * 0.03;
        modelRef.current.position.y = -0.08 + Math.sin(time * 3) * 0.02;
        modelRef.current.rotation.z = Math.sin(time * 2) * 0.02;
      }
      
      // Death animation
      if (player.isDead) {
        modelRef.current.rotation.z = Math.PI / 2;
        modelRef.current.position.y = -0.5;
      }
    }
  });

  // Don't render the full model in first person (only weapon is shown)
  if (isFirstPerson) {
    return null;
  }

  return (
    <group 
      ref={modelRef}
      position={[player.position.x, player.position.y, player.position.z]}
      rotation={[0, isPlayer ? 0 : Math.PI, 0]}
    >
      {/* Enhanced realistic body parts */}
      <EnhancedHead player={player} isPlayer={isPlayer} />
      <EnhancedTorso player={player} isPlayer={isPlayer} />
      <EnhancedArm player={player} isLeft={true} isPlayer={isPlayer} />
      <EnhancedArm player={player} isLeft={false} isPlayer={isPlayer} />
      <EnhancedLeg player={player} isLeft={true} isPlayer={isPlayer} />
      <EnhancedLeg player={player} isLeft={false} isPlayer={isPlayer} />
      
      {/* Enhanced weapon */}
      <EnhancedWeapon player={player} isPlayer={isPlayer} />
      
      {/* Enhanced shield when blocking */}
      {player.isBlocking && (
        <group position={[isPlayer ? -0.5 : 0.5, 1.3, 0]}>
          <Box args={[0.05, 0.9, 0.7]}>
            <meshStandardMaterial 
              color={MATERIALS.metal}
              metalness={0.8}
              roughness={0.2}
              envMapIntensity={1.5}
            />
          </Box>
          {/* Enhanced shield boss */}
          <Sphere args={[0.09]} position={[0, 0, 0.36]}>
            <meshStandardMaterial 
              color={MATERIALS.metal}
              metalness={0.9}
              roughness={0.1}
              envMapIntensity={2.0}
            />
          </Sphere>
          {/* Shield decorations */}
          {Array.from({ length: 4 }).map((_, i) => (
            <Box 
              key={`shield-decoration-${i}`}
              args={[0.02, 0.15, 0.02]} 
              position={[
                0,
                0.3 - i * 0.2,
                0.36
              ]}
            >
              <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
            </Box>
          ))}
        </group>
      )}
      
      {/* Enhanced blood and wound effects */}
      <EnhancedBloodAndWoundEffects player={player} isPlayer={isPlayer} />
      
      {/* Name Label */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.35}
        color="#CD853F"
        anchorX="center"
        anchorY="middle"
        font="/fonts/cinzel-regular.woff"
      >
        {player.name}
      </Text>
    </group>
  );
}