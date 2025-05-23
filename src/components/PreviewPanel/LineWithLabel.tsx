// LineWithLabel đơn giản với text option tại start
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface LineWithLabelProps {
  start: [number, number, number];
  end: [number, number, number];
  label: string;
  color?: string;
  backgroundColor?: string;
}

const LineWithLabel: React.FC<LineWithLabelProps> = ({
  start,
  end,
  label,
  color = "#ffffff",
  backgroundColor = "#1a1a1a",
}) => {
  // Tính điểm giữa để đặt label
  const midPoint = new THREE.Vector3(
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  );

  // Tính vector để xác định hướng và độ dài
  const direction = new THREE.Vector3(
    end[0] - start[0],
    end[1] - start[1],
    end[2] - start[2]
  );

  const normalizedDirection = direction.normalize();

  // Tính rotation cho đường chính
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    normalizedDirection
  );

  return (
    <group>
      {/* Label ở giữa */}
      <group position={[midPoint.x, midPoint.y, midPoint.z + 0.005]}>
        {/* Background */}
        <mesh>
          <planeGeometry args={[0.15, 0.04]} />
          <meshBasicMaterial
            color={backgroundColor}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Text */}
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.03}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </group>
  );
};

export default LineWithLabel;
