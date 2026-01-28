"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Text, Box, Sphere, Environment, Sky, useFBX, useGLTF, useAnimations } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, VolumeX, Play, RotateCcw, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import * as THREE from "three"

// Mô hình người lớn 3D - được làm cao lớn hơn để tạo cảm giác áp lực
function AdultPerson({ position, color, ...props }: any) {
  return (
    <group position={position} scale={[1.2, 1.6, 1.2]} {...props}>
      {/* Đầu */}
      <Sphere position={[0, 1.6, 0]} args={[0.15, 16, 16]} castShadow>
        <meshStandardMaterial color="#FFE4C4" />
      </Sphere>

      {/* Thân */}
      <Box position={[0, 1, 0]} args={[0.4, 0.8, 0.25]} castShadow>
        <meshStandardMaterial color={color || "#4169E1"} />
      </Box>

      {/* Tay trái */}
      <Box position={[-0.3, 1, 0]} args={[0.12, 0.6, 0.12]} rotation={[0, 0, 0.3]} castShadow>
        <meshStandardMaterial color={color || "#4169E1"} />
      </Box>

      {/* Tay phải */}
      <Box position={[0.3, 1, 0]} args={[0.12, 0.6, 0.12]} rotation={[0, 0, -0.3]} castShadow>
        <meshStandardMaterial color={color || "#4169E1"} />
      </Box>

      {/* Chân trái */}
      <Box position={[-0.12, 0.35, 0]} args={[0.15, 0.7, 0.15]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Box>

      {/* Chân phải */}
      <Box position={[0.12, 0.35, 0]} args={[0.15, 0.7, 0.15]} castShadow>
        <meshStandardMaterial color="#2C3E50" />
      </Box>
    </group>
  )
}

// Mô hình trẻ em 3D (nhỏ hơn)
function ChildPerson({ position, emotion, withBracelet, ...props }: any) {
  const childRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (childRef.current && emotion === "scared") {
      // Rung lắc khi sợ
      childRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.05
    }
  })

  return (
    <group ref={childRef} position={position} {...props}>
      {/* Đầu */}
      <Sphere position={[0, 1.05, 0]} args={[0.12, 16, 16]} castShadow>
        <meshStandardMaterial color="#FFDAB9" />
      </Sphere>

      {/* Mặt - emoji */}
      {emotion && (
        <Text
          position={[0, 1.05, 0.13]}
          fontSize={0.08}
          color="#000000"
        >
          {emotion === "happy" ? "😊" : emotion === "scared" ? "😢" : emotion === "crying" ? "😭" : "😰"}
        </Text>
      )}

      {/* Thân */}
      <Box position={[0, 0.65, 0]} args={[0.32, 0.55, 0.2]} castShadow>
        <meshStandardMaterial color="#FF69B4" />
      </Box>

      {/* Tay trái */}
      <Box position={[-0.22, 0.7, 0]} args={[0.1, 0.45, 0.1]} rotation={[0, 0, 0.4]} castShadow>
        <meshStandardMaterial color="#FFB6C1" />
      </Box>

      {/* Tay phải */}
      <Box position={[0.22, 0.7, 0]} args={[0.1, 0.45, 0.1]} rotation={[0, 0, -0.4]} castShadow>
        <meshStandardMaterial color="#FFB6C1" />
      </Box>

      {/* Vòng tay GPS */}
      {withBracelet && (
        <group>
          <Sphere position={[0.22, 0.75, 0]} args={[0.08, 16, 16]}>
            <meshStandardMaterial
              color="#4169E1"
              emissive="#00BFFF"
              emissiveIntensity={2}
              metalness={0.8}
            />
          </Sphere>

          {/* Sóng GPS */}
          {[1, 2, 3].map((i) => (
            <mesh
              key={`gps-${i}`}
              position={[0.22, 0.75, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.1 * i, 0.1 * i + 0.05, 16]} />
              <meshBasicMaterial
                color="#00BFFF"
                transparent
                opacity={0.3 / i}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Chân trái */}
      <Box position={[-0.1, 0.25, 0]} args={[0.12, 0.5, 0.12]} castShadow>
        <meshStandardMaterial color="#4169E1" />
      </Box>

      {/* Chân phải */}
      <Box position={[0.1, 0.25, 0]} args={[0.12, 0.5, 0.12]} castShadow>
        <meshStandardMaterial color="#4169E1" />
      </Box>
    </group>
  )
}

// Mô hình tòa nhà bối cảnh
function Building({ position, scale = [4, 15, 4], color = "#2c3e50" }: any) {
  return (
    <group position={position}>
      <Box args={scale} castShadow receiveShadow>
        <meshStandardMaterial color={color} />
      </Box>
      {/* Cửa sổ */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Box
          key={i}
          position={[0, (i - 3.5) * (scale[1] / 10), scale[2] / 2 + 0.05]}
          args={[scale[0] * 0.7, scale[1] / 20, 0.1]}
        >
          <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.5} />
        </Box>
      ))}
    </group>
  )
}

