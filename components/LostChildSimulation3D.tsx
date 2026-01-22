"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, useAnimations, useFBX, OrbitControls, PerspectiveCamera, Text, Box, Sphere, Environment, Sky, Html } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, VolumeX, Play, RotateCcw, X, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import * as THREE from "three"
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'

// Mô hình GLB chung cho Humanoid - Sửa lỗi đứng im (T-pose)
function CryingChildGLB({ scale = 1, animationName, ...props }: any) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/crying_child_rig.glb")

  // Sử dụng SkeletonUtils để clone model có xương (rigged)
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    console.log("Available animations for child model:", names);
    if (actions && names.length > 0) {
      // Tìm kiếm animation có tên chứa từ khóa
      const targetName = animationName?.toLowerCase() || "";
      const actualName = names.find(n => n.toLowerCase().includes(targetName)) || names[0];

      if (actualName && actions[actualName]) {
        actions[actualName].reset().fadeIn(0.5).play();
      }
    }
  }, [actions, names, animationName])

  return (
    <group ref={group} {...props}>
      <primitive
        object={clone}
        scale={scale}
        castShadow
      />
    </group>
  )
}

// Mô hình người lớn 3D
function AdultPerson({ position, color, scale = 1, ...props }: any) {
  return (
    <group position={position} scale={scale} {...props}>
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

// Mô hình đứa trẻ chạy (FBX)
function RunningChildFBX({ position, ...props }: any) {
  const fbx = useFBX("/models/Running.fbx")
  const group = useRef<THREE.Group>(null)

  // Clone to avoid sharing material/state if multiple instances
  const clone = useMemo(() => SkeletonUtils.clone(fbx), [fbx])
  const { actions } = useAnimations(fbx.animations, group)

  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions)
      if (actionNames.length > 0) {
        actions[actionNames[0]]?.play()
      }
    }
  }, [actions])

  return (
    <group ref={group} position={position} {...props}>
      <primitive object={clone} scale={0.007} castShadow />
    </group>
  )
}

// Mô hình đứa trẻ sợ hãi (FBX)
function TerrifiedChildFBX({ position, ...props }: any) {
  const fbx = useFBX("/models/Terrified.fbx")
  const group = useRef<THREE.Group>(null)
  const clone = useMemo(() => SkeletonUtils.clone(fbx), [fbx])
  const { actions } = useAnimations(fbx.animations, group)

  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions)
      if (actionNames.length > 0) {
        actions[actionNames[0]]?.play()
      }
    }
  }, [actions])

  return <primitive ref={group} object={clone} position={position} scale={0.015} {...props} />
}

// Mô hình đứa trẻ vui mừng (FBX)
function CheeringChildFBX({ position, ...props }: any) {
  const fbx = useFBX("/models/Cheering.fbx")
  const group = useRef<THREE.Group>(null)
  const clone = useMemo(() => SkeletonUtils.clone(fbx), [fbx])
  const { actions } = useAnimations(fbx.animations, group)

  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions)
      if (actionNames.length > 0) {
        actions[actionNames[0]]?.play()
      }
    }
  }, [actions])

  return <primitive ref={group} object={clone} position={position} scale={0.015} {...props} />
}

// Mô hình vòng tay (GLB)
function BraceletModel({ position, ...props }: any) {
  const { scene } = useGLTF("/models/bracelet-bunny-lavendar.glb")
  const clone = useMemo(() => scene.clone(), [scene])

  return <primitive object={clone} position={position} scale={0.5} {...props} />
}

