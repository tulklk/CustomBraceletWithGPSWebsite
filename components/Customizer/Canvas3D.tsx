"use client"

import { useRef, Suspense, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from "@react-three/drei"
import { useCustomizer } from "@/store/useCustomizer"
import { COLOR_PALETTE } from "@/lib/constants"
import { Accessory } from "@/lib/types"
import * as THREE from "three"
import { motion } from "framer-motion"

interface Canvas3DProps {
  accessories: Accessory[]
  useGLBModel?: boolean // Tùy chọn dùng GLB model thay vì vẽ tay
  glbPath?: string // Đường dẫn đến file GLB
}

// GLB Model Loader Component
function GLBModel({ modelPath, scale = 1 }: { modelPath: string; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null)
  
  // Load GLB model
  const { scene } = useGLTF(modelPath)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04
      // Slow rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <group ref={meshRef}>
      <primitive 
        object={scene.clone()} 
        scale={scale}
        castShadow
        receiveShadow
      />
    </group>
  )
}

// Render different bunny designs based on template
function renderBunnyDesign(templateId: string, colors: { band: string; watchRim: string }) {
  const baseGroup = (
    <group position={[0, 0.077, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Kawaii 2D Bunny - Cuter and Cleaner Design */}
      
      {/* Main body - larger, rounder */}
      <mesh position={[0, -0.04, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Head - slightly overlapping body */}
      <mesh position={[0, 0.09, 0]}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Left ear - longer and more oval */}
      <mesh position={[-0.055, 0.22, 0]} scale={[0.45, 1.6, 1]}>
        <circleGeometry args={[0.048, 24]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Right ear - longer and more oval */}
      <mesh position={[0.055, 0.22, 0]} scale={[0.45, 1.6, 1]}>
        <circleGeometry args={[0.048, 24]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Left ear inner - pink */}
      <mesh position={[-0.055, 0.22, 0.001]} scale={[0.32, 1.3, 1]}>
        <circleGeometry args={[0.032, 20]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.4} />
      </mesh>
      
      {/* Right ear inner - pink */}
      <mesh position={[0.055, 0.22, 0.001]} scale={[0.32, 1.3, 1]}>
        <circleGeometry args={[0.032, 20]} />
        <meshStandardMaterial color="#FFB6C1" roughness={0.4} />
      </mesh>
      
      {/* Left eye - bigger, cuter */}
      <mesh position={[-0.042, 0.105, 0.001]}>
        <circleGeometry args={[0.024, 24]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.2} />
      </mesh>
      
      {/* Right eye - bigger, cuter */}
      <mesh position={[0.042, 0.105, 0.001]}>
        <circleGeometry args={[0.024, 24]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.2} />
      </mesh>
      
      {/* Left eye highlight - sparkle */}
      <mesh position={[-0.036, 0.115, 0.002]}>
        <circleGeometry args={[0.009, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.05} emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Right eye highlight - sparkle */}
      <mesh position={[0.048, 0.115, 0.002]}>
        <circleGeometry args={[0.009, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.05} emissive="#FFFFFF" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Cute pink nose - slightly bigger */}
      <mesh position={[0, 0.068, 0.002]}>
        <circleGeometry args={[0.016, 20]} />
        <meshStandardMaterial color="#FF8FA3" roughness={0.4} />
      </mesh>
      
      {/* Smile - left curve */}
      <mesh position={[-0.018, 0.048, 0.002]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.02, 0.0045, 8, 16, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.4} />
      </mesh>
      
      {/* Smile - right curve */}
      <mesh position={[0.018, 0.048, 0.002]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.02, 0.0045, 8, 16, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.4} />
      </mesh>
      
      {/* Rosy left cheek */}
      <mesh position={[-0.095, 0.085, 0.002]}>
        <circleGeometry args={[0.027, 20]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.65} roughness={0.8} />
      </mesh>
      
      {/* Rosy right cheek */}
      <mesh position={[0.095, 0.085, 0.002]}>
        <circleGeometry args={[0.027, 20]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.65} roughness={0.8} />
      </mesh>
      
      {/* Left arm - cuter position */}
      <mesh position={[-0.135, -0.01, 0]} scale={[0.65, 1.15, 1]}>
        <circleGeometry args={[0.038, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Right arm - cuter position */}
      <mesh position={[0.135, -0.01, 0]} scale={[0.65, 1.15, 1]}>
        <circleGeometry args={[0.038, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Left foot - oval shape */}
      <mesh position={[-0.075, -0.155, 0]} scale={[1.35, 0.75, 1]}>
        <circleGeometry args={[0.042, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Right foot - oval shape */}
      <mesh position={[0.075, -0.155, 0]} scale={[1.35, 0.75, 1]}>
        <circleGeometry args={[0.042, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      
      {/* Fluffy tail - bigger pom-pom */}
      <mesh position={[0, -0.18, -0.001]}>
        <circleGeometry args={[0.038, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.85} />
      </mesh>
      
      {/* Inner tail detail - for fluffiness */}
      <mesh position={[0, -0.18, 0]}>
        <circleGeometry args={[0.025, 16]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </mesh>
    </group>
  )

  // No decorations on bunny face - clean and simple
  return baseGroup
}

// Bunny Watch Bracelet 3D - Vertical strap style matching product images
function BunnyWatch3D({ templateId }: { templateId: string }) {
  const meshRef = useRef<THREE.Group>(null)
  
  // Get colors based on template - matching 2D preview PNG images exactly
  const getTemplateColors = (id: string) => {
    const colorMap: Record<string, { band: string; watchRim: string }> = {
      'bunny-baby-pink': { band: '#FFB5B5', watchRim: '#FF9999' },  // Coral pink
      'bunny-lavender': { band: '#FF77D4', watchRim: '#FF3DC7' },   // Periwinkle blue
      'bunny-yellow': { band: '#FFE57F', watchRim: '#FFCC33' },     // Golden yellow
      'bunny-mint': { band: '#A8C4F5', watchRim: '#7DA3E8' },       // Medium mint green
      'bunny-pink': { band: '#7EC97E', watchRim: '#5FB85F' },       // Vibrant fuchsia/magenta
    }
    return colorMap[id] || colorMap['bunny-baby-pink']
  }

  const colors = getTemplateColors(templateId)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04
      // Very slow rotation on Y axis
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <group ref={meshRef} rotation={[0, 0, 0]}>
      {/* Main strap band - horizontal on ground */}
      {/* Left strap */}
      <mesh position={[-0.8, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.08, 0.25]} />
        <meshStandardMaterial
          color={colors.band}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Right strap */}
      <mesh position={[0.8, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.08, 0.25]} />
        <meshStandardMaterial
          color={colors.band}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Rounded edges for strap ends */}
      <mesh position={[-1.4, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.125, 0.02, 8, 16]} />
        <meshStandardMaterial
          color={colors.band}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[1.4, 0.04, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.125, 0.02, 8, 16]} />
        <meshStandardMaterial
          color={colors.band}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Buckle at left - oval shape with hole */}
      <group position={[-1.48, 0.04, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.025, 16, 32]} />
          <meshStandardMaterial
            color="#d0d0d0"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>
        {/* Buckle pin */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.015, 0.015, 0.15]} />
          <meshStandardMaterial
            color="#c0c0c0"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* Adjustment holes on right strap - small and subtle */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 0.52 + i * 0.11
        return (
          <group key={`hole-${i}`}>
            {/* Hole indentation */}
            <mesh position={[x, 0.025, 0]}>
              <cylinderGeometry args={[0.015, 0.018, 0.03, 16]} />
              <meshStandardMaterial
                color={colors.band}
                roughness={0.8}
              />
            </mesh>
            {/* Hole shadow */}
            <mesh position={[x, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.016, 16]} />
              <meshStandardMaterial
                color="#000000"
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        )
      })}

      {/* Watch face - circular in the center */}
      <group position={[0, 0, 0]}>
        {/* Watch case body - thicker, more realistic */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.15, 64]} />
          <meshStandardMaterial
            color={colors.watchRim}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>

        {/* Watch face background - solid color */}
        <mesh position={[0, 0.076, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <circleGeometry args={[0.43, 64]} />
          <meshStandardMaterial
            color={colors.band}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>

         {/* Render different bunny designs based on templateId */}
         {renderBunnyDesign(templateId, colors)}

        {/* Glass cover - more realistic */}
        <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.44, 64]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            roughness={0.03}
            metalness={0.08}
            transmission={0.88}
            thickness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.04}
            reflectivity={0.92}
          />
        </mesh>

        {/* Inner rim - subtle */}
        <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.43, 0.015, 16, 64]} />
          <meshStandardMaterial
            color={colors.watchRim}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>

        {/* Outer rim - raised bezel */}
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.45, 0.022, 16, 64]} />
          <meshStandardMaterial
            color={colors.watchRim}
            roughness={0.4}
            metalness={0.35}
          />
        </mesh>
      </group>

      {/* "Artemis" text on left strap */}
      <group position={[-1.0, 0.085, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.25, 0.06, 0.008]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.3}
            opacity={0.8}
            transparent
          />
        </mesh>
      </group>

      {/* No decorations - clean and simple */}
    </group>
  )
}

