import React, { useState, useEffect, useMemo } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";
import { useShelfCalculations } from "../../../../hooks/useShelfCalculations";

const FacadeHighlights: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const [hoveredPanels, setHoveredPanels] = useState<string[]>([]);

  // Lấy các tính toán kệ từ hook useShelfCalculations
  const {
    shelfBottomY,
    cellHeight,
    thickness,
    depth,
    getColumnWidth,
    getColumnHeight,
    getColumnXPosition,
  } = useShelfCalculations();

  // Helper function để auto scroll xuống cuối
  const scrollToBottom = () => {
    setTimeout(() => {
      const element = document.getElementById("facade-panel-bottom");

      if (element) {
        // Scroll đến element trước
        element.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  };

  // Xác định chế độ hiện tại
  const isRetireMode =
    config.editFacade?.facadeType === "retire" &&
    config.editFacade?.heightFacade === 0;

  const isTextureEditMode = config.editFacade?.isOpenEditTexture;

  // Cấu hình trạng thái panel cho từng mode
  const getPanelStateConfig = (): PanelStateConfig => {
    if (isRetireMode) {
      return {
        highlightColor: "#F44336", // Đỏ
        highlightOpacity: 0.2,
        iconBackgroundColor: "white",
        iconColor: "#F44336",
        iconText: "-",
      };
    } else if (isTextureEditMode) {
      return {
        highlightColor: "#2196F3", // Xanh dương
        highlightOpacity: 0.2,
        iconBackgroundColor: "white",
        iconColor: "#2196F3",
        iconText: "+",
      };
    } else {
      return {
        highlightColor: "#4CAF50", // Xanh lá
        highlightOpacity: 0.2,
        iconBackgroundColor: "white",
        iconColor: "#4CAF50",
        iconText: "+",
      };
    }
  };

  const panelStateConfig = getPanelStateConfig();

  // Tạo danh sách temporary panels chỉ dùng trong component này
  const tempFacadePanels = useMemo(() => {
    // Đối với texture edit mode, hiển thị tất cả facade panels hiện có
    if (isTextureEditMode) {
      return config.facadePanels || {};
    }

    // Nếu đang ở chế độ retire, trả về facadePanels hiện tại thay vì tạo panels mới
    if (isRetireMode) {
      return config.facadePanels || {};
    }

    const panels: Record<string, FacadeData> = {};

    // Duyệt qua từng cột
    for (let col = 0; col < config.columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;
      const facadeThickness = thickness;

      // Tính số kệ thật trong cột
      const shelfSpacing = cellHeight + thickness;
      const numberOfShelves = Math.max(
        2,
        Math.round((colHeight - thickness) / shelfSpacing) + 1
      );

      // Tạo danh sách tất cả các vị trí hàng (bao gồm cả kệ thật và kệ ảo)
      const allRows: number[] = [];

      // Thêm kệ thật
      for (let row = 0; row <= numberOfShelves - 1; row++) {
        allRows.push(row);
      }

      // Thêm kệ ảo (nằm giữa các kệ thật)
      for (let row = 0; row < numberOfShelves - 1; row++) {
        allRows.push(row + 0.5);
      }

      // Sắp xếp lại theo thứ tự tăng dần
      allRows.sort((a, b) => a - b);

      // Tạo panel cho mỗi cặp hàng liền kề
      for (let i = 0; i < allRows.length - 1; i++) {
        const currentRow = allRows[i];
        const nextRow = allRows[i + 1];

        // Tính vị trí Y của 2 hàng
        const currentY = shelfBottomY + thickness + currentRow * shelfSpacing;
        const nextY = shelfBottomY + thickness + nextRow * shelfSpacing;

        // Tính vị trí Y của panel (ở giữa 2 hàng)
        const cellY = (currentY + nextY) / 2 - thickness / 2;

        // Tính chiều cao của panel
        const panelHeight = nextY - currentY - thickness;

        // Tạo key cho panel
        const panelKey = `facade-panel-${currentRow}-${nextRow}-${col}`;

        // Chỉ tạo panel nếu chiều cao > 0
        if (panelHeight > 0) {
          panels[panelKey] = {
            key: panelKey,
            row: currentRow,
            column: col,
            position: [centerX, cellY, depth / 2 - thickness / 2], // Mặt trước của kệ
            dimensions: [colWidth, panelHeight, facadeThickness],
            material: config.texture.name,
          };
        }
      }
    }

    return panels;
  }, [
    config.columns,
    config.facadePanels,
    config.texture.name,
    getColumnWidth,
    getColumnHeight,
    getColumnXPosition,
    shelfBottomY,
    cellHeight,
    thickness,
    isRetireMode,
    isTextureEditMode, // Thêm dependency
  ]);

  // Sử dụng useMemo để tạo trước bản đồ facade cho mỗi panel tạm thời
  const panelToFacadeMap = useMemo(() => {
    // Đối với texture edit mode, mỗi panel đại diện cho chính nó
    if (isTextureEditMode) {
      const result: Record<string, string[]> = {};
      Object.keys(tempFacadePanels).forEach((key) => {
        result[key] = [key];
      });
      return result;
    }

    // Nếu là retire mode, mỗi panel đại diện cho chính nó
    if (isRetireMode) {
      const result: Record<string, string[]> = {};
      Object.keys(tempFacadePanels).forEach((key) => {
        result[key] = [key];
      });
      return result;
    }

    if (
      !config.editFacade?.heightFacade ||
      !tempFacadePanels ||
      Object.keys(tempFacadePanels).length === 0
    ) {
      return {};
    }

    const result: Record<string, string[]> = {};
    const targetHeight = config.editFacade.heightFacade / 100; // Chuyển từ cm sang đơn vị 3D

    // Xử lý từng cột
    for (let col = 0; col < config.columns; col++) {
      const panelsInColumn = Object.values(tempFacadePanels)
        .filter((p) => p.column === col)
        .sort((a, b) => a.position[1] - b.position[1]);

      // Tạo facade cho mỗi panel
      for (let i = 0; i < panelsInColumn.length; i++) {
        const panel = panelsInColumn[i];

        // Xây dựng facade bắt đầu từ panel này
        let accumulatedHeight = panel.dimensions[1];
        const facadeKeys = [panel.key];

        // Thêm panel phía dưới
        let nextIdx = i + 1;
        while (
          nextIdx < panelsInColumn.length &&
          accumulatedHeight < targetHeight
        ) {
          const nextPanel = panelsInColumn[nextIdx];
          if (accumulatedHeight + nextPanel.dimensions[1] <= targetHeight) {
            facadeKeys.push(nextPanel.key);
            accumulatedHeight += nextPanel.dimensions[1];
            nextIdx++;
          } else {
            break;
          }
        }

        // Nếu chưa đủ chiều cao và đây không phải panel đầu tiên, thêm panel phía trên
        if (accumulatedHeight < targetHeight && i > 0) {
          let prevIdx = i - 1;
          while (prevIdx >= 0 && accumulatedHeight < targetHeight) {
            const prevPanel = panelsInColumn[prevIdx];
            if (accumulatedHeight + prevPanel.dimensions[1] <= targetHeight) {
              facadeKeys.unshift(prevPanel.key);
              accumulatedHeight += prevPanel.dimensions[1];
              prevIdx--;
            } else {
              break;
            }
          }
        }

        // Lưu kết quả
        result[panel.key] = facadeKeys;
      }

      // Xử lý đặc biệt cho các facade ở cuối cột
      if (panelsInColumn.length > 0) {
        const lastPanel = panelsInColumn[panelsInColumn.length - 1];
        const lastPanelFacade = result[lastPanel.key];

        if (lastPanelFacade && lastPanelFacade.length > 1) {
          lastPanelFacade.forEach((key) => {
            result[key] = [...lastPanelFacade];
          });
        }
      }
    }

    return result;
  }, [
    config.editFacade?.heightFacade,
    tempFacadePanels,
    config.columns,
    isRetireMode,
    isTextureEditMode, // Thêm dependency
  ]);

  // Xử lý click cho texture edit mode
  const handleTextureEditClick = (
    e: ThreeEvent<MouseEvent>,
    panelKey: string
  ) => {
    e.stopPropagation();

    if (!panelKey || !tempFacadePanels[panelKey]) return;

    const panel = tempFacadePanels[panelKey];
    const currentSelectedFacade = config.editFacade?.selectedFacade || [];

    // Kiểm tra xem panel đã được chọn chưa
    const selectedGroupIndex = currentSelectedFacade.findIndex((group) =>
      group.some((p) => p.key === panelKey)
    );

    if (selectedGroupIndex !== -1) {
      // Nếu đã được chọn, loại bỏ khỏi danh sách
      const newSelectedFacade = [...currentSelectedFacade];
      newSelectedFacade.splice(selectedGroupIndex, 1);

      updateConfig("editFacade", {
        ...config.editFacade,
        selectedFacade: newSelectedFacade,
      });
    } else {
      // Nếu chưa được chọn, thêm vào danh sách
      updateConfig("editFacade", {
        ...config.editFacade,
        selectedFacade: [
          ...currentSelectedFacade,
          [panel], // Thêm panel đơn lẻ vào danh sách
        ],
      });

      // Auto scroll xuống cuối khi chọn facade mới
      scrollToBottom();
    }
  };

  // Xử lý khi nhấp vào panel (logic gốc cho add/retire modes)
  const handlePanelClick = (e: ThreeEvent<MouseEvent>, panelKey: string) => {
    e.stopPropagation();

    // Xử lý riêng cho texture edit mode
    if (isTextureEditMode) {
      handleTextureEditClick(e, panelKey);
      return;
    }

    // Logic gốc cho add/retire modes
    if (!panelKey || !tempFacadePanels || !panelToFacadeMap[panelKey]) return;

    // Lấy tất cả các panel keys trong cùng facade
    const clickedFacadeKeys = panelToFacadeMap[panelKey] || [];
    if (clickedFacadeKeys.length === 0) return;

    // Lấy tất cả các panel objects trong facade
    const facadePanels = clickedFacadeKeys
      .map((key) => tempFacadePanels[key])
      .filter(Boolean);

    // Lấy danh sách selectedFacade hiện tại hoặc mảng rỗng nếu chưa có
    const currentSelectedFacade = config.editFacade?.selectedFacade || [];

    // Kiểm tra xem nhóm facade này đã được chọn chưa
    const selectedGroupIndex = currentSelectedFacade.findIndex((group) =>
      group.some((panel) => clickedFacadeKeys.includes(panel.key))
    );

    if (selectedGroupIndex !== -1) {
      // Nếu nhóm facade này đã được chọn, loại bỏ khỏi danh sách
      const newSelectedFacade = [...currentSelectedFacade];
      newSelectedFacade.splice(selectedGroupIndex, 1);

      updateConfig("editFacade", {
        ...config.editFacade,
        selectedFacade: newSelectedFacade,
      });
    } else {
      // Nếu nhóm facade này chưa được chọn, thêm vào danh sách
      updateConfig("editFacade", {
        ...config.editFacade,
        selectedFacade: [
          ...currentSelectedFacade,
          facadePanels, // Thêm nhóm panel mới vào danh sách
        ],
      });

      // Auto scroll xuống cuối khi chọn facade mới
      scrollToBottom();
    }
  };

  // Kiểm tra xem một panel có đang được hover không
  const isPanelHovered = (panel: FacadeData): boolean => {
    if (!panel) return false;
    return hoveredPanels.includes(panel.key);
  };

  // Kiểm tra xem một panel có được chọn không
  const isPanelSelected = (panel: FacadeData): boolean => {
    if (!config.editFacade?.selectedFacade || !panel) return false;

    // Kiểm tra xem panel có nằm trong bất kỳ nhóm facade nào đã được chọn không
    return config.editFacade.selectedFacade.some((group) =>
      group.some((p) => p.key === panel.key)
    );
  };

  // Xử lý hover cho texture edit mode
  const handleTextureEditHover = (
    e: ThreeEvent<PointerEvent>,
    panelKey: string
  ) => {
    if (!tempFacadePanels[panelKey]) return;

    // Chỉ hover panel đơn lẻ
    setHoveredPanels([panelKey]);
    document.body.style.cursor = "pointer";
    e.stopPropagation();
  };

  // Xử lý sự kiện hover (logic gốc)
  const handlePointerOver = (e: ThreeEvent<PointerEvent>, panelKey: string) => {
    // Xử lý riêng cho texture edit mode
    if (isTextureEditMode) {
      handleTextureEditHover(e, panelKey);
      return;
    }

    if (!tempFacadePanels || !panelToFacadeMap[panelKey]) return;

    // Lấy tất cả panel trong cùng facade
    const hoveredFacadeKeys = panelToFacadeMap[panelKey] || [];

    // Cập nhật danh sách các panel đang hover
    setHoveredPanels(hoveredFacadeKeys);

    document.body.style.cursor = "pointer";
    e.stopPropagation();
  };

  // Reset khi pointer rời khỏi panel
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    setHoveredPanels([]);
    document.body.style.cursor = "auto";
    e.stopPropagation();
  };

  // Theo dõi thay đổi của facadeType và reset hover khi thay đổi
  useEffect(() => {
    // Reset hoveredPanels khi facadeType thay đổi
    setHoveredPanels([]);
  }, [config.editFacade?.facadeType, config.editFacade?.isOpenEditTexture]); // Thêm dependency

  // Cập nhật điều kiện hiển thị
  const shouldShowHighlights = () => {
    // Hiển thị cho texture edit mode
    if (isTextureEditMode) {
      return tempFacadePanels && Object.keys(tempFacadePanels).length > 0;
    }

    // Logic gốc cho add/retire modes
    return (
      config.editFacade?.isOpenMenu &&
      tempFacadePanels &&
      Object.keys(tempFacadePanels).length > 0 &&
      config.editFacade?.facadeType &&
      config.editFacade.facadeType !== ""
    );
  };

  // Kiểm tra điều kiện để hiển thị highlights và icons
  if (!shouldShowHighlights()) {
    return null;
  }

  // Helper function để tạo vị trí icon cho từng panel
  const getIconPosition = (panel: FacadeData): [number, number, number] => {
    const [x, y, z] = panel.position;
    return [x, y, z + 0.03]; // Đặt icon phía trước panel một chút
  };

  return (
    <group>
      {Object.values(tempFacadePanels).map((panel) => {
        const isHovered = isPanelHovered(panel);
        const isSelected = isPanelSelected(panel);

        // Xác định hiển thị dựa trên trạng thái hover và click
        let opacity = panelStateConfig.highlightOpacity;
        let iconBackgroundColor = panelStateConfig.iconBackgroundColor;

        // Tăng opacity khi hover hoặc đã chọn
        if (isHovered || isSelected) {
          opacity = 0.5;
        }

        // Thay đổi màu nền icon khi được chọn dựa theo mode
        if (isSelected) {
          if (isRetireMode) {
            iconBackgroundColor = "#FFEBEE"; // Background đỏ nhạt
          } else if (isTextureEditMode) {
            iconBackgroundColor = "#E3F2FD"; // Background xanh dương nhạt
          } else {
            iconBackgroundColor = "#E8F5E9"; // Background xanh lá nhạt
          }
        }

        return (
          <group key={`facade-group-${panel.key}`}>
            {/* Highlight mesh */}
            <mesh
              position={panel.position}
              onClick={(e) => handlePanelClick(e, panel.key)}
              onPointerOver={(e) => handlePointerOver(e, panel.key)}
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
                color={panelStateConfig.highlightColor}
                transparent
                opacity={opacity}
                depthWrite={false}
                depthTest={false}
              />
            </mesh>

            {/* Icon với background - luôn hiển thị */}
            <group position={getIconPosition(panel)}>
              {/* Background circle */}
              <mesh>
                <circleGeometry args={[0.05, 32]} />
                <meshBasicMaterial color={iconBackgroundColor} />
              </mesh>

              {/* Icon text */}
              <Text
                position={[0, 0, 0.01]}
                color={panelStateConfig.iconColor}
                fontSize={0.06}
                anchorX="center"
                anchorY="middle"
              >
                {isSelected ? "✓" : panelStateConfig.iconText}
              </Text>
            </group>
          </group>
        );
      })}
    </group>
  );
};

export default FacadeHighlights;
