import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";

const BackboardHighlights: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  // Cấu hình hiển thị cho từng trạng thái - bạn có thể điều chỉnh các giá trị này
  const panelStateConfigs = {
    // 1. Panel chưa bị xóa (isRemoved: false) và chưa được click/hover
    activeNormal: {
      highlightColor: "#FF5252", // Highlight màu xanh lá
      highlightOpacity: 0, // Không hiển thị highlight
      iconBackgroundColor: "white", // Background màu trắng
      iconColor: "#FF5252", // Màu xanh lá cho icon
      iconText: "-", // Icon "-" cho panel đang hiển thị
    },

    // 2. Panel đã bị xóa (isRemoved: true) và chưa được click/hover
    removedNormal: {
      highlightColor: "#FF5252", // Highlight màu đỏ
      highlightOpacity: 0, // Không hiển thị highlight
      iconBackgroundColor: "white", // Background màu trắng
      iconColor: "#4CAF50", // Màu đỏ cho icon
      iconText: "+", // Icon "+" cho panel đã bị xóa
    },

    // 3. Panel chưa bị xóa (isRemoved: false) và đang được hover
    activeHover: {
      highlightColor: "#FF5252", // Highlight màu xanh dương (khác với màu icon)
      highlightOpacity: 0.5, // Highlight với opacity 0.3
      iconBackgroundColor: "white", // Giữ background màu trắng
      iconColor: "#FF5252", // Màu xanh lá cho icon (giữ nguyên màu)
      iconText: "-", // Icon "-" khi hover
    },

    // 4. Panel đã bị xóa (isRemoved: true) và đang được hover
    removedHover: {
      highlightColor: "#4CAF50", // Highlight màu xanh dương (khác với màu icon)
      highlightOpacity: 0.5, // Highlight với opacity 0.3
      iconBackgroundColor: "white", // Giữ background màu trắng
      iconColor: "#4CAF50", // Màu đỏ cho icon (giữ nguyên màu)
      iconText: "+", // Icon "+" khi hover
    },

    // 5. Panel chưa bị xóa (isRemoved: false) và đã được click
    activeClicked: {
      highlightColor: "#FF5252", // Highlight màu tím (khác biệt hoàn toàn)
      highlightOpacity: 0.5, // Highlight với opacity 0.5
      iconBackgroundColor: "#E8F5E9", // Background xanh lá nhạt
      iconColor: "#FF5252", // Màu xanh lá cho icon (giữ nguyên màu)
      iconText: "-", // Icon "+" khi được chọn - sẽ chuyển thành isRemoved: true
    },

    // 6. Panel đã bị xóa (isRemoved: true) và đã được click
    removedClicked: {
      highlightColor: "#4CAF50", // Highlight màu tím (khác biệt hoàn toàn)
      highlightOpacity: 0.5, // Highlight với opacity 0.5
      iconBackgroundColor: "#FFEBEE", // Background đỏ nhạt
      iconColor: "#4CAF50", // Màu đỏ cho icon (giữ nguyên màu)
      iconText: "+", // Icon "-" khi được chọn - sẽ chuyển thành isRemoved: false
    },
  };

  // Helper function để tạo vị trí icon cho từng panel
  const getIconPosition = (panel: BackPanelsData): [number, number, number] => {
    const [x, y, z] = panel.position;
    return [x, y, z + panel.dimensions[2] / 2 + 0.01];
  };

  // Xử lý khi nhấp vào panel - toggle trạng thái trong selectedBackboard
  const handlePanelClick = (panelKey: string) => {
    // Bỏ qua các panel đã xóa vĩnh viễn
    if (config.backPanels[panelKey]?.permanentlyDeleted) {
      return;
    }

    // Kiểm tra xem panel đã được chọn chưa
    const isSelected = config.editBackboard.selectedBackboard.some(
      (panel) => panel.key === panelKey
    );

    if (isSelected) {
      // Nếu đã được chọn, loại bỏ khỏi danh sách
      updateConfig("editBackboard", {
        ...config.editBackboard,
        selectedBackboard: config.editBackboard.selectedBackboard.filter(
          (panel) => panel.key !== panelKey
        ),
      });
    } else {
      // Nếu chưa được chọn, thêm vào danh sách
      if (config.backPanels && config.backPanels[panelKey]) {
        updateConfig("editBackboard", {
          ...config.editBackboard,
          selectedBackboard: [
            ...config.editBackboard.selectedBackboard,
            config.backPanels[panelKey],
          ],
        });
      }
    }
  };

  // Xử lý sự kiện hover
  const handlePointerOver = (e: ThreeEvent<PointerEvent>, panelKey: string) => {
    // Bỏ qua các panel đã xóa vĩnh viễn
    if (config.backPanels[panelKey]?.permanentlyDeleted) {
      return;
    }

    setHoveredPanel(panelKey);
    document.body.style.cursor = "pointer";
    e.stopPropagation();
  };

  // Reset khi pointer rời khỏi panel
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    setHoveredPanel(null);
    document.body.style.cursor = "auto";
    e.stopPropagation();
  };

  // Reset selectedBackboard khi đóng menus
  useEffect(() => {
    if (
      !config.editBackboard.isOpenMenu ||
      !config.editBackboard.isSurfaceOption
    ) {
      // Kiểm tra nếu có panel đã được chọn
      if (config.editBackboard.selectedBackboard.length > 0) {
        updateConfig("editBackboard", {
          ...config.editBackboard,
          selectedBackboard: [],
        });
      }
    }
  }, [
    config.editBackboard.isOpenMenu,
    config.editBackboard.isSurfaceOption,
    updateConfig,
    config.editBackboard,
  ]);

  // Kiểm tra điều kiện để hiển thị highlights và icons
  if (
    !config.backPanels ||
    !config.editBackboard.isOpenMenu ||
    !config.editBackboard.isSurfaceOption
  ) {
    return null;
  }

  return (
    <group>
      {Object.entries(config.backPanels).map(([key, panel]) => {
        // Bỏ qua các panel đã xóa vĩnh viễn
        if (panel.permanentlyDeleted) {
          return null;
        }

        const isHovered = hoveredPanel === key;
        const isSelected = config.editBackboard.selectedBackboard.some(
          (p) => p.key === key
        );
        const isPanelRemoved = panel.isRemoved;

        // Xác định cấu hình hiển thị dựa trên trạng thái
        let stateConfig: PanelStateConfig;

        if (isSelected) {
          // Panel đã được click
          stateConfig = isPanelRemoved
            ? panelStateConfigs.removedClicked // 6. Panel đã bị xóa và đã được click
            : panelStateConfigs.activeClicked; // 5. Panel chưa bị xóa và đã được click
        } else if (isHovered) {
          // Panel đang được hover
          stateConfig = isPanelRemoved
            ? panelStateConfigs.removedHover // 4. Panel đã bị xóa và đang được hover
            : panelStateConfigs.activeHover; // 3. Panel chưa bị xóa và đang được hover
        } else {
          // Panel bình thường (không hover, không click)
          stateConfig = isPanelRemoved
            ? panelStateConfigs.removedNormal // 2. Panel đã bị xóa và chưa được click/hover
            : panelStateConfigs.activeNormal; // 1. Panel chưa bị xóa và chưa được click/hover
        }

        return (
          <group key={`panel-group-${key}`}>
            {/* Highlight mesh */}
            <mesh
              position={panel.position}
              onClick={(e) => {
                handlePanelClick(key);
                e.stopPropagation();
              }}
              onPointerOver={(e) => handlePointerOver(e, key)}
              onPointerOut={handlePointerOut}
            >
              <boxGeometry
                args={[
                  panel.dimensions[0] * 1.02,
                  panel.dimensions[1] * 1.02,
                  panel.dimensions[2] * 1.1,
                ]}
              />
              <meshBasicMaterial
                color={stateConfig.highlightColor}
                transparent
                opacity={stateConfig.highlightOpacity}
                depthWrite={false}
                depthTest={false}
              />
            </mesh>

            {/* Icon với background */}
            <group position={getIconPosition(panel)}>
              {/* Background circle */}
              <mesh>
                <circleGeometry args={[0.05, 32]} />
                <meshBasicMaterial color={stateConfig.iconBackgroundColor} />
              </mesh>

              {/* Icon text */}
              <Text
                position={[0, 0, 0.01]}
                color={stateConfig.iconColor}
                fontSize={0.06}
                anchorX="center"
                anchorY="middle"
              >
                {stateConfig.iconText}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
};

export default BackboardHighlights;
