import { useRef } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

import LineWithLabel from "../LineWithLabel";
import ColumnHighlights from "./ColumnHighlights";
import ShelfHighlights from "./ShelfHighlights/ShelfHighlights";
import OuterFrame from "./OuterFrame";
import VerticalDividers from "./VerticalDividers";
import HorizontalShelves from "./HorizontalShelves";
import { useShelfCalculations } from "../../../hooks/useShelfCalculations";

interface ShelfModelProps {
  showMeasurements?: boolean;
}

/**
 * Kệ sách có thể tùy chỉnh số hàng, cột và kích thước từng cột
 * Phiên bản đã sửa để phản ánh cách đóng kệ thực tế:
 * - Tấm dọc: chiều cao = chiều cao ô + độ dày của 2 tấm ngang
 * - Tấm ngang: nằm giữa các tấm dọc
 */
const ShelfModel: React.FC<ShelfModelProps> = ({
  showMeasurements = false,
}) => {
  const { config } = useConfig();
  const groupRef = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, config.texture.src);

  // Get shelf calculations from custom hook
  const {
    height,
    depth,
    thickness,
    columns,
    rows,

    cellHeight,
    hasBackPanel,
    standardHeight,
    shelfBottomY,
    totalWidth,
    getColumnHeight,
    getColumnWidth,
    getColumnXPosition,
  } = useShelfCalculations();

  // Đảm bảo texture được cập nhật khi component unmount

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
          hasBackPanel={hasBackPanel}
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
    </group>
  );
};

export default ShelfModel;
