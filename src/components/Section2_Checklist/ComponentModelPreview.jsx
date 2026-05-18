import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URLS = [
  '/models/arduino_uno.glb',
  '/models/infrared_sensor_ir_sensor.glb',
  '/models/l298n_motor_driver.glb',
  '/models/bo_battery_operated_motor.glb',
  '/models/battery.glb',
  '/models/breadboard.glb',
];

MODEL_URLS.forEach(url => useGLTF.preload(url));

function FittedModel({ url, fit = 2.15, rotation = [0, 0, 0], offset = [0, 0, 0] }) {
  const { scene } = useGLTF(url);

  const { clone, center, scale } = useMemo(() => {
    const clonedScene = scene.clone(true);
    clonedScene.rotation.set(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0);
    clonedScene.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = false;
      }
    });
    clonedScene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const modelCenter = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(modelCenter);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;

    return {
      clone: clonedScene,
      center: modelCenter,
      scale: fit / maxDimension,
    };
  }, [fit, rotation, scene]);

  return (
    <group position={offset}>
      <primitive
        object={clone}
        scale={scale}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      />
    </group>
  );
}

function PreviewScene({ model }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, 3]} intensity={0.8} />
      <FittedModel
        url={model.url}
        fit={model.fit}
        rotation={model.rotation}
        offset={model.offset}
      />
    </>
  );
}

export default function ComponentModelPreview({ model, fallback: Fallback }) {
  if (!model?.url) {
    return Fallback ? <Fallback /> : null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 6], zoom: model.zoom || 72, near: 0.01, far: 100 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <Suspense fallback={null}>
          <PreviewScene model={model} />
        </Suspense>
      </Canvas>
    </div>
  );
}
