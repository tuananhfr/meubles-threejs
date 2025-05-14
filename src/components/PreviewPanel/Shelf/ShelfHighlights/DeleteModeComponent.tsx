import React, { useMemo } from "react";
import { Text } from "@react-three/drei";

interface DeleteModeComponentProps {
  shelfPositions: any[];
  selectedShelves: string[];
  hoveredShelf: string | null;
  depth: number;
  handleShelfClick: (shelfInfo: any) => void;
  isStandardOrReinforcedShelf: (shelfId: string) => boolean;
  hasResetRef: React.RefObject<boolean>;
}

const DeleteModeComponent: React.FC<DeleteModeComponentProps> = ({
  shelfPositions,
  selectedShelves,
  hoveredShelf,
  depth,
  handleShelfClick,
  isStandardOrReinforcedShelf,
  hasResetRef,
}) => {
  // Sử dụng useMemo để filter các kệ một lần duy nhất
  const filteredShelves = useMemo(() => {
    return shelfPositions.filter((shelf) =>
      isStandardOrReinforcedShelf(shelf.id)
    );
  }, [shelfPositions, isStandardOrReinforcedShelf]);

  return (
    <>
      {/* Highlight và Icon cho kệ trong chế độ Delete */}
      {filteredShelves.map((shelf) => {
        const isSelected = selectedShelves.includes(shelf.id);
        const isHovered = hoveredShelf === shelf.id;

        // Xác định màu sắc và độ mờ cho highlight
        let shelfColor = "#000000"; // Mặc định đen
        let opacity = shelf.isVirtual ? 0.15 : 0.2; // Mặc định mờ

        if (isSelected) {
          shelfColor = "#ffcdd2"; // Đỏ nhạt
          opacity = 0.5;
        } else if (isHovered) {
          shelfColor = "#f44336"; // Đỏ
          opacity = 0.5;
        }

        // Xác định style cho icon
        let iconText = isSelected ? "✓" : "-";
        let iconColor = "#f44336"; // Màu đỏ
        let iconBackground = isHovered && !isSelected ? "#ffebee" : "#ffcdd2"; // Nền đỏ nhạt

        return (
          <React.Fragment key={`delete-shelf-${shelf.id}`}>
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

export default DeleteModeComponent;
