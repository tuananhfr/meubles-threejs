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

    // Tạo verticalPanels data dựa vào logic dividers (chỉ khi chưa có)
    const newVerticalPanels: Record<string, VerticalPanelData> = {
      ...config.verticalPanels,
    };

    // 1. VÁCH NGOÀI TRÁI (Left Outer Wall)
    const leftWallHeight = getColumnHeight(0);
    const startX = -totalWidth / 2;
    const leftWallKey = "left-outer-wall";

    // Chỉ thêm vào config nếu chưa có
    if (!newVerticalPanels[leftWallKey]) {
      newVerticalPanels[leftWallKey] = {
        key: leftWallKey,
        position: [startX, shelfBottomY + leftWallHeight / 2, 0],
        dimensions: [thickness, leftWallHeight, depth],
      };
    }

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

      // Chỉ thêm vào config nếu chưa có
      if (!newVerticalPanels[dividerKey]) {
        newVerticalPanels[dividerKey] = {
          key: dividerKey,
          position: [dividerX, shelfBottomY + dividerHeight / 2, 0],
          dimensions: [thickness, dividerHeight, depth],
        };
      }

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

    // Chỉ thêm vào config nếu chưa có
    if (!newVerticalPanels[rightWallKey]) {
      newVerticalPanels[rightWallKey] = {
        key: rightWallKey,
        position: [rightWallX, shelfBottomY + lastColHeight / 2, 0],
        dimensions: [thickness, lastColHeight, depth],
      };
    }

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

    // Cập nhật config.verticalPanels với data mới (chỉ khi có thay đổi)
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
