// components/OuterFrame.tsx
import React from "react";
import * as THREE from "three";
import taupeTexture from "../../../assets/images/samples-wenge-wood-effect-800x800.jpg";
import { useLoader } from "@react-three/fiber";

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
  const textureBackboard = useLoader(THREE.TextureLoader, taupeTexture);

  const renderOuterFrame = () => {
    const frames = [];
    const startX = -totalWidth / 2;

    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);

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

      // Vẽ mặt sau cho từng ô trong kệ
      if (hasBackPanel) {
        // Tính số hàng thực tế dựa trên chiều cao của cột
        const shelfSpacing = cellHeight + thickness;
        const actualRows = Math.max(
          1,
          Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
        );

        // Vẽ mặt sau cho từng ô, bao gồm cả row top
        for (let row = 0; row <= actualRows - 1; row++) {
          // Tính toán chiều cao của ô hiện tại
          let currentCellHeight = cellHeight;
          let cellY;

          const lastShelfY =
            shelfBottomY +
            thickness +
            (row - 1) * shelfSpacing +
            cellHeight +
            thickness;
          const topShelfY = shelfBottomY + colHeight;
          currentCellHeight = topShelfY - lastShelfY - thickness;
          cellY = lastShelfY + currentCellHeight / 2;

          // Điều chỉnh chiều rộng và vị trí X của mặt sau dựa trên loại cột
          let backPanelWidth = colWidth;
          let cellX = colX + colWidth / 2 + thickness / 2;

          // Vị trí Z của mặt sau (đặt ở phía sau, cách một khoảng nhỏ để tránh z-fighting)
          const backPanelZ = -depth / 2 + thickness / 2 + 0.0001;

          frames.push(
            <mesh
              key={`back-panel-${col}-${row}`}
              position={[cellX, cellY, backPanelZ]}
            >
              <boxGeometry
                args={[backPanelWidth, currentCellHeight, thickness]}
              />
              <meshStandardMaterial
                map={textureBackboard}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      }
    }

    return frames;
  };

  return <>{renderOuterFrame()}</>;
};

export default OuterFrame;
