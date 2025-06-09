import { useEffect } from "react";
import { useConfig } from "../components/context/ConfigContext";
import { useShelfCalculations } from "./useShelfCalculations";

/**
 * Hook đơn giản để sync vị trí facades khi dimensions thay đổi
 */
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
    // Kiểm tra có facades không
    if (!config.facadePanels || Object.keys(config.facadePanels).length === 0) {
      return;
    }

    const updatedFacades: Record<string, FacadeData> = {};
    let hasChanges = false;

    Object.entries(config.facadePanels).forEach(([key, facade]) => {
      // Chỉ sync facades từ editor (có prefix đặc biệt)
      if (key.startsWith("tiroir_") || key.startsWith("porte_")) {
        // fuction để kiểm tra xem facade có cần xóa không
        const shouldRemoveFacade = (facade: FacadeData): boolean => {
          // Tính vị trí Y top và bottom của facade
          const facadeTopY = facade.position[1] + facade.dimensions[1] / 2;

          // Tính maxValidY cho cột này
          const columnHeight = getColumnHeight
            ? getColumnHeight(facade.column)
            : config.height;
          const columnEffectiveHeight =
            columnHeight - (config.editFeet?.heightFeet || 0);
          const maxValidY = shelfBottomY + columnEffectiveHeight;

          // Nếu facade nằm một phần nào đó vượt quá maxValidY → xóa
          return facadeTopY > maxValidY;
        };

        // Kiểm tra cột tồn tại và facade không vượt quá chiều cao
        if (facade.column < config.columns && !shouldRemoveFacade(facade)) {
          // get chiều cao của facade từ key
          const getFacadeHeightFromKey = (key: string): number => {
            // Key format: "tiroir_17", "porte_basse_36", "porte_haut_74", etc.
            const parts = key.split("-")[0]; // Lấy phần đầu: "tiroir_17"
            const heightMatch = parts.match(/(\d+)$/); // Extract số cuối
            return heightMatch ? parseInt(heightMatch[1]) : 0;
          };

          const facadeHeightCm = getFacadeHeightFromKey(key);
          const facadeHeight3D = facadeHeightCm / 100; // Convert cm to 3D units

          // tính chiều cao hiệu quả của cột
          const effectiveHeight =
            config.height - (config.editFeet?.heightFeet || 0);

          // Check: Nếu facade cao hơn effective height → XÓA
          if (facadeHeight3D > effectiveHeight) {
            hasChanges = true;
            // Không thêm vào updatedFacades = xóa facade
            return; // Skip facade này
          }

          // Tính toán vị trí mới của facade
          const shelfSpacing = cellHeight + calcThickness;

          // Tính currentY và nextY dựa trên row của facade
          const currentRow = facade.row;
          const nextRow = facade.row + facade.dimensions[1] / shelfSpacing; // Tính nextRow dựa trên chiều cao facade

          const currentY =
            shelfBottomY + calcThickness + currentRow * shelfSpacing;
          const nextY = shelfBottomY + calcThickness + nextRow * shelfSpacing;

          // Tính vị trí Y của facade (ở giữa currentY và nextY)
          const newY = (currentY + nextY) / 2;

          // Tính vị trí shelf top của kệ
          const shelfTopY = shelfBottomY + effectiveHeight;
          const facadeTopY = newY + facade.dimensions[1] / 2; // Top edge của facade

          // Check: Nếu facade vượt quá shelf top → XÓA
          if (facadeTopY > shelfTopY) {
            hasChanges = true;
            // Không thêm vào updatedFacades = xóa facade
            return; // Skip facade này
          }

          const newColumnWidth = getColumnWidth(facade.column);
          const newColumnX = getColumnXPosition(facade.column);
          const newCenterX =
            newColumnX + newColumnWidth / 2 + calcThickness / 2;
          const newZ = calcDepth / 2 + calcThickness / 2;

          const updatedFacade: FacadeData = {
            ...facade,
            position: [newCenterX, newY, newZ] as [number, number, number], // Fix: Explicit tuple type
            dimensions: [
              newColumnWidth,
              facade.dimensions[1], // Giữ nguyên chiều cao
              calcThickness,
            ] as [number, number, number], // Fix: Explicit tuple type
          };

          // Kiểm tra có thay đổi không với tolerance nhỏ
          const tolerance = 0.001;
          if (
            Math.abs(facade.position[0] - updatedFacade.position[0]) >
              tolerance ||
            Math.abs(facade.position[1] - updatedFacade.position[1]) >
              tolerance || // Thêm check Y
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
          // Cột không tồn tại hoặc facade vượt quá chiều cao - xóa facade này
          hasChanges = true;
        }
      } else {
        // Giữ nguyên facades khác (auto, temp, etc.)
        updatedFacades[key] = facade;
      }
    });

    // Chỉ update nếu có thay đổi thật sự
    if (hasChanges) {
      updateConfig("facadePanels", updatedFacades);
    }
  }, [
    // Dependencies trigger sync
    config.width,
    config.height,
    config.columnHeights,
    config.columnWidths,
    config.columns,
    config.thickness,
    config.depth,

    // Hook functions
    getColumnWidth,
    getColumnXPosition,
    calcThickness,
    calcDepth,
    shelfBottomY,
    cellHeight,
    updateConfig,
  ]);
};
