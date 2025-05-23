import { useRef } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

import ColumnHighlights from "./highlights/ColumnHighlights";
import ShelfHighlights from "./highlights/ShelfHighlights/ShelfHighlights";
import VerticalDividers from "./VerticalDividers";
import HorizontalShelves from "./HorizontalShelves";
import { useShelfCalculations } from "../../../hooks/useShelfCalculations";
import BackboardHighlights from "./highlights/BackboardHighlights";
import ShelfFeet from "./ShelfFeet";
import FacadeHighlights from "./highlights/FacadeHighlights";
import VerticalPanelsHighlights from "./highlights/VerticalPanelsHighlights";
import FacadePanels from "./FacadePanels";
import BackPanels from "./BackPanels";
import ShelfMeasurements from "./ShelfMeasurements";

interface ShelfModelProps {
  showMeasurements?: boolean;
}

/**
 * Kệ sách có thể tùy chỉnh số hàng, cột và kích thước từng cột

 */
const ShelfModel: React.FC<ShelfModelProps> = ({
  showMeasurements = false,
}) => {
  const { config } = useConfig();
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, config.texture.src);

  const {
    depth,
    thickness,
    columns,
    rows,

    cellHeight,

    standardHeight,
    shelfBottomY,
    totalWidth,
    getColumnHeight,
    getColumnWidth,
    getColumnXPosition,
  } = useShelfCalculations();

  return (
    <group ref={groupRef}>
      {/* Toàn bộ kệ sách */}
      <group>
        <BackPanels
          columns={columns}
          depth={depth}
          cellHeight={cellHeight}
          thickness={thickness}
          totalWidth={totalWidth}
          shelfBottomY={shelfBottomY}
          getColumnHeight={getColumnHeight}
          getColumnWidth={getColumnWidth}
          getColumnXPosition={getColumnXPosition}
        />

        <FacadePanels depth={depth} thickness={thickness} texture={texture} />

        <VerticalDividers
          columns={columns}
          depth={depth}
          thickness={thickness}
          shelfBottomY={shelfBottomY}
          texture={texture}
          getColumnHeight={getColumnHeight}
          getColumnXPosition={getColumnXPosition}
          getColumnWidth={getColumnWidth}
          totalWidth={totalWidth}
        />

        <HorizontalShelves
          columns={columns}
          rows={rows}
          depth={depth}
          thickness={thickness}
          cellHeight={cellHeight}
          shelfBottomY={shelfBottomY}
          texture={texture}
          getColumnHeight={getColumnHeight}
          getColumnWidth={getColumnWidth}
          getColumnXPosition={getColumnXPosition}
        />

        {/* Chân kệ */}
        <ShelfFeet
          totalWidth={totalWidth}
          depth={depth}
          shelfBottomY={shelfBottomY}
          texture={texture}
        />
      </group>

      {/* Measurements (when enabled) */}
      {showMeasurements && (
        <group>
          <ShelfMeasurements
            columns={columns}
            depth={depth}
            thickness={thickness}
            cellHeight={cellHeight}
            shelfBottomY={shelfBottomY}
            getColumnHeight={getColumnHeight}
            getColumnWidth={getColumnWidth}
            getColumnXPosition={getColumnXPosition}
          />
        </group>
      )}

      {/* Column highlights */}
      <ColumnHighlights
        width={totalWidth}
        height={standardHeight}
        depth={depth}
        thickness={thickness}
        columns={columns}
        rows={rows}
      />

      {/* Shelf highlights */}
      <ShelfHighlights
        width={totalWidth}
        height={standardHeight}
        depth={depth}
        thickness={thickness}
        columns={columns}
        rows={rows}
      />

      <VerticalPanelsHighlights />

      {/* Backboard highlights */}
      <BackboardHighlights />

      {/* Facade highlights */}
      <FacadeHighlights />
    </group>
  );
};

export default ShelfModel;
