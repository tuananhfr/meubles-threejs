// components/OuterFrame.tsx
import React from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";

interface OuterFrameProps {
  columns: number;
  depth: number;
  cellHeight: number;
  thickness: number;
  totalWidth: number;
  shelfBottomY: number;
  hasBackPanel: boolean;
  texture: THREE.Texture;
  getColumnHeight: (colIndex: number) => number;
  getColumnWidth: (colIndex: number) => number;
  getColumnXPosition: (colIndex: number) => number;
}

const OuterFrame: React.FC<OuterFrameProps> = ({
  columns,
  depth,
  cellHeight,
  thickness,
  totalWidth,
  shelfBottomY,
  hasBackPanel,
  texture,
  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  // Hàm để lấy chỉ số hàng cao nhất cho mỗi cột
  const getMaxRowIndex = (col: number) => {
    const colHeight = getColumnHeight(col);
    const shelfSpacing = cellHeight + thickness;
    return Math.max(
      1,
      Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
    );
  };
  const renderOuterFrame = () => {
    const frames = [];
    const startX = -totalWidth / 2;

    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;
      const verticalWallHeight = colHeight;

      // Vách trái (chỉ vẽ cho cột đầu tiên)
      if (col === 0) {
        frames.push(
          <mesh
            key="left-wall"
            position={[
              startX + thickness / 2,
              shelfBottomY + verticalWallHeight / 2,
              0,
            ]}
          >
            <boxGeometry args={[thickness, verticalWallHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }

      // Vách phải (chỉ vẽ cho cột cuối cùng)
      if (col === columns - 1) {
        frames.push(
          <mesh
            key="right-wall"
            position={[
              colX + colWidth + thickness / 2,
              shelfBottomY + verticalWallHeight / 2,
              0,
            ]}
          >
            <boxGeometry args={[thickness, verticalWallHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }

      // Vách sau cho cột này nếu cần
      if (hasBackPanel) {
        frames.push(
          <mesh
            key={`back-wall-${col}`}
            position={[
              centerX,
              shelfBottomY + colHeight / 2,
              -depth / 2 + thickness / 2,
            ]}
          >
            <boxGeometry args={[colWidth, verticalWallHeight, thickness]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }
    }

    return frames;
  };

  return <>{renderOuterFrame()}</>;
};

export default OuterFrame;
