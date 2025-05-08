import { useMemo } from "react";
import { useConfig } from "../components/context/ConfigContext";

export const useShelfDimensions = () => {
  const { config } = useConfig();
  return useMemo(() => {
    // Convert dimensions from cm to 3D units
    const width = config.width / 100;
    const height = config.height / 100;
    const depth = config.depth / 100;
    const thickness = config.thickness / 100;

    // Calculate number of columns and rows
    const columns = config.columns;
    const rows = Math.max(1, Math.round((height - thickness) / 0.38));

    return {
      width,
      height,
      depth,
      thickness,
      columns,
      rows,
      shelfColor: "#d4be8d", // Natural wood color
      hasBackPanel: config.position === "Suspendu",
    };
  }, [config]);
};
