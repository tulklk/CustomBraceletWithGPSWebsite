'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface Product3DViewerProps {
  modelUrl: string;
  className?: string;
}

function Model({ url }: { url: string }) {
  // useGLTF must be called at top level, not inside try-catch
  const { scene } = useGLTF(url);
  // Scale model up to make it bigger and more visible (2.5x scale)
  return <primitive object={scene} scale={1} />;
}

// Helper function to construct full URL from relative path
function getFullModelUrl(modelUrl: string): string {
  // If already a full URL (http/https), return as is
  if (modelUrl.startsWith('http://') || modelUrl.startsWith('https://')) {
    return modelUrl;
  }

  // If relative path starting with /, append to API_BASE_URL
  if (modelUrl.startsWith('/')) {
    return `${API_BASE_URL}${modelUrl}`;
  }

  // If relative path without leading /, add it
  return `${API_BASE_URL}/${modelUrl}`;
}

// Export preload function for use in parent component
export function preload3DModel(modelUrl: string): void {
  if (!modelUrl) return;

  try {
    const fullUrl = getFullModelUrl(modelUrl);
    // Preload the model using drei's preload function
    useGLTF.preload(fullUrl);
  } catch (error) {
    console.error('Error preloading 3D model:', error);
  }
}

export function Product3DViewer({ modelUrl, className }: Product3DViewerProps) {
  // Construct full URL from modelUrl (relative path from backend)
  // Backend returns: "/uploads/models3d/{guid}.glb"
  // We need: "https://customerbraceletwithgpswebsite-backend.fly.dev/uploads/models3d/{guid}.glb"
  const fullUrl = useMemo(() => {
    if (!modelUrl) return null;
    return getFullModelUrl(modelUrl);
  }, [modelUrl]);

  // Log for debugging
  console.log('Product3DViewer - modelUrl:', modelUrl);
  console.log('Product3DViewer - fullUrl:', fullUrl);

  if (!modelUrl || !fullUrl) {
    return (
      <div className={`w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm sm:text-base">No 3D model available</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Model key={fullUrl} url={fullUrl} />
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={1.2}
            maxDistance={8}
            target={[0, 0, 0]}
          />
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Loading component
export function Product3DViewerLoading() {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center">
      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

