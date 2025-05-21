import { useRef } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

import LineWithLabel from "../LineWithLabel";
import ColumnHighlights from "./highlights/ColumnHighlights";
import ShelfHighlights from "./highlights/ShelfHighlights/ShelfHighlights";
import OuterFrame from "./OuterFrame";
import VerticalDividers from "./VerticalDividers";
import HorizontalShelves from "./HorizontalShelves";
import { useShelfCalculations } from "../../../hooks/useShelfCalculations";
import BackboardHighlights from "./highlights/BackboardHighlights";
import ShelfFeet from "./ShelfFeet";
import FacadeHighlights from "./highlights/FacadeHighlights";

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
    height,
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
        <OuterFrame
          columns={columns}
          depth={depth}
          cellHeight={cellHeight}
          thickness={thickness}
          totalWidth={totalWidth}
          shelfBottomY={shelfBottomY}
          texture={texture}
          getColumnHeight={getColumnHeight}
          getColumnWidth={getColumnWidth}
          getColumnXPosition={getColumnXPosition}
        />

        <VerticalDividers
          columns={columns}
          depth={depth}
          thickness={thickness}
          shelfBottomY={shelfBottomY}
          texture={texture}
          getColumnHeight={getColumnHeight}
          getColumnXPosition={getColumnXPosition}
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
          {/* Width measurement */}
          <LineWithLabel
            start={[-totalWidth / 2, shelfBottomY - 0.1, 0]}
            end={[totalWidth / 2, shelfBottomY - 0.1, 0]}
            label={`${config.width}cm`}
          />

          {/* Height measurement */}
          <LineWithLabel
            start={[totalWidth / 2 + 0.1, shelfBottomY, 0]}
            end={[totalWidth / 2 + 0.1, shelfBottomY + height, 0]}
            label={`${config.height}cm`}
          />

          {/* Depth measurement */}
          <LineWithLabel
            start={[totalWidth / 2 + 0.1, shelfBottomY, 0]}
            end={[totalWidth / 2 + 0.1, shelfBottomY, -depth]}
            label={`${config.depth}cm`}
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

      {/* Backboard highlights */}
      <BackboardHighlights />

      {/* Facade highlights */}
      <FacadeHighlights />
    </group>
  );
};

export default ShelfModel;