// 3D Bracelet Band - Flat horizontal strap (exactly like 2D)
function BraceletBand({ color, rimColor }: { color: string; rimColor: string }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // Very subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main band - very thin horizontal strap */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.06, 0.15]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.3}
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Top edge highlight */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[3.6, 0.01, 0.16]} />
        <meshStandardMaterial
          color={rimColor}
          roughness={0.3}
          metalness={0.5}
          emissive={rimColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Decorative holes along the band */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -1.6 + (i * 3.2) / 11
        return (
          <mesh key={i} position={[x, 0, 0.08]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              metalness={0.1}
              transparent
              opacity={0.4}
            />
          </mesh>
        )
      })}
      
      {/* Buckle (left side) - smaller */}
      <mesh position={[-1.82, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#b0b0b0"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
      
      {/* Button/Crown (right side) - smaller */}
      <mesh position={[1.85, 0, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
        <meshStandardMaterial
          color="#cccccc"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      
      {/* Button center detail */}
      <mesh position={[1.87, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial
          color="#e0e0e0"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </group>
  )
}

// 3D Watch Face - Flatter, more like 2D
function WatchFace({ faceColor, rimColor }: { faceColor: string; rimColor: string }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Watch face - flatter cylinder */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 32]} />
        <meshStandardMaterial
          color={faceColor}
          roughness={0.3}
          metalness={0.6}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Rim - rotated to lay flat horizontally like the watch face */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.03, 16, 50]} />
        <meshStandardMaterial
          color={rimColor}
          roughness={0.2}
          metalness={0.85}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Screen/Display area */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.015, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.15}
          metalness={0.4}
          emissive="#4169e1"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Glass effect - subtle */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.21, 0.21, 0.005, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
          roughness={0}
          metalness={0.05}
          transmission={0.8}
          thickness={0.3}
        />
      </mesh>
    </group>
  )
}

