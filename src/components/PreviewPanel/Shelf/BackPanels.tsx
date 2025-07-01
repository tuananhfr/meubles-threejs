import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";

const BackPanels: React.FC<BackPanelsProps> = ({
  columns,
  depth,
  cellHeight,
  thickness,
  totalWidth,
  shelfBottomY,
  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  const { config, batchUpdate } = useConfig();

  const { syncBackPanels } = useBackPanelManager();

  // Load tất cả textures được sử dụng
  const usedTextureSrcs = useMemo(() => {
    const textureSrcs = new Set<string>();

    // Thêm texture mặc định
    textureSrcs.add(config.texture.src);

    // Thêm textures từ các backPanels
    if (config.backPanels) {
      Object.values(config.backPanels).forEach((panel) => {
        if (panel.texture?.src) {
          textureSrcs.add(panel.texture.src);
        }
      });
    }

    return Array.from(textureSrcs);
  }, [config.backPanels, config.texture.src]);

  // Load tất cả textures
  const loadedTextures = useLoader(THREE.TextureLoader, usedTextureSrcs);

  // Tạo texture map để dễ dàng truy cập
  const textureMap = useMemo(() => {
    const map = new Map<string, THREE.Texture>();

    usedTextureSrcs.forEach((src, index) => {
      map.set(src, loadedTextures[index]);
    });

    return map;
  }, [usedTextureSrcs, loadedTextures]);

  // Helper function để lấy texture cho panel
  const getTextureForPanel = (
    panel: BackPanelsData
  ): THREE.Texture | undefined => {
    // Nếu panel có texture riêng, sử dụng texture đó
    if (panel.texture?.src) {
      return (
        textureMap.get(panel.texture.src) || textureMap.get(config.texture.src)
      );
    }

    // Nếu không có texture riêng, sử dụng texture của config
    return textureMap.get(config.texture.src);
  };

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
          const texture = existingPanel?.texture; // Giữ lại texture nếu có

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
            texture: texture,
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
    config.texture,
    batchUpdate,
    syncBackPanels,
  ]);

  const renderBackPanels = () => {
    const panels: React.ReactNode[] = [];

    // Vẽ mặt sau cho từng ô trong kệ
    if (config.backPanels) {
      Object.values(config.backPanels).forEach((panel) => {
        if (!panel.isRemoved) {
          // Lấy texture phù hợp cho panel này
          const panelTexture = getTextureForPanel(panel);

          panels.push(
            <mesh key={panel.key} position={panel.position}>
              <boxGeometry args={panel.dimensions} />
              <meshStandardMaterial
                map={panelTexture}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      });
    }

    return panels;
  };

  return <>{renderBackPanels()}</>;
};

export default BackPanels;
