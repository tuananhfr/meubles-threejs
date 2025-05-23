import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";

const VerticalDividers: React.FC<VerticalDividersProps> = ({
  columns,
  depth,
  thickness,
  shelfBottomY,
  texture,
  getColumnHeight,
  getColumnXPosition,
  getColumnWidth,
  totalWidth,
}) => {
  const { config, updateConfig } = useConfig();

  // State để lưu texture cho các vertical panel riêng lẻ
  const [panelTextures, setPanelTextures] = useState<
    Record<string, THREE.Texture>
  >({});

  // Effect để load texture riêng cho từng vertical panel
  useEffect(() => {
    const loadPanelTextures = async () => {
      const newTextures: Record<string, THREE.Texture> = {};
      const textureLoader = new THREE.TextureLoader();

      // Duyệt qua tất cả verticalPanels để tìm những panel có texture riêng
      for (const [key, panel] of Object.entries(config.verticalPanels || {})) {
        if (panel?.texture?.src) {
          try {
            const loadedTexture = await new Promise<THREE.Texture>(
              (resolve, reject) => {
                textureLoader.load(
                  panel.texture!.src,
                  (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    resolve(texture);
                  },
                  undefined,
                  reject
                );
              }
            );
            newTextures[key] = loadedTexture;
          } catch (error) {
            console.warn(`Failed to load texture for panel ${key}:`, error);
          }
        }
      }

      setPanelTextures(newTextures);
    };

    loadPanelTextures();
  }, [config.verticalPanels]);

  // Hàm để lấy texture cho panel cụ thể
  const getPanelTexture = (panelKey: string) => {
    // Sử dụng texture riêng nếu có, ngược lại dùng texture mặc định
    return panelTextures[panelKey] || texture;
  };

  const renderVerticalDividers = () => {
    const dividers: React.ReactNode[] = [];

    // Tạo verticalPanels data hoàn toàn mới (không merge với data cũ)
    const newVerticalPanels: Record<string, VerticalPanelData> = {};

    // 1. VÁCH NGOÀI TRÁI (Left Outer Wall)
    const leftWallHeight = getColumnHeight(0);
    const startX = -totalWidth / 2;
    const leftWallKey = "left-outer-wall";

    // Cập nhật hoặc thêm panel data (luôn tạo mới)
    newVerticalPanels[leftWallKey] = {
      key: leftWallKey,
      position: [startX, shelfBottomY + leftWallHeight / 2, 0],
      dimensions: [thickness, leftWallHeight, depth],
      // Giữ lại texture nếu có từ config cũ
      texture: config.verticalPanels?.[leftWallKey]?.texture,
    };

    // Render với texture riêng nếu có
    const leftWallTexture = getPanelTexture(leftWallKey);
    dividers.push(
      <mesh
        key={leftWallKey}
        position={[startX, shelfBottomY + leftWallHeight / 2, 0]}
      >
        <boxGeometry args={[thickness, leftWallHeight, depth]} />
        <meshStandardMaterial
          map={leftWallTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    );

    // 2. VÁCH NGĂN GIỮA CÁC CỘT (Middle Dividers)
    for (let col = 1; col < columns; col++) {
      const prevColHeight = getColumnHeight(col - 1);
      const currentColHeight = getColumnHeight(col);

      // Lấy chiều cao lớn nhất để vẽ vách ngăn
      const dividerHeight = Math.max(prevColHeight, currentColHeight);

      // Tính vị trí X dựa trên chiều rộng thực tế của các cột trước đó
      const dividerX = getColumnXPosition(col);
      const dividerKey = `vertical-divider-${col}`;

      // Cập nhật hoặc thêm panel data (luôn tạo mới)
      newVerticalPanels[dividerKey] = {
        key: dividerKey,
        position: [dividerX, shelfBottomY + dividerHeight / 2, 0],
        dimensions: [thickness, dividerHeight, depth],
        // Giữ lại texture nếu có từ config cũ
        texture: config.verticalPanels?.[dividerKey]?.texture,
      };

      // Render với texture riêng nếu có
      const dividerTexture = getPanelTexture(dividerKey);
      dividers.push(
        <mesh
          key={dividerKey}
          position={[dividerX, shelfBottomY + dividerHeight / 2, 0]}
        >
          <boxGeometry args={[thickness, dividerHeight, depth]} />
          <meshStandardMaterial
            map={dividerTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      );
    }

    // 3. VÁCH NGOÀI PHẢI (Right Outer Wall)
    const lastCol = columns - 1;
    const lastColHeight = getColumnHeight(lastCol);
    const lastColWidth = getColumnWidth(lastCol);
    const lastColX = getColumnXPosition(lastCol);

    const rightWallX = lastColX + lastColWidth + thickness;
    const rightWallKey = "right-outer-wall";

    // Cập nhật hoặc thêm panel data (luôn tạo mới)
    newVerticalPanels[rightWallKey] = {
      key: rightWallKey,
      position: [rightWallX, shelfBottomY + lastColHeight / 2, 0],
      dimensions: [thickness, lastColHeight, depth],
      // Giữ lại texture nếu có từ config cũ
      texture: config.verticalPanels?.[rightWallKey]?.texture,
    };

    // Render với texture riêng nếu có
    const rightWallTexture = getPanelTexture(rightWallKey);
    dividers.push(
      <mesh
        key={rightWallKey}
        position={[rightWallX, shelfBottomY + lastColHeight / 2, 0]}
      >
        <boxGeometry args={[thickness, lastColHeight, depth]} />
        <meshStandardMaterial
          map={rightWallTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    );

    // Luôn cập nhật config.verticalPanels với data mới (rebuild hoàn toàn)
    if (
      JSON.stringify(config.verticalPanels) !==
      JSON.stringify(newVerticalPanels)
    ) {
      updateConfig("verticalPanels", newVerticalPanels);
    }

    return dividers;
  };

  return <>{renderVerticalDividers()}</>;
};

export default VerticalDividers;