// 3D Accessory/Charm - smaller, flatter (like 2D)
function Charm3D({ accessory, position, index }: { accessory: Accessory; position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Very gentle bobbing
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.02
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  // Color variations for different accessories
  const colors = ["#ffd700", "#ff69b4", "#4169e1", "#32cd32", "#ff8c00", "#9370db"]
  const color = colors[index % colors.length]

  return (
    <group position={position}>
      {/* Charm attachment ring - smaller */}
      <mesh position={[0, 0.06, 0]}>
        <torusGeometry args={[0.03, 0.008, 8, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.85} roughness={0.2} />
      </mesh>
      
      {/* Charm body - smaller, flatter sphere */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.7}
          envMapIntensity={1.2}
        />
      </mesh>
      
      {/* Small center detail */}
      <mesh position={[0, 0, 0.065]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>
    </group>
  )
}

// 3D Engrave Text (simplified as embossed plate)
function EngraveText3D({ text, font, position }: { text: string; font: string; position: string }) {
  if (!text) return null

  const posY = position === "inside" ? 0.12 : -0.2

  return (
    <group position={[0, posY, 0]}>
      {/* Text plate - smaller */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.35, 0.06, 0.015]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {/* Decorative borders */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.37, 0.08, 0.008]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.3}
          metalness={0.85}
        />
      </mesh>
    </group>
  )
}

// Main 3D Scene
function BraceletScene({ 
  accessories, 
  useGLBModel = true, 
  glbPath = "/models/bracelet.glb" 
}: { 
  accessories: Accessory[]
  useGLBModel?: boolean
  glbPath?: string
}) {
  const { templateId, colors, accessories: selectedAccessories, engrave } = useCustomizer()

  const getColorHex = (colorId: string) => {
    return COLOR_PALETTE.find((c) => c.id === colorId)?.hex || "#4169E1"
  }

  const getAccessoryById = (id: string) => {
    return accessories.find((a) => a.id === id)
  }

  // Map template ID to GLB file path
  const getGLBPath = (id: string | null) => {
    if (!id) return '/models/bracelet-bunny-pink.glb'
    
    const glbMap: Record<string, string> = {
      'bunny-baby-pink': '/models/bracelet-bunny-pink.glb',
      'bunny-lavender': '/models/bracelet-bunny-lavendar.glb',
      'bunny-yellow': '/models/bracelet-bunny-yellow.glb',
      'bunny-mint': '/models/bracelet-bunny-mint.glb',
      'bunny-pink': '/models/bracelet-bunny-green.glb',
    }
    return glbMap[id] || glbMap['bunny-baby-pink']
  }

  // Get current GLB path based on template
  const currentGLBPath = getGLBPath(templateId)

  // Calculate positions for charms around watch face (like 2D)
  const getCharmPositions = () => {
    const positions: [number, number, number][] = []
    
    // Define positions around watch face: top, right, bottom, left (clockwise from top)
    const basePositions = [
      [0, 0.5, 0],      // Top
      [0.5, 0.15, 0],      // Right  
      [0, -0.3, 0],     // Bottom
      [-0.5, 0.15, 0],     // Left
      [0.35, 0.4, 0],    // Top-Right
      [0.35, -0.15, 0],   // Bottom-Right
      [-0.35, -0.15, 0],  // Bottom-Left
      [-0.35, 0.4, 0],   // Top-Left
      [0, 0.65, 0],      // Far Top
      [0.65, 0.15, 0],      // Far Right
      [0, -0.45, 0],     // Far Bottom
      [-0.65, 0.15, 0],     // Far Left
    ]
    
    selectedAccessories.forEach((acc, index) => {
      if (index < basePositions.length) {
        positions.push(basePositions[index] as [number, number, number])
      }
    })
    
    return positions
  }

  const charmPositions = getCharmPositions()

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 0.2]} fov={45} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.8}
        target={[0, 0, 0]}
      />

      {/* Lighting - bright and clear for texture visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[2, 3, 2]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-2, 2, -1]} intensity={0.6} />
      <pointLight position={[0, 2, 1]} intensity={0.4} color="#ffffff" />
      <spotLight
        position={[0, 3, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />

      {/* Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* 3D Model from GLB File */}
      <GLBModel modelPath={currentGLBPath} scale={1} />

      {/* Charms/Accessories - floating around the watch */}
      {selectedAccessories.map((acc, index) => {
        const accessory = getAccessoryById(acc.accessoryId)
        if (!accessory) return null
        
        return (
          <Charm3D
            key={`${acc.accessoryId}-${index}`}
            accessory={accessory}
            position={charmPositions[index]}
            index={index}
          />
        )
      })}

      {/* Engrave Text - displayed as decorative plate */}
      {engrave && engrave.text && (
        <EngraveText3D
          text={engrave.text}
          font={engrave.font}
          position={engrave.position}
        />
      )}

      {/* Ground plane for shadows - at ground level */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Đang tải preview 3D...</p>
      </div>
    </div>
  )
}

// Main Component
export function Canvas3D({ 
  accessories, 
  useGLBModel = true, 
  glbPath = "/models/bracelet.glb" 
}: Canvas3DProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-xl"
      style={{ height: "600px" }}
      ref={canvasRef}
    >
      {/* Info badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <p className="text-xs font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            3D Model Preview
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Kéo để xoay • Scroll để zoom
          </p>
        </div>
      </div>


      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <BraceletScene 
            accessories={accessories} 
            useGLBModel={useGLBModel}
            glbPath={glbPath}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <Suspense fallback={<LoadingFallback />}>
        <></>
      </Suspense>
    </motion.div>
  )
}

