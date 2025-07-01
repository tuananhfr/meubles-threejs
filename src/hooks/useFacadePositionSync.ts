import { useEffect } from "react";
import { useConfig } from "../components/context/ConfigContext";
import { useShelfCalculations } from "./useShelfCalculations";

// Hàm extract height từ facade key
const getFacadeHeight = (facadeKey: string): number => {
  // Extract số từ key: "tiroir_17" → 17, "porte_36" → 36
  const heightMatch = facadeKey.match(/(\d+)/);

  if (heightMatch) {
    const heightInCm = parseInt(heightMatch[1]); // 17cm
    const heightIn3D = heightInCm / 100; // 0.17 3D units
    return heightIn3D;
  }

  return 0.17; // Default 17cm
};

export const useFacadePositionSync = () => {
  const { config, updateConfig } = useConfig();
  const {
    thickness: calcThickness,
    depth: calcDepth,
    shelfBottomY,
    cellHeight,
    getColumnWidth,
    getColumnHeight,
    getColumnXPosition,
  } = useShelfCalculations();

  useEffect(() => {
    if (!config.facadePanels || Object.keys(config.facadePanels).length === 0) {
      return;
    }

    const updatedFacades: Record<string, FacadeData> = {};
    let hasChanges = false;

    // Lấy danh sách columns hiện có (từ 0 đến config.columns-1)
    const validColumns = Array.from({ length: config.columns }, (_, i) => i);

    Object.entries(config.facadePanels).forEach(([key, facade]) => {
      if (key.startsWith("tiroir_") || key.startsWith("porte_")) {
        // KIỂM TRA 1: COLUMN HỢP LỆ - XÓA FACADE NẾU COLUMN KHÔNG TỒN TẠI
        if (!validColumns.includes(facade.column)) {
          hasChanges = true;
          return; // Không thêm facade này vào updatedFacades (= xóa)
        }

        // KIỂM TRA 2: ROW HỢP LỆ - XÓA FACADE NẾU VƯỢT QUÁ CHIỀU CAO COLUMN
        const facadeRow = facade.row;
        const shelfSpacing = cellHeight + calcThickness;
        const facadeHeight = getFacadeHeight(facade.key);
        const colHeight = getColumnHeight
          ? getColumnHeight(facade.column)
          : config.height || 200;

        // Tính chiều cao cần thiết cho facade này
        const requiredHeight =
          calcThickness + facadeRow * shelfSpacing + facadeHeight;

        if (requiredHeight > colHeight) {
          hasChanges = true;
          return; // Không thêm facade này vào updatedFacades (= xóa)
        }

        // TÍNH POSITION CHO CELL CỤ THỂ [facade.row, facade.column]
        const newColumnWidth = getColumnWidth(facade.column);
        const newColumnX = getColumnXPosition(facade.column);
        const newCenterX = newColumnX + newColumnWidth / 2 + calcThickness / 2;

        // Z position: Facade ở MẶT TRƯỚC
        const newZ = calcDepth / 2 - calcThickness / 2;

        // Y position của facade = Y position của cell tại row này
        const newY =
          shelfBottomY +
          calcThickness +
          facadeRow * shelfSpacing +
          getFacadeHeight(facade.key) / 2;

        const updatedFacade: FacadeData = {
          ...facade,
          position: [newCenterX, newY, newZ] as [number, number, number],
          dimensions: [
            newColumnWidth, // Width có thể thay đổi theo column
            facade.dimensions[1], // Height GIỮ NGUYÊN
            calcThickness, // Depth theo thickness hiện tại
          ] as [number, number, number],
        };

        // Kiểm tra có thay đổi không
        const tolerance = 0.001;
        if (
          Math.abs(facade.position[0] - updatedFacade.position[0]) >
            tolerance ||
          Math.abs(facade.position[1] - updatedFacade.position[1]) >
            tolerance ||
          Math.abs(facade.position[2] - updatedFacade.position[2]) >
            tolerance ||
          Math.abs(facade.dimensions[0] - updatedFacade.dimensions[0]) >
            tolerance ||
          Math.abs(facade.dimensions[2] - updatedFacade.dimensions[2]) >
            tolerance
        ) {
          hasChanges = true;
        }

        updatedFacades[key] = updatedFacade;
      } else {
        // Giữ nguyên facades khác
        updatedFacades[key] = facade;
      }
    });

    if (hasChanges) {
      updateConfig("facadePanels", updatedFacades);
    }
  }, [
    config.columnHeights,
    config.columnWidths,
    config.columns,
    config.shelves, // Dependency cho shelves thay vì backPanels
  ]);
};
