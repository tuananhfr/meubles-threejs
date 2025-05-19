// components/OuterFrame.tsx
import React, { useEffect } from "react";
import * as THREE from "three";
import taupeTexture from "../../../assets/images/samples-wenge-wood-effect-800x800.jpg";
import { useLoader } from "@react-three/fiber";
import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";

const OuterFrame: React.FC<OuterFrameProps> = ({
  columns,
  depth,
  cellHeight,
  thickness,
  totalWidth,
  shelfBottomY,
  texture,
  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  const { config, batchUpdate } = useConfig();
  const textureBackboard = useLoader(THREE.TextureLoader, taupeTexture);

  const { syncBackPanels } = useBackPanelManager();

  useEffect(() => {
    // Kiểm tra xem có shelf nào không
    const activeShelvesCount = Object.values(config.shelves || {}).filter(
      (shelf) => !shelf.isRemoved
    ).length;

    let updatedBackPanels: Record<string, BackPanelsData>;

    if (activeShelvesCount > 0) {
      updatedBackPanels = syncBackPanels(config.backPanels || {});
    } else {
      // Nếu không có shelf, tạo panel mặc định như cũ
      updatedBackPanels = createDefaultBackPanels();
    }

    // Cập nhật state
    batchUpdate({
      backPanels: updatedBackPanels,
    });

    // Hàm createDefaultBackPanels tạo panel mặc định khi không có shelf
    function createDefaultBackPanels(): Record<string, BackPanelsData> {
      const defaultPanels: Record<string, BackPanelsData> = {};

      // Lưu lại các panel tùy chỉnh nếu có
      if (config.backPanels) {
        Object.keys(config.backPanels).forEach((key) => {
          if (key.startsWith("custom-panel-")) {
            defaultPanels[key] = { ...config.backPanels[key] };
          }
        });
      }

      // Tạo back panel mặc định cho từng cột
      for (let col = 0; col < columns; col++) {
        const colWidth = getColumnWidth(col);
        const colHeight = getColumnHeight(col);
        const colX = getColumnXPosition(col);
        const shelfSpacing = cellHeight + thickness;
        const numberOfShelves = Math.max(
          2,
          Math.round((colHeight - thickness) / shelfSpacing) + 1
        );
        const numberOfPanels = numberOfShelves - 1;

        for (let row = 0; row < numberOfPanels; row++) {
          const cellY =
            shelfBottomY + thickness + row * shelfSpacing + cellHeight / 2;
          const cellX = colX + colWidth / 2 + thickness / 2;
          const backPanelZ = -depth / 2 + thickness / 2 + 0.0001;
          const panelKey = `back-panel-${row}-${col}`;

          // Kiểm tra xem panel này đã tồn tại chưa
          const existingPanel =
            config.backPanels && config.backPanels[panelKey];
          let isRemoved = true;
          let permanentlyDeleted = false;

          if (existingPanel) {
            isRemoved = existingPanel.isRemoved;
            if (existingPanel.permanentlyDeleted !== undefined) {
              permanentlyDeleted = existingPanel.permanentlyDeleted;
            }
          }

          defaultPanels[panelKey] = {
            key: panelKey,
            row: row,
            column: col,
            isRemoved: isRemoved,
            permanentlyDeleted: permanentlyDeleted,
            position: [cellX, cellY, backPanelZ],
            dimensions: [colWidth, cellHeight, thickness],
            material: "taupeTexture",
          };
        }
      }

      return defaultPanels;
    }
  }, [
    columns,
    depth,
    cellHeight,
    thickness,
    totalWidth,
    shelfBottomY,
    getColumnHeight,
    getColumnWidth,
    getColumnXPosition,
    config.backPanels,
    config.shelves,
    batchUpdate,
    syncBackPanels,
  ]);
  const renderOuterFrame = () => {
    const frames = [];
    const startX = -totalWidth / 2;

    // Vẽ khung ngoài
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
    }

    // Vẽ mặt sau cho từng ô trong kệ
    if (config.backPanels) {
      // Chỉ lặp qua các panel một lần
      Object.values(config.backPanels).forEach((panel) => {
        if (!panel.isRemoved) {
          frames.push(
            <mesh key={panel.key} position={panel.position}>
              <boxGeometry args={panel.dimensions} />
              <meshStandardMaterial
                map={textureBackboard}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      });
    }

    return frames;
  };

  return <>{renderOuterFrame()}</>;
};

export default OuterFrame;