// Mô hình đứa trẻ đang khóc (GLB)
function CryingChild({ position, ...props }: any) {
  const { scene, animations } = useGLTF("/models/crying_child_rig.glb")
  const { actions } = useAnimations(animations, scene)

  useEffect(() => {
    scene.traverse((child: any) => {
      if ((child as any).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (actions) {
      const animName = Object.keys(actions)[0]
      if (animName && actions[animName]) {
        actions[animName].reset().fadeIn(0.5).play()
      }
    }
  }, [scene, actions])

  return (
    <primitive
      object={scene}
      position={position}
      scale={0.5} // Thường GLB từ Mixamo/Blender cần scale lại
      rotation={[0, 0, 0]}
      dispose={null}
      {...props}
    />
  )
}

// Mô hình đứa trẻ sợ hãi (FBX)
function TerrifiedChild({ position, ...props }: any) {
  const fbx = useFBX("/models/Terrified.fbx")
  const { actions } = useAnimations(fbx.animations, fbx)

  useEffect(() => {
    fbx.traverse((child: any) => {
      if ((child as any).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (actions) {
      const animName = Object.keys(actions)[0]
      if (animName && actions[animName]) {
        actions[animName].reset().fadeIn(0.5).play()
      }
    }
  }, [fbx, actions])

  return (
    <primitive
      object={fbx}
      position={position}
      scale={0.007} // Điều chỉnh scale cho FBX
      rotation={[0, 0, 0]}
      dispose={null}
      {...props}
    />
  )
}

// Mô hình đứa trẻ đang chạy (FBX)
function RunningChild({ position, ...props }: any) {
  const fbx = useFBX("/models/Running.fbx")
  const { actions } = useAnimations(fbx.animations, fbx)

  useEffect(() => {
    fbx.traverse((child: any) => {
      if ((child as any).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (actions) {
      const animName = Object.keys(actions)[0]
      if (animName && actions[animName]) {
        actions[animName].reset().fadeIn(0.5).play()
      }
    }
  }, [fbx, actions])

  return (
    <primitive
      object={fbx}
      position={position}
      scale={0.007}
      rotation={[0, 0, 0]}
      dispose={null}
      {...props}
    />
  )
}

// Mô hình đứa trẻ đang vùng vẫy dưới nước (FBX)
function TreadingWaterChild({ position, ...props }: any) {
  const fbx = useFBX("/models/Treading Water.fbx")
  const { actions } = useAnimations(fbx.animations, fbx)

  useEffect(() => {
    fbx.traverse((child: any) => {
      if ((child as any).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (actions) {
      const animName = Object.keys(actions)[0]
      if (animName && actions[animName]) {
        actions[animName].reset().fadeIn(0.5).play()
      }
    }
  }, [fbx, actions])

  return (
    <primitive
      object={fbx}
      position={position}
      scale={0.007}
      rotation={[0, 0, 0]}
      dispose={null}
      {...props}
    />
  )
}

// Mô hình đứa trẻ vui mừng (FBX)
function CheeringChild({ position, ...props }: any) {
  const fbx = useFBX("/models/Cheering.fbx")
  const { actions } = useAnimations(fbx.animations, fbx)

  useEffect(() => {
    fbx.traverse((child: any) => {
      if ((child as any).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    if (actions) {
      const animName = Object.keys(actions)[0]
      if (animName && actions[animName]) {
        actions[animName].reset().fadeIn(0.5).play()
      }
    }
  }, [fbx, actions])

  return (
    <primitive
      object={fbx}
      position={position}
      scale={0.007}
      rotation={[0, 0, 0]}
      dispose={null}
      {...props}
    />
  )
}

// Scene 1: Bị lạc trong đám đông đô thị
function UrbanCrowdScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && isActive) {
      // Nhẹ nhàng xoay để tạo cảm giác động
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      <Environment preset="city" />

      {/* Những tòa nhà bối cảnh xung quanh */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = 15 + Math.random() * 15

        return (
          <Building
            key={`building-${i}`}
            position={[x, height / 2, z]}
            scale={[6, height, 6]}
            color={i % 3 === 0 ? "#2c3e50" : i % 3 === 1 ? "#34495e" : "#535c68"}
          />
        )
      })}

      {/* Đám đông humanoid bao quanh */}
      {Array.from({ length: 30 }).map((_, i) => {
        const seed = i * 437
        const angle = (i / 30) * Math.PI * 2
        const radius = 5 + (Math.sin(seed) * 2)
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        // Xóa những humanoid che model (ở quá gần camera - camera z là 4)
        if (z > 3) return null

        const colors = ["#4169E1", "#8B4513", "#2F4F4F", "#696969", "#556B2F", "#1e272e"]

        return (
          <AdultPerson
            key={`adult-${i}`}
            position={[x, 0, z]}
            color={colors[i % colors.length]}
            rotation={[0, -angle + Math.PI, 0]} // Hướng mặt vào tâm
          />
        )
      })}

      {/* Đứa trẻ đang khóc hoảng loạn ở giữa */}
      <Suspense fallback={null}>
        <CryingChild position={[0, 0, 0]} scale={0.4} />
      </Suspense>

      {/* Icon giọt nước mắt / hoảng sợ */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.5}
        color="#4169E1"
      >
        💧
      </Text>

      {/* Mặt đất đường phố */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>

      {/* Vạch kẻ đường trang trí */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Box
          key={`stripe-${i}`}
          position={[0, 0, -20 + i * 5]}
          args={[0.2, 0.02, 2]}
        >
          <meshBasicMaterial color="white" transparent opacity={0.3} />
        </Box>
      ))}
    </group>
  )
}

// Scene 2: Nguy hiểm từ người lạ
function StrangerDangerScene({ isActive }: { isActive: boolean }) {
  const strangerRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (strangerRef.current && isActive) {
      const distance = 3 - Math.min(state.clock.elapsedTime * 0.3, 2)
      strangerRef.current.position.z = -distance
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FF0000" />

      {/* Đứa trẻ - sợ hãi */}
      <Suspense fallback={null}>
        <TerrifiedChild position={[0, 0, 0]} />
      </Suspense>

      {/* Người lạ đáng sợ - tối màu */}
      <group ref={strangerRef} position={[0, 0, -3]}>
        {/* Đầu */}
        <Sphere position={[0, 1.6, 0]} args={[0.15, 16, 16]} castShadow>
          <meshStandardMaterial color="#2C1810" emissive="#8B0000" emissiveIntensity={0.3} />
        </Sphere>

        {/* Mặt nạ/mặt đáng sợ */}
        <Text position={[0, 1.6, 0.16]} fontSize={0.12} color="#FF0000">
          😈
        </Text>

        {/* Thân - áo đen */}
        <Box position={[0, 1, 0]} args={[0.5, 0.9, 0.3]} castShadow>
          <meshStandardMaterial color="#000000" emissive="#8B0000" emissiveIntensity={0.3} />
        </Box>

        {/* Tay chìa ra - cố bắt */}
        <Box position={[-0.35, 1, 0.3]} args={[0.15, 0.7, 0.15]} rotation={[0.5, 0, 0.5]} castShadow>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>

        <Box position={[0.35, 1, 0.3]} args={[0.15, 0.7, 0.15]} rotation={[0.5, 0, -0.5]} castShadow>
          <meshStandardMaterial color="#1a1a1a" />
        </Box>

        {/* Chân */}
        <Box position={[-0.15, 0.35, 0]} args={[0.18, 0.7, 0.18]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Box>
        <Box position={[0.15, 0.35, 0]} args={[0.18, 0.7, 0.18]} castShadow>
          <meshStandardMaterial color="#000000" />
        </Box>

        {/* Cảnh báo */}
        <Text position={[0, 2.2, 0]} fontSize={0.4} color="#FF0000">
          ⚠️
        </Text>
      </group>

      {/* Icon sợ hãi lớn */}
      <Text position={[0, 1.8, 0.5]} fontSize={0.5} color="#FFFF00">
        😱
      </Text>

      {/* Bóng tối */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        return (
          <Sphere key={i} position={[x, 1, z]} args={[0.5, 16, 16]}>
            <meshStandardMaterial color="#1a1a1a" opacity={0.6} transparent />
          </Sphere>
        )
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}

// Scene 3: Nguy hiểm giao thông
function TrafficDangerScene({ isActive }: { isActive: boolean }) {
  const carsRef = useRef<THREE.Group[]>([])
  const childRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isActive) {
      // Di chuyển xe hơi ở 2 làn đường ngược chiều
      carsRef.current.forEach((car, i) => {
        if (car) {
          const laneOffset = i % 2 === 0 ? -3.5 : 3.5
          const direction = i % 2 === 0 ? 1 : -1
          const speed = 12 + (i * 2)
          const startX = direction === 1 ? -25 : 25

          car.position.x = startX + direction * ((state.clock.elapsedTime * speed + i * 8) % 50)
          car.position.z = laneOffset
        }
      })

      // Đứa trẻ băng qua đường (di chuyển theo trục Z)
      if (childRef.current) {
        const crossingCycle = 6 // 6 giây một vòng
        const time = (state.clock.elapsedTime % crossingCycle)
        if (time < 4) {
          // Đang băng qua đường
          childRef.current.position.z = 8 - (time / 4) * 16
          childRef.current.rotation.y = Math.PI // Hướng mặt về phía trước
        } else {
          // Chờ một chút rồi quay lại vị trí bắt đầu
          childRef.current.position.z = 8
        }
      }
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />

      {/* Đứa trẻ đang băng qua đường */}
      <Suspense fallback={null}>
        <group ref={childRef} position={[0, 0, 8]}>
          <RunningChild />
        </group>
      </Suspense>

      {/* Icon hoảng sợ */}
      <Text position={[0, 2.5, 0]} fontSize={0.5} color="#FF0000">
        😰
      </Text>

      {/* Đường phố 2 làn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Vạch kẻ phân làn (đứt đoạn) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Box
          key={`lane-divider-${i}`}
          position={[-25 + i * 2.5, 0.01, 0]}
          args={[1, 0.05, 0.2]}
        >
          <meshBasicMaterial color="#f1c40f" />
        </Box>
      ))}

      {/* Vạch kẻ lề đường */}
      <Box position={[0, 0.01, 7.8]} args={[100, 0.05, 0.3]}>
        <meshBasicMaterial color="#ecf0f1" />
      </Box>
      <Box position={[0, 0.01, -7.8]} args={[100, 0.05, 0.3]}>
        <meshBasicMaterial color="#ecf0f1" />
      </Box>

      {/* Xe hơi chạy nhanh */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group
          key={`car-${i}`}
          ref={(el) => {
            if (el) carsRef.current[i] = el
          }}
          position={[0, 0, 0]}
        >
          {/* Thân xe */}
          <Box position={[0, 0.45, 0]} args={[2.5, 0.8, 1.4]} castShadow>
            <meshStandardMaterial color={i % 2 === 0 ? "#e74c3c" : "#3498db"} metalness={0.6} roughness={0.3} />
          </Box>
          {/* Nóc xe */}
          <Box position={[0.2, 1, 0]} args={[1.2, 0.5, 1.2]} castShadow>
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
          </Box>
          {/* Đèn xe */}
          <Box position={[1.2, 0.5, 0.4]} args={[0.1, 0.2, 0.3]}>
            <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={2} />
          </Box>
          <Box position={[1.2, 0.5, -0.4]} args={[0.1, 0.2, 0.3]}>
            <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={2} />
          </Box>

          {/* Bánh xe */}
          {[-0.8, 0.8].map(x => [-0.6, 0.6].map(z => (
            <mesh key={`${x}-${z}`} position={[x, 0.2, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          )))}
        </group>
      ))}

      {/* Vỉa hè 2 bên */}
      <Box position={[0, 0.1, 10]} args={[100, 0.3, 4]} receiveShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
      <Box position={[0, 0.1, -10]} args={[100, 0.3, 4]} receiveShadow>
        <meshStandardMaterial color="#7f8c8d" />
      </Box>
    </group>
  )
}

// Scene 4: Nguy hiểm gần nước
function WaterDangerScene({ isActive }: { isActive: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)
  const childRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isActive) {
      if (waterRef.current) {
        waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
      if (childRef.current) {
        // Trẻ đứng không vững
        childRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1
      }
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />

      {/* Bờ sông */}
      <Box position={[0, 0.1, 5]} args={[30, 0.2, 8]}>
        <meshStandardMaterial color="#8B7355" />
      </Box>

      {/* Cỏ */}
      <Box position={[0, 0.05, 8]} args={[30, 0.1, 4]}>
        <meshStandardMaterial color="#90EE90" />
      </Box>

      {/* Mặt nước nguy hiểm */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -3]}
      >
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.7}
          emissive="#0066CC"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Đứa trẻ vùng vẫy dưới nước - drowning effect */}
      <group ref={childRef}>
        <Suspense fallback={null}>
          <TreadingWaterChild position={[0, -0.6, -3]} />
        </Suspense>
      </group>

      {/* Cảnh báo */}
      <Text position={[0, 2, 2]} fontSize={0.6} color="#FF0000">
        ⚠️ NGUY HIỂM
      </Text>

      {/* Sóng nước */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={`wave-${i}`}
          position={[-10 + i * 2, 0.2, -3 + Math.sin(i) * 2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.3, 0.5, 16]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// Scene 5: Giải pháp - GPS cứu hộ
function RescueScene({ isActive }: { isActive: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const phoneRef = useRef<THREE.Group>(null)
  const parentsRef = useRef<THREE.Group[]>([])

  useFrame((state) => {
    if (isActive) {
      if (lightRef.current) {
        lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5
      }
      if (phoneRef.current) {
        phoneRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
      // Ba mẹ chạy lại gần
      parentsRef.current.forEach((parent, i) => {
        if (parent) {
          const targetZ = -2
          parent.position.z += (targetZ - parent.position.z) * 0.02
        }
      })
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={1} />
      <pointLight ref={lightRef} position={[0, 5, 0]} intensity={2} color="#FFD700" />
      <Sky sunPosition={[100, 20, 100]} />

      {/* Đứa trẻ - được tìm thấy - AN TOÀN & VUI MỪNG */}
      <Suspense fallback={null}>
        <CheeringChild position={[0, 0, 0]} />
      </Suspense>

      {/* Ba (bên trái) */}
      <group
        ref={(el) => {
          if (el) parentsRef.current[0] = el
        }}
        position={[-2, 0, -4]}
      >
        <AdultPerson position={[0, 0, 0]} color="#4169E1" />
        <Text position={[0, 2, 0]} fontSize={0.4}>👨</Text>
      </group>

      {/* Mẹ (bên phải) */}
      <group
        ref={(el) => {
          if (el) parentsRef.current[1] = el
        }}
        position={[2, 0, -4]}
      >
        <AdultPerson position={[0, 0, 0]} color="#FF1493" />
        <Text position={[0, 2, 0]} fontSize={0.4}>👩</Text>
      </group>

      {/* Điện thoại hiển thị vị trí */}
      <group ref={phoneRef} position={[0, 1.5, -2]}>
        <Box args={[0.8, 1.2, 0.1]}>
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </Box>
        <Box position={[0, 0, 0.06]} args={[0.7, 1.1, 0.01]}>
          <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={1} />
        </Box>
        <Text position={[0, 0.2, 0.1]} fontSize={0.12} color="#000000">
          📍
        </Text>
        <Text position={[0, 0, 0.1]} fontSize={0.08} color="#000000">
          Đã tìm thấy!
        </Text>
      </group>

      {/* Trái tim bay */}
      <Text position={[0, 2.5, 0]} fontSize={0.8} color="#FF69B4">
        ❤️
      </Text>

      {/* Hiệu ứng sáng xung quanh */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        return (
          <pointLight
            key={`light-${i}`}
            position={[x, 1, z]}
            intensity={0.5}
            color="#FFD700"
            distance={2}
          />
        )
      })}

      {/* Mặt đất sáng - an toàn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2ecc71" roughness={0.6} />
      </mesh>
    </group>
  )
}

// Camera Controller
function CameraController({ scene }: { scene: number }) {
  const { camera } = useThree()

  useFrame(() => {
    const targetPositions = [
      { x: 0, y: 1.2, z: 4 },
      { x: 0, y: 0.8, z: 2.5 },
      { x: 0, y: 4, z: 10 }, // Tăng y lên cao hơn cho bối cảnh giao thông
      { x: 0, y: 1, z: 5 },
      { x: 0, y: 2.5, z: 8 },
    ]

    const target = targetPositions[scene] || targetPositions[0]

    camera.position.lerp(
      new THREE.Vector3(target.x, target.y, target.z),
      0.05
    )
    camera.lookAt(0, 0.8, 0)
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

  const audioContextRef = useRef<AudioContext | null>(null)
  const currentSoundRef = useRef<OscillatorNode | null>(null)

  const scenes = useMemo(() => [
    {
      title: "Bị lạc trong đám đông",
      description: "Con quay lưng 30 giây... và không còn thấy ba mẹ nữa. Xung quanh toàn người lạ, cao lớn, đáng sợ.",
      emotion: "😢",
      danger: "Mất phương hướng",
      duration: 5000,
      sound: { frequency: 330, type: "triangle" as OscillatorType },
    },
    {
      title: "Người lạ tiếp cận",
      description: "Một người lạ chậm rãi tiến lại gần, cố gắng nói chuyện và dẫn con đi... CỰC KỲ NGUY HIỂM!",
      emotion: "😱",
      danger: "Nguy cơ bắt cóc",
      duration: 6000,
      sound: { frequency: 220, type: "sawtooth" as OscillatorType },
    },
    {
      title: "Lạc ra đường lớn",
      description: "Hoảng loạn chạy tìm ba mẹ, con lao ra đường đông xe cộ. Xe hơi phóng nhanh, còi inh ỏi...",
      emotion: "😰",
      danger: "Nguy cơ tai nạn giao thông",
      duration: 5000,
      sound: { frequency: 180, type: "square" as OscillatorType },
    },
    {
      title: "Gần sông, hồ nguy hiểm",
      description: "Tìm ba mẹ lang thang đến gần bờ sông. Nước sâu, trơn trượt, chỉ cần một bước sai...",
      emotion: "😨",
      danger: "Nguy cơ đuối nước",
      duration: 5000,
      sound: { frequency: 200, type: "sine" as OscillatorType },
    },
    {
      title: "✨ Vòng tay GPS cứu nguy!",
      description: "Nhờ ARTEMIS GPS, ba mẹ biết CHÍNH XÁC vị trí con và tìm thấy ngay! An toàn trở về!",
      emotion: "❤️",
      danger: "ĐÃ AN TOÀN",
      duration: 7000,
      sound: { frequency: 523, type: "sine" as OscillatorType },
    },
  ], [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || !soundEnabled || !audioContextRef.current) return

    if (currentSoundRef.current) {
      currentSoundRef.current.stop()
      currentSoundRef.current = null
    }

    const sceneData = scenes[scene]
    const audioContext = audioContextRef.current

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = sceneData.sound.type
    oscillator.frequency.value = sceneData.sound.frequency

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(
      scene === scenes.length - 1 ? 0.15 : 0.08,
      audioContext.currentTime + 0.5
    )
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + (sceneData.duration / 1000) - 0.5)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + (sceneData.duration / 1000))

    currentSoundRef.current = oscillator

    if (scene >= 1 && scene <= 3) {
      const playAlarm = () => {
        if (!soundEnabled || !audioContext) return

        const alarm = audioContext.createOscillator()
        const alarmGain = audioContext.createGain()

        alarm.type = "square"
        alarm.frequency.value = scene === 1 ? 440 : scene === 2 ? 880 : 660

        alarmGain.gain.setValueAtTime(0.1, audioContext.currentTime)
        alarmGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

        alarm.connect(alarmGain)
        alarmGain.connect(audioContext.destination)

        alarm.start()
        alarm.stop(audioContext.currentTime + 0.2)
      }

      const alarmInterval = setInterval(playAlarm, 1000)
      return () => clearInterval(alarmInterval)
    }

    if (scene === 4) {
      const playChime = (delay: number, freq: number) => {
        setTimeout(() => {
          if (!soundEnabled || !audioContext) return
          const chime = audioContext.createOscillator()
          const chimeGain = audioContext.createGain()

          chime.type = "sine"
          chime.frequency.value = freq

          chimeGain.gain.setValueAtTime(0.15, audioContext.currentTime)
          chimeGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

          chime.connect(chimeGain)
          chimeGain.connect(audioContext.destination)

          chime.start()
          chime.stop(audioContext.currentTime + 0.5)
        }, delay)
      }

      playChime(500, 523)
      playChime(700, 659)
      playChime(900, 784)
      playChime(1100, 1047)
    }

  }, [scene, isPlaying, soundEnabled, scenes])

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

  const handleNext = () => {
    if (scene < scenes.length - 1) {
      setScene(prev => prev + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const handlePrev = () => {
    if (scene > 0) {
      setScene(prev => prev - 1)
    }
  }

  return (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas shadows>
        <CameraController scene={scene} />

        <ambientLight intensity={scene === 4 ? 0.8 : scene >= 1 && scene <= 3 ? 0.3 : 0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={scene === 4 ? 1 : 0.5}
          castShadow
        />

        <Suspense fallback={null}>
          <UrbanCrowdScene isActive={scene === 0} />
          <StrangerDangerScene isActive={scene === 1} />
          <TrafficDangerScene isActive={scene === 2} />
          <WaterDangerScene isActive={scene === 3} />
          <RescueScene isActive={scene === 4} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 pointer-events-none">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 pointer-events-auto z-50 bg-black/70 hover:bg-black/90 text-white border border-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        <AnimatePresence mode="wait">
          {isPlaying && (
            <motion.div
              key={scene}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent"
            >
              <Card className={`p-6 border-2 ${scene === 4 ? 'bg-green-500/20 border-green-500/50 backdrop-blur-lg' :
                scene >= 1 && scene <= 3 ? 'bg-red-500/20 border-red-500/50 backdrop-blur-lg' :
                  'bg-black/50 border-white/10 backdrop-blur-lg'
                }`}>
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{scenes[scene].emotion}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">
                        {scenes[scene].title}
                      </h3>
                      {scene >= 1 && scene <= 3 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/30 border border-red-500 rounded-full">
                          <AlertTriangle className="w-4 h-4 text-red-300" />
                          <span className="text-sm font-semibold text-red-200">{scenes[scene].danger}</span>
                        </div>
                      )}
                      {scene === 4 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/30 border border-green-500 rounded-full">
                          <span className="text-sm font-semibold text-green-200">✓ {scenes[scene].danger}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/90 text-base leading-relaxed">
                      {scenes[scene].description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${scene === 4 ? 'bg-green-500' : scene >= 1 && scene <= 3 ? 'bg-red-500' : 'bg-primary'}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: scenes[scene].duration / 1000, ease: "linear" }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <Card className="p-10 max-w-2xl mx-4 text-center bg-gradient-to-br from-gray-900 to-black border-2 border-primary/30">
              <div className="text-7xl mb-6">⚠️</div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                {scene === 0 ? "Mô phỏng thực tế ảo 3D" : "Hoàn thành mô phỏng"}
              </h2>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                {scene === 0 ? (
                  <>
                    Trải nghiệm <span className="text-red-400 font-bold">các tình huống nguy hiểm</span> khi trẻ bị lạc:
                    <br />
                    <span className="text-yellow-300">Bắt cóc • Tai nạn giao thông • Đuối nước</span>
                    <br />
                    <span className="text-sm mt-2 block text-white/60">⚠️ Nội dung có thể gây shock - Chỉ dành cho phụ huynh</span>
                  </>
                ) : (
                  <>
                    Với vòng tay <span className="text-primary font-bold">ARTEMIS GPS</span>,
                    những nguy hiểm này có thể <span className="text-green-400 font-bold">NGĂN CHẶN HOÀN TOÀN</span>!
                  </>
                )}
              </p>

              <div className="flex gap-3 justify-center pointer-events-auto">
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="gap-2 text-lg px-8 h-14"
                >
                  <Play className="h-5 w-5" />
                  {scene === 0 ? "Bắt đầu trải nghiệm" : "Xem lại"}
                </Button>

                {scene > 0 && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleReset}
                    className="gap-2 text-lg px-8 h-14"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Về đầu
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="mt-6 gap-2 pointer-events-auto"
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

        {!isPlaying && scene === scenes.length - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-md"
          >
            <Card className="p-10 max-w-2xl mx-4 text-center bg-gradient-to-br from-green-900/50 to-blue-900/50 border-2 border-green-500/50">
              <div className="text-7xl mb-6">✨</div>
              <h2 className="text-4xl font-bold mb-4 text-white">
                Bảo vệ con, An tâm mỗi ngày
              </h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Những nguy hiểm trên CÓ THẬT. Hàng ngày có hàng trăm trẻ em gặp nạn vì bị lạc.
                <br />
                <span className="text-green-300 font-semibold">
                  Với ARTEMIS GPS, bạn luôn biết con mình ở đâu và giữ con an toàn!
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
                <Button size="lg" className="text-lg h-14 px-8" asChild>
                  <a href="/products">
                    Bảo vệ con ngay
                  </a>
                </Button>
                <Button size="lg" variant="outline" onClick={handleReset} className="text-lg h-14 px-8 border-white/30 hover:bg-white/10">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Xem lại
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {isPlaying && (
        <div className="absolute top-4 left-4 flex gap-2">
          {scenes.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-all ${i === scene
                ? i === 4 ? "bg-green-500" : i >= 1 && i <= 3 ? "bg-red-500" : "bg-primary"
                : i < scene
                  ? "bg-white/50"
                  : "bg-white/20"
                }`}
            />
          ))}
        </div>
      )}

      {/* Nút Previous/Next điều hướng tay */}
      {isPlaying && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={scene === 0}
            className={`h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/10 pointer-events-auto transition-all ${scene === 0 ? "opacity-0 invisible" : "opacity-100"
              }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white border border-white/10 pointer-events-auto transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
