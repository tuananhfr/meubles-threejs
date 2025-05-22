import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";

const VerticalPanelsHighlights: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);

  // Hàm tạo vị trí highlight cho từng vertical panel
  const getPanelPositions = () => {
    const positions: {
      key: string;
      x: number;
      y: number;
      z: number;
      width: number;
      height: number;
      depth: number;
    }[] = [];
    // Lấy danh sách vertical panels từ config
    Object.values(config.verticalPanels || {}).forEach((panel) => {
      const [panelWidth, panelHeight, panelDepth] = panel.dimensions;
      const [x, y, z] = panel.position;

      positions.push({
        key: panel.key,
        x: x,
        y: y,
        z: z,
        width: panelWidth,
        height: panelHeight,
        depth: panelDepth,
      });
    });

    return positions;
  };

  const panelPositions = getPanelPositions();

  // Xử lý khi nhấp vào panel
  const handlePanelClick = (panelKey: string) => {
    setSelectedPanels((prevSelected) => {
      let newSelected;
      if (prevSelected.includes(panelKey)) {
        // Bỏ chọn panel
        newSelected = prevSelected.filter((key) => key !== panelKey);
      } else {
        // Thêm panel vào danh sách chọn
        newSelected = [...prevSelected, panelKey];
      }

      // Cập nhật config
      updateConfig("editVerticalPanels", {
        ...config.editVerticalPanels,
        isOpenEditTexture: newSelected.length > 0,
        selectedPanels: newSelected,
      });

      return newSelected;
    });
  };

  // Xử lý sự kiện hover
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const { x, y, z } = event.point;
    let hoveredPanelKey = null;

    // Kiểm tra xem pointer có nằm trong phạm vi của panel nào không
    for (let i = 0; i < panelPositions.length; i++) {
      const panel = panelPositions[i];
      const halfWidth = panel.width / 2;
      const halfHeight = panel.height / 2;
      const halfDepth = panel.depth / 2;

      // Kiểm tra trong phạm vi panel
      if (
        x >= panel.x - halfWidth &&
        x <= panel.x + halfWidth &&
        y >= panel.y - halfHeight &&
        y <= panel.y + halfHeight &&
        z >= panel.z - halfDepth &&
        z <= panel.z + halfDepth
      ) {
        hoveredPanelKey = panel.key;
        break;
      }
    }

    if (hoveredPanelKey !== hoveredPanel) {
      setHoveredPanel(hoveredPanelKey);
      document.body.style.cursor =
        hoveredPanelKey !== null ? "pointer" : "auto";
    }
  };

  // Reset khi pointer rời khỏi kệ
  const handlePointerLeave = () => {
    setHoveredPanel(null);
    document.body.style.cursor = "auto";
  };

  // Reset selected panels khi menu đóng
  useEffect(() => {
    if (!config.editVerticalPanels.isOpenEditTexture) {
      setSelectedPanels([]);
      setHoveredPanel(null);
      document.body.style.cursor = "auto";
    }
  }, [config.editVerticalPanels.isOpenEditTexture]);

  // Chỉ hiển thị khi menu texture đang mở
  if (!config.editVerticalPanels.isOpenEditTexture) {
    return null;
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Highlight cho mỗi vertical panel */}
      {panelPositions.map((panel) => (
        <mesh
          key={`panel-highlight-${panel.key}`}
          position={[panel.x, panel.y, panel.z]}
          onClick={(e) => {
            handlePanelClick(panel.key);
            e.stopPropagation();
          }}
        >
          <boxGeometry args={[panel.width, panel.height, panel.depth]} />
          <meshBasicMaterial
            color={selectedPanels.includes(panel.key) ? "#d4f5d4" : "#e6f7f9"}
            transparent
            opacity={
              hoveredPanel === panel.key || selectedPanels.includes(panel.key)
                ? 0.5
                : 0
            }
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      ))}

      {/* Biểu tượng "+" (Texture) hoặc "✓" */}
      {panelPositions.map((panel) => (
        <group
          key={`texture-icon-${panel.key}`}
          position={[panel.x, panel.y, panel.z + panel.depth / 2 + 0.01]}
        >
          <mesh>
            <circleGeometry args={[0.05, 32]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            color={selectedPanels.includes(panel.key) ? "#4CAF50" : "#17a2b8"}
            fontSize={0.06}
            anchorX="center"
            anchorY="middle"
          >
            {selectedPanels.includes(panel.key) ? "✓" : "+"}
          </Text>
        </group>
      ))}
    </group>
  );
};

export default VerticalPanelsHighlights;
