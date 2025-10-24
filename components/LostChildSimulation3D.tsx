"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text, Box, Sphere, Environment } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, VolumeX, Play, RotateCcw, X } from "lucide-react"
import * as THREE from "three"

// Scene 1: Crowded Place - Đứa trẻ trong đám đông
function CrowdedScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      // Tạo chuyển động cho đám đông
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      {/* Nhiều người xung quanh - đại diện bởi boxes */}
      {Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const radius = 5 + Math.random() * 3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = 1.5 + Math.random() * 0.5
        
        return (
          <Box
            key={i}
            position={[x, height / 2, z]}
            args={[0.5, height, 0.5]}
            castShadow
          >
            <meshStandardMaterial
              color={`hsl(${Math.random() * 360}, 50%, 50%)`}
              opacity={0.8}
              transparent
            />
          </Box>
        )
      })}
      
      {/* Đứa trẻ (nhỏ hơn) - ở giữa */}
      <Box position={[0, 0.6, 0]} args={[0.4, 1.2, 0.4]} castShadow>
        <meshStandardMaterial color="#ffb6c1" />
      </Box>
      
      {/* Mặt đất */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>
    </group>
  )
}

// Scene 2: Lost Scene - Đứa trẻ bị lạc, nhìn quanh không thấy ba mẹ
function LostScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      // Camera quay tròn - mô phỏng đứa trẻ nhìn quanh tìm ba mẹ
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      {/* Đám đông xa hơn, mờ hơn */}
      {Array.from({ length: 40 }).map((_, i) => {
        const angle = (i / 40) * Math.PI * 2
        const radius = 8 + Math.random() * 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = 1.5 + Math.random() * 0.5
        
        return (
          <Box
            key={i}
            position={[x, height / 2, z]}
            args={[0.5, height, 0.5]}
          >
            <meshStandardMaterial
              color="#666666"
              opacity={0.3}
              transparent
            />
          </Box>
        )
      })}
      
      {/* Đứa trẻ đứng một mình */}
      <Box position={[0, 0.6, 0]} args={[0.4, 1.2, 0.4]} castShadow>
        <meshStandardMaterial color="#ffb6c1" emissive="#ff69b4" emissiveIntensity={0.3} />
      </Box>
      
      {/* Mặt đất tối hơn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}

// Scene 3: Fear Scene - Cảnh đứa trẻ hoảng sợ
function FearScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && isActive) {
      // Rung lắc nhẹ - mô phỏng sự run rẩy
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      {/* Môi trường tối hơn, đáng sợ hơn */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 3, 0]} intensity={0.5} color="#4169e1" />
      
      {/* Đứa trẻ - nhỏ hơn, co rúm */}
      <Box position={[0, 0.5, 0]} args={[0.4, 1.0, 0.4]} castShadow>
        <meshStandardMaterial
          color="#ffb6c1"
          emissive="#0000ff"
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Shadows xung quanh - tạo cảm giác đáng sợ */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 4
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <Sphere
            key={i}
            position={[x, 1, z]}
            args={[0.3, 16, 16]}
          >
            <meshStandardMaterial
              color="#000000"
              opacity={0.5}
              transparent
            />
          </Sphere>
        )
      })}
      
      {/* Mặt đất tối */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  )
}

// Scene 4: Rescue Scene - Ba mẹ tìm thấy con nhờ GPS
function RescueScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  useFrame((state) => {
    if (isActive && lightRef.current) {
      // Ánh sáng ấm áp nhấp nháy
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      {/* Ánh sáng ấm áp */}
      <ambientLight intensity={0.8} />
      <pointLight ref={lightRef} position={[0, 5, 0]} intensity={2} color="#ffd700" />
      
      {/* Đứa trẻ */}
      <Box position={[0, 0.6, 0]} args={[0.4, 1.2, 0.4]} castShadow>
        <meshStandardMaterial color="#ffb6c1" emissive="#ffd700" emissiveIntensity={0.3} />
      </Box>
      
      {/* GPS bracelet - vòng tròn phát sáng */}
      <Sphere position={[0, 0.8, 0.3]} args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color="#4169e1"
          emissive="#4169e1"
          emissiveIntensity={2}
        />
      </Sphere>
      
      {/* Ba mẹ đang tới - 2 người lớn */}
      <Box position={[-2, 0.9, -3]} args={[0.5, 1.8, 0.5]} castShadow>
        <meshStandardMaterial color="#4169e1" />
      </Box>
      <Box position={[2, 0.9, -3]} args={[0.5, 1.8, 0.5]} castShadow>
        <meshStandardMaterial color="#ff69b4" />
      </Box>
      
      {/* GPS signal waves */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.8, 0.3]}>
          <ringGeometry args={[0.3 * i, 0.3 * i + 0.1, 32]} />
          <meshBasicMaterial
            color="#4169e1"
            transparent
            opacity={0.3 / i}
          />
        </mesh>
      ))}
      
      {/* Mặt đất sáng */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </group>
  )
}

