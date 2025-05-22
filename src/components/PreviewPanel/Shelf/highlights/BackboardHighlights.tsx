import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";

const BackboardHighlights: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  // Xác định mode hiện tại
  const isDeleteMode =
    config.editBackboard?.isSurfaceOption && config.editBackboard?.isOpenMenu;
  const isTextureEditMode = config.editBackboard?.isOpenEditTexture;

  // Cấu hình hiển thị cho texture edit mode
  const textureEditConfigs = {
    // Panel bình thường trong texture edit mode
    normal: {
      highlightColor: "#2196F3", // Xanh dương
      highlightOpacity: 0,
      iconBackgroundColor: "white",
      iconColor: "#2196F3",
      iconText: "+", // Icon paint brush
    },

    // Panel hover trong texture edit mode
    hover: {
      highlightColor: "#2196F3", // Xanh dương
      highlightOpacity: 0.3,
      iconBackgroundColor: "white",
      iconColor: "#2196F3",
      iconText: "+",
    },

    // Panel selected trong texture edit mode
    selected: {
      highlightColor: "#2196F3", // Xanh dương
      highlightOpacity: 0.5,
      iconBackgroundColor: "#E3F2FD", // Background xanh dương nhạt
      iconColor: "#2196F3",
      iconText: "✓", // Checkmark khi selected
    },
  };

  // Cấu hình hiển thị cho delete mode (giữ nguyên logic cũ)
  const deleteConfigs = {
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

  // Xử lý click cho texture edit mode
  const handleTextureEditClick = (panelKey: string) => {
    // Bỏ qua các panel đã xóa vĩnh viễn hoặc đã bị remove
    const panel = config.backPanels[panelKey];
    if (panel?.permanentlyDeleted || panel?.isRemoved) {
      return;
    }

    // Kiểm tra xem panel đã được chọn chưa
    const isSelected = config.editBackboard?.selectedBackboard?.some(
      (p) => p.key === panelKey
    );

    if (isSelected) {
      // Nếu đã được chọn, loại bỏ khỏi danh sách
      updateConfig("editBackboard", {
        ...config.editBackboard,
        selectedBackboard: config.editBackboard.selectedBackboard.filter(
          (p) => p.key !== panelKey
        ),
      });
    } else {
      // Nếu chưa được chọn, thêm vào danh sách
      updateConfig("editBackboard", {
        ...config.editBackboard,
        selectedBackboard: [...config.editBackboard.selectedBackboard, panel],
      });
    }
  };

  // Xử lý khi nhấp vào panel - logic gốc cho delete mode
  const handleDeleteModeClick = (panelKey: string) => {
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

  // Xử lý click dựa theo mode
  const handlePanelClick = (panelKey: string) => {
    if (isTextureEditMode) {
      handleTextureEditClick(panelKey);
    } else if (isDeleteMode) {
      handleDeleteModeClick(panelKey);
    }
  };

  // Xử lý sự kiện hover
  const handlePointerOver = (e: ThreeEvent<PointerEvent>, panelKey: string) => {
    const panel = config.backPanels[panelKey];

    // Bỏ qua các panel đã xóa vĩnh viễn
    if (panel?.permanentlyDeleted) {
      return;
    }

    // Trong texture edit mode, bỏ qua các panel đã bị remove
    if (isTextureEditMode && panel?.isRemoved) {
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

  // Reset selectedBackboard khi đóng menus hoặc chuyển mode
  useEffect(() => {
    if (isDeleteMode) {
      // Logic gốc cho delete mode
      if (
        !config.editBackboard.isOpenMenu ||
        !config.editBackboard.isSurfaceOption
      ) {
        if (config.editBackboard.selectedBackboard.length > 0) {
          updateConfig("editBackboard", {
            ...config.editBackboard,
            selectedBackboard: [],
          });
        }
      }
    } else if (!isTextureEditMode && !isDeleteMode) {
      // Reset khi không ở mode nào
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
    config.editBackboard.isOpenEditTexture,
    isTextureEditMode,
    isDeleteMode,
    updateConfig,
    config.editBackboard,
  ]);

  // Cập nhật điều kiện hiển thị
  const shouldShowHighlights = () => {
    // Hiển thị cho texture edit mode
    if (isTextureEditMode) {
      return config.backPanels && Object.keys(config.backPanels).length > 0;
    }

    // Logic gốc cho delete mode
    if (isDeleteMode) {
      return (
        config.backPanels &&
        config.editBackboard.isOpenMenu &&
        config.editBackboard.isSurfaceOption
      );
    }

    return false;
  };

  // Kiểm tra điều kiện để hiển thị highlights và icons
  if (!shouldShowHighlights()) {
    return null;
  }

  return (
    <group>
      {Object.entries(config.backPanels).map(([key, panel]) => {
        // Bỏ qua các panel đã xóa vĩnh viễn
        if (panel.permanentlyDeleted) {
          return null;
        }

        // Trong texture edit mode, bỏ qua các panel đã bị remove
        if (isTextureEditMode && panel.isRemoved) {
          return null;
        }

        const isHovered = hoveredPanel === key;
        const isSelected = config.editBackboard?.selectedBackboard?.some(
          (p) => p.key === key
        );
        const isPanelRemoved = panel.isRemoved;

        // Xác định cấu hình hiển thị dựa trên mode và trạng thái
        let stateConfig: PanelStateConfig;

        if (isTextureEditMode) {
          // Logic cho texture edit mode
          if (isSelected) {
            stateConfig = textureEditConfigs.selected;
          } else if (isHovered) {
            stateConfig = textureEditConfigs.hover;
          } else {
            stateConfig = textureEditConfigs.normal;
          }
        } else {
          // Logic gốc cho delete mode
          if (isSelected) {
            // Panel đã được click
            stateConfig = isPanelRemoved
              ? deleteConfigs.removedClicked // 6. Panel đã bị xóa và đã được click
              : deleteConfigs.activeClicked; // 5. Panel chưa bị xóa và đã được click
          } else if (isHovered) {
            // Panel đang được hover
            stateConfig = isPanelRemoved
              ? deleteConfigs.removedHover // 4. Panel đã bị xóa và đang được hover
              : deleteConfigs.activeHover; // 3. Panel chưa bị xóa và đang được hover
          } else {
            // Panel bình thường (không hover, không click)
            stateConfig = isPanelRemoved
              ? deleteConfigs.removedNormal // 2. Panel đã bị xóa và chưa được click/hover
              : deleteConfigs.activeNormal; // 1. Panel chưa bị xóa và chưa được click/hover
          }
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
