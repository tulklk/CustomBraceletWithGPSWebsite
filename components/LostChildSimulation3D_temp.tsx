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
