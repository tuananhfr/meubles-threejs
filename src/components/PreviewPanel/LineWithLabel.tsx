// Tạo file mới: src/components/PreviewPanel/LineWithLabel.tsx
import { Text } from "@react-three/drei";
import * as THREE from "three";

const LineWithLabel: React.FC<LineWithLabelProps> = ({
  start,
  end,
  label,
  color = "#000000",
}) => {
  // Tạo points cho line
  const points = [];
  points.push(new THREE.Vector3(...start));
  points.push(new THREE.Vector3(...end));

  // Tính điểm giữa để đặt label
  const midPoint = new THREE.Vector3(
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  );

  return (
    <group>
      <line>
        <bufferGeometry attach="geometry">
          <float32BufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                start[0],
                start[1],
                start[2],
                end[0],
                end[1],
                end[2],
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color={color} linewidth={2} />
      </line>

      <Text
        position={[midPoint.x, midPoint.y, midPoint.z]}
        fontSize={0.05}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#ffffff"
      >
        {label}
      </Text>
    </group>
  );
};

export default LineWithLabel;
