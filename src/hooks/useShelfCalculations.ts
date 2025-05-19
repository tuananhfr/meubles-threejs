// hooks/useShelfCalculations.ts
import { useMemo } from "react";
import { useConfig } from "../components/context/ConfigContext";

export const useShelfCalculations = () => {
  const { config } = useConfig();

  // Convert dimensions from cm to 3D units
  const height = config.height / 100;
  const depth = config.depth / 100;
  const thickness = config.thickness / 100;

  // Lấy số cột và số hàng từ config
  const columns = config.columns;
  const rows = config.rows;

  // Chuyển đổi cellWidth và cellHeight sang đơn vị 3D
  const cellWidth = config.cellWidth / 100;
  const cellHeight = config.cellHeight / 100;

  // Kiểm tra nếu có tấm sau
  const hasBackPanel = config.editBackboard.isSurfaceTotal;

  // Tính toán chiều cao chuẩn dựa trên số hàng, cellHeight và thickness
  // Chiều cao tổng = rows * cellHeight + (rows + 1) * thickness
  const standardHeight = rows * cellHeight + (rows + 1) * thickness;

  // Vị trí đáy của kệ (cố định cho mọi cột)
  const shelfBottomY = -standardHeight / 2;

  // Helper function để lấy chiều cao thực tế của mỗi cột (không bao gồm độ dày của tấm trên và tấm dưới)
  const getColumnHeight = (colIndex: number) => {
    if (config.columnHeights && config.columnHeights[colIndex] !== undefined) {
      return config.columnHeights[colIndex] / 100; // Chuyển từ cm sang đơn vị 3D
    }
    return standardHeight;
  };

  // Helper function để lấy chiều rộng thực tế của mỗi cột
  const getColumnWidth = (colIndex: number) => {
    if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
      return config.columnWidths[colIndex] / 100; // Chuyển từ cm sang đơn vị 3D
    }
    return cellWidth;
  };

  // Tính toán tổng chiều rộng và vị trí của các cột
  const { totalWidth, columnPositions } = useMemo(() => {
    let totalWidth = 0;
    const positions: number[] = [];
    let currentX = 0;

    // Tính toán vị trí của từng cột
    for (let i = 0; i < columns; i++) {
      positions.push(currentX);
      const colWidth = getColumnWidth(i);
      currentX += colWidth + thickness;
    }

    // Tổng chiều rộng = vị trí cuối cùng + chiều rộng cột cuối + thickness
    totalWidth = currentX;

    // Căn giữa các cột
    const offset = -totalWidth / 2;
    return {
      totalWidth,
      columnPositions: positions.map((pos) => pos + offset),
    };
  }, [columns, cellWidth, thickness, config.columnWidths]);

  // Helper function để tính vị trí X của mỗi cột
  const getColumnXPosition = (colIndex: number) => {
    return columnPositions[colIndex];
  };

  return {
    height,
    depth,
    thickness,
    columns,
    rows,
    cellWidth,
    cellHeight,
    hasBackPanel,
    standardHeight,
    shelfBottomY,
    totalWidth,
    getColumnHeight,
    getColumnWidth,
    getColumnXPosition,
  };
};