// Camera Controller
function CameraController({ scene }: { scene: number }) {
  const { camera } = useThree()
  
  useFrame(() => {
    const targetPositions = [
      { x: 0, y: 2, z: 8 },    // Scene 1: Nhìn từ xa
      { x: 0, y: 1.5, z: 3 },  // Scene 2: Gần hơn
      { x: 0, y: 0.8, z: 1.5 }, // Scene 3: Rất gần - POV của trẻ
      { x: 0, y: 3, z: 10 },   // Scene 4: Nhìn toàn cảnh
    ]
    
    const target = targetPositions[scene] || targetPositions[0]
    
    camera.position.lerp(
      new THREE.Vector3(target.x, target.y, target.z),
      0.05
    )
    camera.lookAt(0, 0.6, 0)
  })
  
  return null
}

interface LostChildSimulation3DProps {
  onClose?: () => void
}

export function LostChildSimulation3D({ onClose }: LostChildSimulation3DProps) {
  const [scene, setScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const scenes = [
    {
      title: "Khoảnh khắc bình thường",
      description: "Con đang ở trong siêu thị/công viên đông người cùng ba mẹ...",
      emotion: "😊",
      duration: 4000,
    },
    {
      title: "Mất dấu ba mẹ",
      description: "Con quay lưng một chút... và không còn thấy ba mẹ đâu nữa.",
      emotion: "😰",
      duration: 5000,
    },
    {
      title: "Nỗi sợ hãi",
      description: "Con hoảng sợ, khóc, không biết phải làm gì. Xung quanh toàn người lạ...",
      emotion: "😭",
      duration: 5000,
    },
    {
      title: "Giải pháp: Vòng tay GPS",
      description: "Nhờ vòng tay ARTEMIS, ba mẹ biết chính xác vị trí con và tìm thấy ngay!",
      emotion: "❤️",
      duration: 6000,
    },
  ]

  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      if (scene < scenes.length - 1) {
        setScene(scene + 1)
      } else {
        setIsPlaying(false)
      }
    }, scenes[scene].duration)

    return () => clearTimeout(timer)
  }, [scene, isPlaying, scenes])

  const handleStart = () => {
    setScene(0)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setScene(0)
    setIsPlaying(false)
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas shadows>
        <CameraController scene={scene} />
        
        {/* Lighting */}
        <ambientLight intensity={scene === 2 ? 0.1 : 0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={scene === 2 ? 0.2 : 0.8}
          castShadow
        />
        
        {/* Scenes */}
        <CrowdedScene isActive={scene === 0} />
        <LostScene isActive={scene === 1} />
        <FearScene isActive={scene === 2} />
        <RescueScene isActive={scene === 3} />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 pointer-events-auto z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Story overlay */}
        <AnimatePresence mode="wait">
          {isPlaying && (
            <motion.div
              key={scene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/70 to-transparent"
            >
              <Card className="p-6 bg-black/50 backdrop-blur-lg border-white/10">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{scenes[scene].emotion}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {scenes[scene].title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {scenes[scene].description}
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-4 w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: scenes[scene].duration / 1000, ease: "linear" }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control panel */}
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <Card className="p-8 max-w-md mx-4 text-center">
              <div className="text-5xl mb-4">😢➡️❤️</div>
              <h2 className="text-2xl font-bold mb-3">
                Trải nghiệm cảm xúc
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Hãy đặt mình vào vị trí của con bạn khi bị lạc. 
                Trải nghiệm 3D này sẽ giúp bạn hiểu rõ nỗi sợ hãi của con 
                và tại sao vòng tay GPS ARTEMIS là cần thiết.
              </p>
              
              <div className="flex gap-3 justify-center pointer-events-auto">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  {scene === 0 ? "Bắt đầu trải nghiệm" : "Tiếp tục"}
                </Button>
                
                {scene > 0 && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Xem lại
                  </Button>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="mt-4 gap-2 pointer-events-auto"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Âm thanh: Bật
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Âm thanh: Tắt
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        )}

        {/* End screen */}
        {!isPlaying && scene === scenes.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-pink-500/20 backdrop-blur-sm"
          >
            <Card className="p-8 max-w-lg mx-4 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-3xl font-bold mb-3">
                An tâm mỗi ngày
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Với vòng tay GPS ARTEMIS, bạn luôn biết con mình ở đâu. 
                Không còn lo lắng, không còn hoảng sợ. 
                Chỉ có tình yêu thương và sự an toàn.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center pointer-events-auto">
                <Button size="lg" asChild>
                  <a href="/products">
                    Khám phá sản phẩm
                  </a>
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Xem lại
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Scene indicator */}
      {isPlaying && (
        <div className="absolute top-4 left-4 flex gap-2">
          {scenes.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-12 rounded-full transition-all ${
                i === scene
                  ? "bg-primary"
                  : i < scene
                  ? "bg-primary/50"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

