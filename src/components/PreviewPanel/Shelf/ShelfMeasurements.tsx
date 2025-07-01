// components/ShelfMeasurements.tsx
import React from "react";
import { useConfig } from "../../context/ConfigContext";
import LineWithLabel from "../LineWithLabel";

interface ShelfMeasurementsProps {
  columns: number;
  depth: number;
  thickness: number;
  cellHeight: number;
  shelfBottomY: number;

  getColumnHeight: (col: number) => number;
  getColumnWidth: (col: number) => number;
  getColumnXPosition: (col: number) => number;
}

const ShelfMeasurements: React.FC<ShelfMeasurementsProps> = ({
  columns,
  depth,
  thickness,
  cellHeight,
  shelfBottomY,

  getColumnHeight,
  getColumnWidth,
  getColumnXPosition,
}) => {
  const { config } = useConfig();

  // Kiểm tra một vị trí có phải là kệ đã bị xóa không
  const isRemovedShelf = (
    row: number,
    column: number,
    isVirtual: boolean = false
  ) => {
    const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;
    const shelf = config.shelves?.[key];
    return shelf?.isRemoved === true;
  };

  // Tính số lượng cell trong một cột dựa trên chiều cao thực tế
  const getCellCountInColumn = (col: number): number => {
    const colHeight = getColumnHeight(col);
    // Trừ đi thickness của top và bottom
    const usableHeight = colHeight - thickness;
    // Tính số cell dựa trên cellHeight + thickness (thickness của shelf)
    const cellCount = Math.round(usableHeight / (cellHeight + thickness));
    return Math.max(1, cellCount); // Ít nhất phải có 1 cell
  };

  // Lấy danh sách shelves còn lại trong column (không bị xóa)
  const getActiveShelves = (col: number): number[] => {
    const maxPossibleRows = getCellCountInColumn(col);
    const activeShelves = [];

    for (let row = 0; row <= maxPossibleRows; row++) {
      if (!isRemovedShelf(row, col)) {
        activeShelves.push(row);
      }
    }

    return activeShelves.sort((a, b) => a - b); // Sắp xếp tăng dần
  };

  // Tính Y position của shelf theo row
  const getShelfYPosition = (row: number): number => {
    return shelfBottomY + row * (cellHeight + thickness);
  };

  // Tính chiều cao thực tế của cell giữa 2 shelf kề nhau
  const getActualCellHeights = (
    col: number
  ): Array<{
    startRow: number;
    endRow: number;
    height: number;
    startY: number;
    endY: number;
  }> => {
    const activeShelves = getActiveShelves(col);
    const cellHeights = [];

    // Tính chiều cao giữa mỗi cặp shelf kề nhau
    for (let i = 0; i < activeShelves.length - 1; i++) {
      const startRow = activeShelves[i];
      const endRow = activeShelves[i + 1];

      const startY = getShelfYPosition(startRow) + thickness; // Mặt trên của shelf dưới
      const endY = getShelfYPosition(endRow); // Mặt dưới của shelf trên

      const actualHeight = endY - startY; // Chiều cao thực tế của cell

      cellHeights.push({
        startRow,
        endRow,
        height: actualHeight,
        startY,
        endY,
      });
    }

    return cellHeights;
  };

  const renderShelfMeasurements = () => {
    const measurements: React.ReactNode[] = [];

    // 1. CHIỀU RỘNG SHELF NGANG (HorizontalShelves)
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colX = getColumnXPosition(col);

      // Chỉ hiển thị chiều rộng shelf ngang cho kệ đáy của mỗi cột
      if (!isRemovedShelf(0, col)) {
        const shelfY = shelfBottomY + thickness / 2;

        measurements.push(
          <LineWithLabel
            key={`horizontal-shelf-width-${col}`}
            start={[colX + thickness / 2, shelfY, depth / 2]}
            end={[colX + colWidth + thickness / 2, shelfY, depth / 2]}
            label={`${(colWidth * 100).toFixed(0)} cm`}
            color="#1a1a1a"
            backgroundColor="#ffffff"
          />
        );
      }
    }

    // 2. CHIỀU CAO CỦA TỪNG CELL THEO SHELVES THẬT SỰ CÒN LẠI
    for (let col = 0; col < columns; col++) {
      const colX = getColumnXPosition(col);
      const measurementX = colX + thickness / 2; // Đặt ở đầu shelf dọc

      const actualCellHeights = getActualCellHeights(col);

      // Hiển thị chiều cao của từng cell thực tế
      actualCellHeights.forEach((cell) => {
        measurements.push(
          <LineWithLabel
            key={`cell-height-${col}-${cell.startRow}-${cell.endRow}`}
            start={[measurementX, cell.startY, depth / 2]}
            end={[measurementX, cell.endY, depth / 2]}
            label={`${(cell.height * 100).toFixed(0)} cm`}
            color="#ffffff"
            backgroundColor="#1a1a1a"
          />
        );
      });
    }

    return measurements;
  };

  return <group>{renderShelfMeasurements()}</group>;
};

export default ShelfMeasurements;
