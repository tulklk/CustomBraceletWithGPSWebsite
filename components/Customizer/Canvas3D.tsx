"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { useCustomizer } from "@/store/useCustomizer"
import { COLOR_PALETTE } from "@/lib/constants"
import { Accessory } from "@/lib/types"
import * as THREE from "three"
import { motion } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Canvas3DProps {
  accessories: Accessory[]
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

  const posY = position === "inside" ? 0 : -0.15

  return (
    <group position={[0, posY, 0]}>
      {/* Text plate - smaller */}
      <mesh>
        <boxGeometry args={[0.35, 0.06, 0.015]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {/* Decorative borders */}
      <mesh position={[0, 0, 0.01]}>
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
function BraceletScene({ accessories }: { accessories: Accessory[] }) {
  const { colors, accessories: selectedAccessories, engrave } = useCustomizer()

  const getColorHex = (colorId: string) => {
    return COLOR_PALETTE.find((c) => c.id === colorId)?.hex || "#4169E1"
  }

  const getAccessoryById = (id: string) => {
    return accessories.find((a) => a.id === id)
  }

  // Calculate positions for charms around watch face (like 2D)
  const getCharmPositions = () => {
    const positions: [number, number, number][] = []
    const count = selectedAccessories.length
    
    // Define positions around watch face: top, right, bottom, left (clockwise from top)
    const basePositions = [
      [0, 0.4, 0],      // Top
      [0.4, 0, 0],      // Right  
      [0, -0.4, 0],     // Bottom
      [-0.4, 0, 0],     // Left
      [0.3, 0.3, 0],    // Top-Right
      [0.3, -0.3, 0],   // Bottom-Right
      [-0.3, -0.3, 0],  // Bottom-Left
      [-0.3, 0.3, 0],   // Top-Left
      [0, 0.5, 0],      // Far Top
      [0.5, 0, 0],      // Far Right
      [0, -0.5, 0],     // Far Bottom
      [-0.5, 0, 0],     // Far Left
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
      <PerspectiveCamera makeDefault position={[0, 2, 3]} fov={40} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.2}
        target={[0, 0, 0]}
      />

      {/* Lighting - softer, more even */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[3, 4, 3]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-3, 3, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#ffffff" />

      {/* Environment for subtle reflections */}
      <Environment preset="apartment" />

      {/* 3D Bracelet */}
      <BraceletBand color={getColorHex(colors.band)} rimColor={getColorHex(colors.rim)} />
      <WatchFace faceColor={getColorHex(colors.face)} rimColor={getColorHex(colors.rim)} />

      {/* Charms/Accessories */}
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

      {/* Engrave Text */}
      {engrave && (
        <EngraveText3D
          text={engrave.text}
          font={engrave.font}
          position={engrave.position}
        />
      )}

      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <shadowMaterial opacity={0.25} />
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
export function Canvas3D({ accessories }: Canvas3DProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleReset = () => {
    // Reset camera position by remounting OrbitControls
    if (canvasRef.current) {
      const event = new Event("reset-camera")
      canvasRef.current.dispatchEvent(event)
    }
  }

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
            Preview 3D
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Kéo để xoay • Scroll để zoom
          </p>
        </div>
      </div>

      {/* Reset button */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm"
        onClick={handleReset}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset góc nhìn
      </Button>

      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <BraceletScene accessories={accessories} />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <Suspense fallback={<LoadingFallback />}>
        <></>
      </Suspense>
    </motion.div>
  )
}

