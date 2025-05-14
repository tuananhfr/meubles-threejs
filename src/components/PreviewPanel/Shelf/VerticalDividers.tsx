import React from "react";
import * as THREE from "three";

interface VerticalDividersProps {
  columns: number;
  depth: number;
  thickness: number;
  shelfBottomY: number;
  texture: THREE.Texture;
  getColumnHeight: (colIndex: number) => number;
  getColumnXPosition: (colIndex: number) => number;
}

const VerticalDividers: React.FC<VerticalDividersProps> = ({
  columns,
  depth,
  thickness,
  shelfBottomY,
  texture,
  getColumnHeight,
  getColumnXPosition,
}) => {
  const renderVerticalDividers = () => {
    const dividers = [];

    // Vẽ vách ngăn dọc giữa các cột
    for (let col = 1; col < columns; col++) {
      const prevColHeight = getColumnHeight(col - 1);
      const currentColHeight = getColumnHeight(col);

      // Lấy chiều cao lớn nhất để vẽ vách ngăn
      const dividerHeight = Math.max(prevColHeight, currentColHeight);

      // Tính vị trí X dựa trên chiều rộng thực tế của các cột trước đó
      const dividerX = getColumnXPosition(col);

      // Thêm vách ngăn dọc
      dividers.push(
        <mesh
          key={`vertical-divider-${col}`}
          position={[dividerX, shelfBottomY + dividerHeight / 2, 0]}
        >
          <boxGeometry args={[thickness, dividerHeight, depth]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        </mesh>
      );
    }

    return dividers;
  };

  return <>{renderVerticalDividers()}</>;
};

export default VerticalDividers;
