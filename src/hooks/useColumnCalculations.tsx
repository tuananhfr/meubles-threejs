import { useMemo } from "react";

import { useConfig } from "../components/context/ConfigContext";

export const useColumnCalculations = (): ColumnCalculations => {
  const { config } = useConfig();

  const { width, thickness, height } = config;

  return useMemo(() => {
    // Helper function to get the height for each column
    const getColumnHeight = (colIndex: number): number => {
      if (
        config.columnHeights &&
        config.columnHeights[colIndex] !== undefined
      ) {
        return config.columnHeights[colIndex] / 100;
      }
      return height;
    };

    // Helper function to get the width for each column
    const getColumnWidth = (colIndex: number): number => {
      if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
        return config.columnWidths[colIndex] / 100;
      }
      return config.cellWidth / 100;
    };

    // Calculate start X position for each column
    const getColumnStartX = (colIndex: number): number => {
      let startX = -width / 2;
      for (let i = 0; i < colIndex; i++) {
        startX += getColumnWidth(i) + thickness;
      }
      return startX;
    };

    return {
      getColumnHeight,
      getColumnWidth,
      getColumnStartX,
    };
  }, [
    config.cellWidth,
    config.columnHeights,
    config.columnWidths,
    height,
    thickness,
    width,
  ]);
};