// Mô hình đứa trẻ đang vùng vẫy dưới nước (FBX)
function TreadingWaterChildFBX({ position, ...props }: any) {
  const fbx = useFBX("/models/TreadingWater.fbx")
  const group = useRef<THREE.Group>(null)
  const clone = useMemo(() => SkeletonUtils.clone(fbx), [fbx])
  const { actions } = useAnimations(fbx.animations, group)

  useEffect(() => {
    if (actions) {
      const actionNames = Object.keys(actions)
      if (actionNames.length > 0) {
        actions[actionNames[0]]?.play()
      }
    }
  }, [actions])

  return <primitive ref={group} object={clone} position={position} scale={0.015} {...props} />
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

// Special GLB versions for Scene 1
function GLBChild({ position, emotion, withBracelet, ...props }: any) {
  return (
    <group position={position} {...props}>
      <CryingChildGLB scale={0.6} animationName="Crying" />
      {emotion && (
        <Text position={[0, 1.2, 0.2]} fontSize={0.2} color="#000000">
          {emotion === "happy" ? "😊" : emotion === "scared" ? "😢" : emotion === "crying" ? "😭" : "😰"}
        </Text>
      )}
      {withBracelet && (
        <group position={[0.15, 0.5, 0]}>
          <Sphere args={[0.06, 16, 16]}>
            <meshStandardMaterial color="#4169E1" emissive="#00BFFF" emissiveIntensity={2} metalness={0.8} />
          </Sphere>
          {[1, 2, 3].map((i) => (
            <mesh key={`gps-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08 * i, 0.08 * i + 0.04, 16]} />
              <meshBasicMaterial color="#00BFFF" transparent opacity={0.3 / i} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// Thành phần tòa nhà để tạo thành phố
function Building({ position, args, color }: any) {
  return (
    <group position={position}>
      <Box args={args} castShadow receiveShadow>
        <meshStandardMaterial color={color || "#2C3E50"} roughness={0.2} metalness={0.8} />
      </Box>
      {/* Thêm các ô cửa sổ phát sáng */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Box
          key={i}
          position={[0, (i * 0.5) - (args[1] / 4), args[2] / 2 + 0.01]}
          args={[args[0] * 0.6, 0.1, 0.02]}
        >
          <meshStandardMaterial emissive="#F1C40F" emissiveIntensity={0.5} color="#F1C40F" />
        </Box>
      ))}
    </group>
  )
}

// Scene 1: Bị lạc trong thành phố / siêu thị đông người
function SupermarketScene({ isActive }: { isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  if (!isActive) return null

  return (
    <group ref={groupRef}>
      <Environment preset="city" />

      {/* Tòa nhà xung quanh (City Background) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 8 + Math.random() * 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = 4 + Math.random() * 8
        const width = 1.5 + Math.random() * 1.5

        return (
          <Building
            key={i}
            position={[x, height / 2, z]}
            args={[width, height, width]}
            color={i % 2 === 0 ? "#2C3E50" : "#34495E"}
          />
        )
      })}

      {/* Đám đông người lớn (Dùng hình khối cơ bản để đỡ rối) */}
      {Array.from({ length: 20 }).map((_, i) => {
        // Tránh đặt người ở ngay trước mặt camera (z > 0 và x gần 0)
        let angle = (i / 20) * Math.PI * 2
        let radius = 5 + Math.random() * 5
        let x = Math.cos(angle) * radius
        let z = Math.sin(angle) * radius

        // Nếu người này nằm trong khoảng nhìn từ camera (z:4) đến tâm (0,0,0)
        // Ta đẩy họ sang hai bên hoặc ra phía sau
        if (z > 0 && Math.abs(x) < 2.5) {
          x = x > 0 ? x + 2 : x - 2
        }

        return (
          <AdultPerson
            key={`adult-${i}`}
            position={[x, 0, z]}
            color={i % 2 === 0 ? "#4D4D4D" : "#333333"}
            scale={1.3}
          />
        )
      })}

      {/* Đứa trẻ ở giữa - Quay mặt về phía camera */}
      <GLBChild position={[0, 0, 0]} emotion="scared" rotation={[0, 0, 0]} />

      {/* Mặt đất */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#E0E0E0" />
      </mesh>
    </group>
  )
}

// Scene 2: Nguy hiểm giao thông (Đã đổi tên và logic)
function StrangerDangerScene({ isActive }: { isActive: boolean }) {
  const carsRef = useRef<THREE.Group[]>([])
  const [childPos, setChildPos] = useState<[number, number, number]>([0, 0, -8])

  useFrame((state) => {
    if (isActive) {
      // Xe chạy ngang
      carsRef.current.forEach((car, i) => {
        if (car) {
          car.position.x = -15 + ((state.clock.elapsedTime * 6 + i * 4) % 30)
        }
      })

      // Đứa trẻ chạy dọc (Z-axis) - Loop chạy qua đường
      const z = -8 + (state.clock.elapsedTime * 2) % 16
      setChildPos([0, 0, z])
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />

      {/* Đứa trẻ chạy băng qua đường - Chống nghiêng và chạy thẳng theo trục đường */}
      <RunningChildFBX position={childPos} rotation={[0, 0, 0]} />

      {/* Đường phố */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 12]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Vạch kẻ đường (Zebra Crossing) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Box
          key={`stripe-${i}`}
          position={[0, 0, -5.5 + i * 1]}
          args={[3, 0.02, 0.4]}
        >
          <meshStandardMaterial color="#FFFFFF" />
        </Box>
      ))}

      {/* Xe cộ */}
      {Array.from({ length: 4 }).map((_, i) => (
        <group
          key={`car-${i}`}
          ref={(el) => { if (el) carsRef.current[i] = el }}
          position={[-15 + i * 8, 0, i % 2 === 0 ? -3 : 3]}
        >
          <Box position={[0, 0.4, 0]} args={[2, 0.8, 1.2]} castShadow>
            <meshStandardMaterial color={i % 2 === 0 ? "#E74C3C" : "#F1C40F"} metalness={0.8} roughness={0.2} />
          </Box>
          <Box position={[0.3, 0.9, 0]} args={[0.8, 0.4, 1]}>
            <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
          </Box>
          {/* Wheels */}
          {[-0.6, 0.6].map(x => [-0.6, 0.6].map(z => (
            <Sphere key={`${x}-${z}`} position={[x, 0.2, z]} args={[0.25, 16, 16]}>
              <meshStandardMaterial color="#111" />
            </Sphere>
          )))}
        </group>
      ))}

      {/* Vỉa hè */}
      <Box position={[0, -0.05, -10]} args={[50, 0.2, 8]}>
        <meshStandardMaterial color="#808080" />
      </Box>
      <Box position={[0, -0.05, 10]} args={[50, 0.2, 8]}>
        <meshStandardMaterial color="#808080" />
      </Box>
    </group>
  )
}


// Scene 3: Người lạ tiếp cận (Stranger Danger)
function StrangerApproachingScene({ isActive }: { isActive: boolean }) {
  const strangerRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isActive && strangerRef.current) {
      // Người lạ tiến lại gần từ phía trước/bên cạnh
      const targetZ = 1.5
      // Reset thời gian theo mỗi vòng lặp 10s để chuyển động mượt mà
      const cycleTime = state.clock.elapsedTime % 10
      const currentZ = 8 - cycleTime * 1.5
      const finalZ = Math.max(targetZ, currentZ)

      strangerRef.current.position.z = finalZ
      // Đặt x sang bên cạnh (x: 2) để không che model đứa trẻ
      strangerRef.current.position.x = 2

      // Lắc nhẹ người lạ để tạo cảm giác đang bước đi
      strangerRef.current.rotation.y = -0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  if (!isActive) return null

  return (
    <group>
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />

      {/* Đứa trẻ sợ hãi - Quay mặt về phía camera */}
      <TerrifiedChildFBX position={[0, 0, 0]} rotation={[0, Math.PI * 0.25, 0]} />

      {/* Người lạ chính (Humanoid đang tiến lại) */}
      <group ref={strangerRef} position={[2, 0, 8]}>
        <AdultPerson position={[0, 0, 0]} color="#1A1A1A" rotation={[0, Math.PI * 1.25, 0]} scale={1.4} />
        {/* Shadow/Aura của người lạ */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Thêm 3 người lớn khác xung quanh - Cao hơn một chút và không che model */}
      <AdultPerson position={[-3, 0, -2]} color="#333" rotation={[0, 0.5, 0]} scale={1.45} />
      <AdultPerson position={[4, 0, 2]} color="#222" rotation={[0, -0.8, 0]} scale={1.42} />
      <AdultPerson position={[-4, 0, 5]} color="#2a2a2a" rotation={[0, 0.3, 0]} scale={1.38} />

      {/* Bối cảnh: Khu phố sáng sủa hơn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Vỉa hè/Tường giả lập thành phố */}
      <Box position={[-5, 2, 0]} args={[1, 4, 40]}>
        <meshStandardMaterial color="#4A4A4A" />
      </Box>
      <Box position={[5, 2, 0]} args={[1, 4, 40]}>
        <meshStandardMaterial color="#4A4A4A" />
      </Box>

      {/* Đèn đường */}
      <pointLight position={[0, 6, 0]} intensity={1} color="#FFFFA0" />
    </group>
  )
}

// Scene 4: Nguy hiểm dưới nước (Drowning/Treading Water)
function WaterDangerScene({ isActive }: { isActive: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isActive && waterRef.current) {
      // Hiệu ứng sóng nhấp nhô
      waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    }
  })

  if (!isActive) return null

  return (
    <group>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      {/* Đứa trẻ đang vùng vẫy dưới nước - Ở bên cạnh đường ven biển */}
      <TreadingWaterChildFBX position={[-15, -0.5, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Mặt biển rộng lớn - Sát viền đường màu xám */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-22, -0.3, 0]}
      >
        <planeGeometry args={[30, 100]} />
        <meshStandardMaterial
          color="#0077BE"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.2}
          emissive="#004488"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Đường ven biển (Coastal Road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[15, 100]} />
        <meshStandardMaterial color="#2C2C2C" roughness={0.8} />
      </mesh>

      {/* Vạch kẻ đường giữa */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`road-line-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, -45 + i * 5]}
        >
          <planeGeometry args={[0.3, 2]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}

      {/* Vỉa hè/Rào chắn bên đường */}
      <Box position={[-7, 0.5, 0]} args={[0.2, 1, 100]}>
        <meshStandardMaterial color="#888888" />
      </Box>



      {/* Cảnh báo - Đặt ngay phía trên đứa trẻ */}
      <Text
        position={[-15, 3, 0.1]}
        fontSize={0.8}
        color="#FF0000"
        outlineWidth={0.05}
        outlineColor="white"
      >
        😰 CỨU CON VỚI!
      </Text>
    </group>
  )
}

// Scene 5: Giải pháp - GPS cứu hộ
function RescueScene({ isActive }: { isActive: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const braceletRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isActive) {
      if (lightRef.current) {
        lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5
      }
      if (braceletRef.current) {
        // Vòng tay xoay và nhấp nhô
        braceletRef.current.rotation.y = state.clock.elapsedTime
        braceletRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      }
    }
  })

  if (!isActive) return null

  return (
    <group>
      <ambientLight intensity={1} />
      <pointLight ref={lightRef} position={[0, 5, 0]} intensity={2} color="#FFD700" />
      <Sky sunPosition={[100, 20, 100]} />

      {/* Đứa trẻ vui mừng - được tìm thấy */}
      <CheeringChildFBX position={[0, 0, 0]} rotation={[0, 0, 0]} />

      {/* Vòng tay GPS - Hiển thị sản phẩm */}
      <group ref={braceletRef} position={[0, 1.5, 1.5]}>
        <BraceletModel position={[0, 0, 0]} />
      </group>

      {/* Trái tim bay xung quanh */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const yOffset = Math.sin(angle * 3) * 0.5

        return (
          <Text
            key={`heart-${i}`}
            position={[x, 2 + yOffset, z]}
            fontSize={0.5}
            color="#FF69B4"
          >
            ❤️
          </Text>
        )
      })}

      {/* Ánh sáng vàng xung quanh */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
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

      {/* Mặt đất */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#90EE90" />
      </mesh>
    </group>
  )
}

// Camera Controller
function CameraController({ scene }: { scene: number }) {
  const { camera } = useThree()

  useFrame(() => {
    const targetPositions = [
      { x: 0, y: 1.2, z: 4 }, // Scene 1
      { x: 6, y: 4, z: 8 }, // Scene 2 - Zoomed in diagonal angle view
      { x: 5, y: 3, z: 6 }, // Scene 3 - Higher diagonal view
      { x: 5, y: 6, z: 8 }, // Scene 4 - Angled view from road to sea
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
      title: "Lạc ra đường lớn nguy hiểm",
      description: "Hoảng loạn chạy tìm ba mẹ, con lao ra đường đông xe cộ. Xe hơi phóng nhanh, còi inh ỏi... CỰC KỲ NGUY HIỂM!",
      emotion: "😱",
      danger: "Nguy cơ tai nạn giao thông",
      duration: 6000,
      sound: { frequency: 220, type: "sawtooth" as OscillatorType },
    },
    {
      title: "Cảnh giác với người lạ",
      description: "Một người lạ mặt đang cố tình tiếp cận và dụ dỗ con. Con đang cảm thấy vô cùng sợ hãi và bối rối.",
      emotion: "�",
      danger: "Nguy cơ bị dụ dỗ/bắt cóc",
      duration: 6000,
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

  const nextScene = () => {
    if (scene < scenes.length - 1) {
      setScene(prev => prev + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const prevScene = () => {
    if (scene > 0) {
      setScene(prev => prev - 1)
    }
  }

  return (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas shadows>
        <Suspense fallback={<Html center><div className="text-white text-xl font-bold animate-pulse">Đang tả mô phỏng... 3D</div></Html>}>
          <CameraController scene={scene} />

          <ambientLight intensity={scene === 4 ? 0.8 : scene >= 1 && scene <= 3 ? 0.3 : 0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={scene === 4 ? 1 : 0.5}
            castShadow
          />

          <SupermarketScene isActive={scene === 0} />
          <StrangerDangerScene isActive={scene === 1} />
          <StrangerApproachingScene isActive={scene === 2} />
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

        {/* Nút Back/Next thủ công */}
        {isPlaying && (
          <>
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 rounded-full pointer-events-auto bg-black/40 hover:bg-black/60 text-white border border-white/10 ${scene === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={prevScene}
              >
                <ChevronLeft className="h-8 w-8 text-white/50 hover:text-white" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full pointer-events-auto bg-black/40 hover:bg-black/60 text-white border border-white/10"
                onClick={nextScene}
              >
                <ChevronRight className="h-8 w-8 text-white/50 hover:text-white" />
              </Button>
            </div>
          </>
        )}

        <AnimatePresence mode="wait">
          {isPlaying && scenes[scene] && (
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
    </div>
  )
}
