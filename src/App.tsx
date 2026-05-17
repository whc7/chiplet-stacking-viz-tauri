import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Scene3D } from './components/Scene3D';
import { UI } from './components/UI';
import { useChipletStore } from './store/chipletStore';

function CameraController() {
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const isDragging = useChipletStore((state) => state.isDragging);

  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.enabled = !isDragging;
    }
  }, [isDragging]);

  return <OrbitControls ref={orbitRef} makeDefault />;
}

export default function App() {
  const selectChiplet = useChipletStore((state) => state.selectChiplet);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: '#1a1a2e' }}
          onPointerMissed={() => selectChiplet(null)}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Scene3D />
          <Grid args={[20, 20]} cellSize={0.5} cellThickness={0.5} cellColor="#444466" sectionSize={2} sectionThickness={1} sectionColor="#666688" fadeDistance={25} fadeStrength={1} infiniteGrid />
          <CameraController />
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
          </GizmoHelper>
        </Canvas>
      </div>
      <UI />
    </div>
  );
}
