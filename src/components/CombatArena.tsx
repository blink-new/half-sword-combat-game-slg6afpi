import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane } from '@react-three/drei';
import { Player, BloodSplatter, Particle, Wound, SeveredLimb } from '../types/game';
import * as THREE from 'three';
import { ErrorBoundary } from './ErrorBoundary';
import RealisticPlayerModel from './RealisticPlayerModel';

interface CombatArenaProps {
  player: Player;
  enemy: Player;
  particles: Particle[];
  onUpdateParticles: () => void;
}



function ParticleSystem({ particles }: { particles: Particle[] }) {
  return (
    <>
      {particles.map((particle) => (
        <Sphere
          key={particle.id}
          args={[particle.size]}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <meshStandardMaterial 
            color={particle.color}
            transparent
            opacity={particle.life / particle.maxLife}
            emissive={particle.color}
            emissiveIntensity={0.3 * (particle.life / particle.maxLife)}
          />
        </Sphere>
      ))}
    </>
  );
}

function Arena() {
  return (
    <>
      {/* Realistic Arena Floor with stone texture */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#3A3A3A" 
          roughness={0.9}
          metalness={0.0}
          normalScale={[0.5, 0.5]}
        />
      </Plane>

      {/* Stone floor tiles for detail - reduced count */}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = (i % 5) * 4 - 8;
        const z = Math.floor(i / 5) * 4 - 8;
        return (
          <Box 
            key={`floor-tile-${i}`}
            args={[3.8, 0.05, 3.8]} 
            position={[x, -0.05, z]}
            receiveShadow
          >
            <meshStandardMaterial 
              color={`hsl(0, 0%, ${25 + Math.random() * 10}%)`}
              roughness={0.95}
              metalness={0.0}
            />
          </Box>
        );
      })}

      {/* Realistic Stone Walls with texture variation */}
      <Box args={[20, 4, 0.3]} position={[0, 2, -10]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2A2A2A" 
          roughness={0.9}
          metalness={0.0}
        />
      </Box>
      <Box args={[20, 4, 0.3]} position={[0, 2, 10]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2A2A2A" 
          roughness={0.9}
          metalness={0.0}
        />
      </Box>
      <Box args={[0.3, 4, 20]} position={[-10, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2A2A2A" 
          roughness={0.9}
          metalness={0.0}
        />
      </Box>
      <Box args={[0.3, 4, 20]} position={[10, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#2A2A2A" 
          roughness={0.9}
          metalness={0.0}
        />
      </Box>

      {/* Stone blocks on walls for detail - reduced count */}
      {Array.from({ length: 20 }).map((_, i) => {
        const isBackWall = i < 5;
        const isFrontWall = i >= 5 && i < 10;
        const isLeftWall = i >= 10 && i < 15;
        const isRightWall = i >= 15;
        
        let position: [number, number, number];
        if (isBackWall) {
          position = [(i % 5) * 4 - 8, 1 + Math.floor(i / 5) * 2, -10.15];
        } else if (isFrontWall) {
          position = [((i - 5) % 5) * 4 - 8, 1 + Math.floor((i - 5) / 5) * 2, 10.15];
        } else if (isLeftWall) {
          position = [-10.15, 1 + Math.floor((i - 10) / 5) * 2, ((i - 10) % 5) * 4 - 8];
        } else {
          position = [10.15, 1 + Math.floor((i - 15) / 5) * 2, ((i - 15) % 5) * 4 - 8];
        }
        
        return (
          <Box 
            key={`wall-block-${i}`}
            args={[1.8, 1.8, 0.1]} 
            position={position}
            castShadow
          >
            <meshStandardMaterial 
              color={`hsl(0, 0%, ${20 + Math.random() * 15}%)`}
              roughness={0.95}
              metalness={0.0}
            />
          </Box>
        );
      })}

      {/* Realistic Torches with detailed construction */}
      <group position={[-8, 0, -8]}>
        {/* Torch base */}
        <Box args={[0.3, 0.3, 0.3]} position={[0, 0.15, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </Box>
        
        {/* Torch pole */}
        <Box args={[0.08, 3, 0.08]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
        
        {/* Torch holder */}
        <Box args={[0.15, 0.1, 0.15]} position={[0, 2.8, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.3} />
        </Box>
        
        {/* Flame */}
        <Sphere args={[0.15]} position={[0, 3.1, 0]}>
          <meshStandardMaterial 
            color="#FF4500" 
            emissive="#FF4500" 
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {/* Inner flame */}
        <Sphere args={[0.08]} position={[0, 3.15, 0]}>
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </group>
      
      <group position={[8, 0, -8]}>
        {/* Torch base */}
        <Box args={[0.3, 0.3, 0.3]} position={[0, 0.15, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </Box>
        
        {/* Torch pole */}
        <Box args={[0.08, 3, 0.08]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#8B4513" roughness={0.8} />
        </Box>
        
        {/* Torch holder */}
        <Box args={[0.15, 0.1, 0.15]} position={[0, 2.8, 0]} castShadow>
          <meshStandardMaterial color="#654321" roughness={0.7} metalness={0.3} />
        </Box>
        
        {/* Flame */}
        <Sphere args={[0.15]} position={[0, 3.1, 0]}>
          <meshStandardMaterial 
            color="#FF4500" 
            emissive="#FF4500" 
            emissiveIntensity={1.2}
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {/* Inner flame */}
        <Sphere args={[0.08]} position={[0, 3.15, 0]}>
          <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </Sphere>
      </group>

      {/* Arena decorations - banners */}
      <group position={[0, 3.5, -9.8]}>
        <Plane args={[2, 3]} rotation={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#8B0000" 
            roughness={0.8}
            transparent
            opacity={0.9}
          />
        </Plane>
      </group>
      
      <group position={[0, 3.5, 9.8]}>
        <Plane args={[2, 3]} rotation={[0, Math.PI, 0]}>
          <meshStandardMaterial 
            color="#4169E1" 
            roughness={0.8}
            transparent
            opacity={0.9}
          />
        </Plane>
      </group>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary mx-auto mb-4"></div>
        <p className="font-cinzel text-secondary">Loading Combat Arena...</p>
      </div>
    </div>
  );
}

export default function CombatArena({ player, enemy, particles, onUpdateParticles }: CombatArenaProps) {
  useEffect(() => {
    const interval = setInterval(onUpdateParticles, 16); // 60fps
    return () => clearInterval(interval);
  }, [onUpdateParticles]);

  return (
    <ErrorBoundary>
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 6, 10], fov: 65 }}
          shadows
          className="bg-gradient-to-b from-gray-900 to-black"
          gl={{ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#1a1a1a');
          }}
        >
          <Suspense fallback={null}>
            {/* Enhanced Realistic Lighting */}
            <ambientLight intensity={0.15} color="#404040" />
            
            {/* Main directional light (sun/moon) */}
            <directionalLight
              position={[15, 20, 10]}
              intensity={1.2}
              color="#FFFACD"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={100}
              shadow-camera-left={-15}
              shadow-camera-right={15}
              shadow-camera-top={15}
              shadow-camera-bottom={-15}
              shadow-bias={-0.0001}
            />
            
            {/* Torch lights with realistic flickering */}
            <pointLight 
              position={[-8, 4, -8]} 
              intensity={2.0} 
              color="#FF4500" 
              distance={12}
              decay={2}
            />
            <pointLight 
              position={[8, 4, -8]} 
              intensity={2.0} 
              color="#FF4500" 
              distance={12}
              decay={2}
            />
            
            {/* Arena center lighting */}
            <spotLight
              position={[0, 12, 0]}
              target-position={[0, 0, 0]}
              angle={Math.PI / 2.5}
              penumbra={0.3}
              intensity={1.5}
              color="#FFFFFF"
              distance={20}
              decay={1.5}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            
            {/* Rim lighting for dramatic effect */}
            <directionalLight
              position={[-10, 5, -10]}
              intensity={0.6}
              color="#4169E1"
            />
            
            {/* Fill light to reduce harsh shadows */}
            <pointLight 
              position={[0, 3, 5]} 
              intensity={0.4} 
              color="#FFFACD" 
              distance={15}
            />

            {/* Scene */}
            <Arena />
            <RealisticPlayerModel player={player} isPlayer={true} />
            <RealisticPlayerModel player={enemy} isPlayer={false} />
            <ParticleSystem particles={particles} />

            {/* Enhanced Camera Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 6}
              minDistance={6}
              maxDistance={20}
              enableDamping
              dampingFactor={0.08}
              rotateSpeed={0.8}
              zoomSpeed={1.2}
              panSpeed={0.8}
              target={[0, 1.5, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}