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

  // Tính chiều cao thực tế của cell trong một cột
  const getActualCellHeight = (col: number): number => {
    const colHeight = getColumnHeight(col);
    const usableHeight = colHeight - thickness;
    const cellCount = getCellCountInColumn(col);

    // Chiều cao thực tế của mỗi cell (không bao gồm thickness của shelf)
    return (usableHeight - thickness - (cellCount - 1) * thickness) / cellCount;
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

    // 3. CHIỀU CAO CỦA TỪNG CELL THEO CỘT
    for (let col = 0; col < columns; col++) {
      const colX = getColumnXPosition(col);

      // Đặt measurement X ở giữa shelf, không lệch ra ngoài
      const measurementX = colX;
      const cellCount = getCellCountInColumn(col);
      const actualCellHeight = getActualCellHeight(col);

      // Hiển thị chiều cao của từng cell trong cột
      for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
        // Kiểm tra xem shelf này có bị removed không
        if (!isRemovedShelf(cellIndex + 1, col)) {
          // +1 vì row 0 là đáy
          const cellStartY =
            shelfBottomY +
            thickness +
            cellIndex * (actualCellHeight + thickness);
          const cellEndY = cellStartY + actualCellHeight;

          measurements.push(
            <LineWithLabel
              key={`cell-height-${col}-${cellIndex}`}
              start={[measurementX, cellStartY, depth / 2]}
              end={[measurementX, cellEndY, depth / 2]}
              label={`${(actualCellHeight * 100).toFixed(0)} cm`}
              color="#ffffff"
              backgroundColor="#1a1a1a"
            />
          );
        }
      }
    }

    return measurements;
  };

  return <group>{renderShelfMeasurements()}</group>;
};

export default ShelfMeasurements;
