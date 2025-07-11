import React, { useMemo } from "react";
import { Text } from "@react-three/drei";

const TextureModeComponent: React.FC<TextureModeComponentProps> = ({
  shelfPositions,
  selectedShelves,
  hoveredShelf,
  depth,
  handleShelfClick,

  isStandardOrReinforcedShelf,
}) => {
  const filteredShelves = useMemo(() => {
    return shelfPositions.filter((shelf) =>
      isStandardOrReinforcedShelf(shelf.id)
    );
  }, [shelfPositions, isStandardOrReinforcedShelf]);

  return (
    <>
      {/* Highlight và Icon cho kệ trong chế độ Texture */}
      {filteredShelves.map((shelf) => {
        const isSelected = selectedShelves.includes(shelf.id);
        const isHovered = hoveredShelf === shelf.id;

        // Xác định màu sắc và độ mờ cho highlight
        let shelfColor = "#4CAF50"; // Mặc định xanh lá
        let opacity = shelf.isVirtual ? 0.15 : 0.2; // Mặc định mờ

        if (isSelected) {
          shelfColor = "#C8E6C9"; // Xanh lá nhạt
          opacity = 0.6;
        } else if (isHovered) {
          shelfColor = "#4CAF50"; // Xanh lá
          opacity = 0.4;
        }

        // Xác định style cho icon
        const iconText = isSelected ? "✓" : "+";
        const iconColor = "#4CAF50"; // Màu xanh lá
        const iconBackground = isHovered && !isSelected ? "#E8F5E8" : "#C8E6C9"; // Nền xanh lá nhạt

        return (
          <React.Fragment key={`texture-shelf-${shelf.id}`}>
            {/* Highlight */}
            <mesh
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

            {/* Icon */}
            <group
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
          </React.Fragment>
        );
      })}
    </>
  );
};

export default TextureModeComponent;
