import React from "react";
import { Text } from "@react-three/drei";

interface StandardReinforceComponentProps {
  shelfPositions: any[];
  selectedShelves: string[];
  hoveredShelf: string | null;
  depth: number;
  handleShelfClick: (shelfInfo: any) => void;
  isStandardMode: boolean;
  isReinforcedMode: boolean;
  hasResetRef: React.RefObject<boolean>;
}

const StandardReinforceModeComponent: React.FC<
  StandardReinforceComponentProps
> = ({
  shelfPositions,
  selectedShelves,
  hoveredShelf,
  depth,
  handleShelfClick,
  isStandardMode,
  isReinforcedMode,
  hasResetRef,
}) => {
  return (
    <>
      {/* Highlight cho kệ trong chế độ Standard/Reinforced */}
      {shelfPositions.map((shelf) => {
        const isSelected = selectedShelves.includes(shelf.id);
        const isHovered = hoveredShelf === shelf.id;

        // Xác định màu sắc và độ mờ
        let shelfColor = "#000000"; // Mặc định đen
        let opacity = shelf.isVirtual ? 0.15 : 0.2; // Mặc định mờ

        if (isSelected) {
          // Kệ được chọn
          if (isReinforcedMode) {
            shelfColor = "#d4f5d4"; // Xanh lá nhạt
          } else if (isStandardMode) {
            shelfColor = "#ffe0b2"; // Cam nhạt
          } else {
            shelfColor = "#d4f5d4"; // Mặc định
          }
          opacity = 0.5;
        } else if (isHovered) {
          // Kệ đang hover
          if (isReinforcedMode) {
            shelfColor = "#4CAF50"; // Xanh lá
          } else if (isStandardMode) {
            shelfColor = "#FF9800"; // Cam
          } else {
            shelfColor = "#000000"; // Mặc định
          }
          opacity = 0.5;
        }

        return (
          <mesh
            key={`std-reinf-highlight-${shelf.id}`}
            position={[shelf.x, shelf.y, 0]}
            onClick={(e) => {
              handleShelfClick(shelf);
              e.stopPropagation();
            }}
          >
            <boxGeometry args={[shelf.width, shelf.height, depth]} />
            <meshBasicMaterial
              color={shelfColor}
              transparent
              opacity={opacity}
              depthWrite={false}
              depthTest={false}
            />
          </mesh>
        );
      })}

      {/* Icon cho kệ trong chế độ Standard/Reinforced - LUÔN HIỂN THỊ ICON */}
      {shelfPositions.map((shelf) => {
        const isSelected = selectedShelves.includes(shelf.id);
        const isHovered = hoveredShelf === shelf.id;

        // Style cho icon dựa vào chế độ - luôn hiển thị
        let iconText = isSelected ? "✓" : shelf.isVirtual ? "*" : "+";
        let iconColor;
        let iconBackground;

        if (isSelected) {
          if (isReinforcedMode) {
            iconColor = "#4CAF50"; // Xanh lá
          } else if (isStandardMode) {
            iconColor = "#FF9800"; // Cam
          } else {
            iconColor = "#4CAF50"; // Mặc định
          }
          iconBackground = "white";
        } else {
          iconColor = "#000000"; // Đen

          if (isHovered) {
            if (isReinforcedMode) {
              iconBackground = "#f1f8e9"; // Xanh lá rất nhạt
            } else if (isStandardMode) {
              iconBackground = "#fff3e0"; // Cam rất nhạt
            } else {
              iconBackground = "white";
            }
          } else {
            iconBackground = "white";
          }
        }

        return (
          <group
            key={`std-reinf-icon-${shelf.id}`}
            position={[shelf.x, shelf.y, depth / 2 + 0.01]}
            onClick={(e) => {
              handleShelfClick(shelf);
              e.stopPropagation();
            }}
          >
            <mesh>
              <circleGeometry args={[shelf.isVirtual ? 0.04 : 0.05, 32]} />
              <meshBasicMaterial color={iconBackground} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              color={iconColor}
              fontSize={shelf.isVirtual ? 0.05 : 0.06}
              anchorX="center"
              anchorY="middle"
            >
              {iconText}
            </Text>
          </group>
        );
      })}
    </>
  );
};

export default StandardReinforceModeComponent;
