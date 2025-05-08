import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import ShelfModel from "./Shelf/ShelfModel";

import CanvasControls from "./CanvasControls";
import CameraController from "./CameraController";
import { useState, useCallback } from "react";

const ThreeDPreview: React.FC = () => {
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [zoomInTriggered, setZoomInTriggered] = useState(false);
  const [zoomOutTriggered, setZoomOutTriggered] = useState(false);

  const handleRulerClick = () => {
    setShowMeasurements(!showMeasurements);
  };

  const handleZoomInClick = () => {
    setZoomInTriggered(true);
  };

  const handleZoomOutClick = () => {
    setZoomOutTriggered(true);
  };

  const resetZoomTriggers = useCallback(() => {
    setZoomInTriggered(false);
    setZoomOutTriggered(false);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <color attach="background" args={["#f8f8f8"]} />

        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} />

        <ShelfModel />

        <CameraController
          zoomInTriggered={zoomInTriggered}
          zoomOutTriggered={zoomOutTriggered}
          resetZoomTriggers={resetZoomTriggers}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={false} // Tắt zoom bằng con lăn chuột
          enableRotate={true}
        />

        <Environment preset="apartment" />
      </Canvas>

      <CanvasControls
        onRulerClick={handleRulerClick}
        onZoomInClick={handleZoomInClick}
        onZoomOutClick={handleZoomOutClick}
      />
    </div>
  );
};

export default ThreeDPreview;
