import { useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

import { useConfig } from "../../context/ConfigContext";
import LineWithLabel from "../LineWithLabel";
import ColumnHighlights from "./ColumnHighlights";
import { useLoader } from "@react-three/fiber";
import textureUrl from "../../../assets/images/samples-oak-wood-effect-800x800.jpg";
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

  // Màu sắc kệ
  const texture = useLoader(TextureLoader, textureUrl);

  const hasBackPanel = config.position === "Suspendu";

  // Tính toán chiều cao chuẩn dựa trên số hàng, cellHeight và thickness
  const standardHeight = rows * cellHeight + (rows + 1) * thickness;

  // Vị trí đáy của kệ (cố định cho mọi cột)
  const shelfBottomY = -standardHeight / 2;

  // Tính toán tổng chiều rộng thực tế của tất cả các cột
  const calculateTotalWidth = () => {
    let totalWidth = 0;
    for (let i = 0; i < columns; i++) {
      totalWidth += getColumnWidth(i);
    }
    // Cộng thêm (columns + 1) lần thickness cho các vách ngăn dọc
    totalWidth += (columns + 1) * thickness;
    return totalWidth;
  };

  // Helper function để lấy chiều cao thực tế của mỗi cột
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

  // Helper function để tính vị trí X của mỗi cột
  const getColumnXPosition = (colIndex: number) => {
    // Tính tổng chiều rộng thực tế của kệ
    const totalWidth = calculateTotalWidth();

    // Vị trí bắt đầu của kệ (căn giữa)
    const startX = -totalWidth / 2;

    // Tính vị trí X của cột dựa trên độ dịch từ điểm bắt đầu
    let positionX = startX;
    for (let i = 0; i < colIndex; i++) {
      positionX += getColumnWidth(i) + thickness;
    }

    return positionX;
  };

  // 1. Vẽ khung ngoài và các vách đặc biệt cho từng cột
  const renderOuterFrame = () => {
    const frames = [];

    // Tính tổng chiều rộng thực tế
    const totalWidth = calculateTotalWidth();

    // Vị trí bắt đầu của kệ (căn giữa)
    const startX = -totalWidth / 2;

    // Vẽ các thành phần cho từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);

      // Tính vị trí X của cột hiện tại
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;

      // Vách trái (chỉ vẽ cho cột đầu tiên)
      if (col === 0) {
        frames.push(
          <mesh
            key="left-wall"
            position={[startX + thickness / 2, shelfBottomY + colHeight / 2, 0]}
          >
            <boxGeometry args={[thickness, colHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }

      // Vách phải (chỉ vẽ cho cột cuối cùng)
      if (col === columns - 1) {
        frames.push(
          <mesh
            key="right-wall"
            position={[
              colX + colWidth + thickness / 2,
              shelfBottomY + colHeight / 2,
              0,
            ]}
          >
            <boxGeometry args={[thickness, colHeight, depth]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }

      // Vách trên cho cột này
      frames.push(
        <mesh
          key={`top-wall-${col}`}
          position={[centerX, shelfBottomY + colHeight - thickness / 2, 0]}
        >
          <boxGeometry args={[colWidth + thickness, thickness, depth]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        </mesh>
      );

      // Vách đáy cho cột này (luôn ở vị trí cố định)
      frames.push(
        <mesh
          key={`bottom-wall-${col}`}
          position={[centerX, shelfBottomY + thickness / 2, 0]}
        >
          <boxGeometry args={[colWidth + thickness, thickness, depth]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        </mesh>
      );

      // Vách sau cho cột này nếu cần
      if (hasBackPanel) {
        frames.push(
          <mesh
            key={`back-wall-${col}`}
            position={[
              centerX,
              shelfBottomY + colHeight / 2,
              -depth / 2 + thickness / 2,
            ]}
          >
            <boxGeometry args={[colWidth + thickness, colHeight, thickness]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        );
      }
    }

    return frames;
  };

  // 2. Vẽ các vách ngăn dọc bên trong
  const renderVerticalDividers = () => {
    const dividers = [];

    // Vẽ vách ngăn dọc giữa các cột
    for (let col = 1; col < columns; col++) {
      const prevColHeight = getColumnHeight(col - 1);
      const currentColHeight = getColumnHeight(col);

      // Lấy chiều cao lớn nhất để vẽ vách ngăn
      const dividerHeight = Math.max(prevColHeight, currentColHeight);

      // Tính vị trí X dựa trên chiều rộng thực tế của các cột trước đó
      const dividerX = getColumnXPosition(col);

      // Thêm vách ngăn dọc
      dividers.push(
        <mesh
          key={`vertical-divider-${col}`}
          position={[dividerX, shelfBottomY + dividerHeight / 2, 0]}
        >
          <boxGeometry args={[thickness, dividerHeight, depth]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        </mesh>
      );
    }

    return dividers;
  };

  // 3. Vẽ các kệ ngang bên trong từng cột
  const renderHorizontalShelves = () => {
    const shelves = [];

    // Vẽ kệ ngang cho từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;

      // Khoảng cách giữa các kệ ngang
      const shelfSpacing = cellHeight + thickness;

      // Tính số hàng thực tế dựa trên chiều cao của cột
      // Đảm bảo có đủ chỗ cho các kệ ngang và các ô 36cm
      const actualRows = Math.max(
        1,
        Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
      );

      // Vẽ kệ ngang ở giữa (bỏ qua kệ trên và kệ dưới đã vẽ)
      for (let row = 1; row < actualRows; row++) {
        // Vị trí Y bắt đầu từ đáy lên
        const rowY = shelfBottomY + thickness + row * shelfSpacing;

        // Chỉ vẽ kệ nếu nằm trong phạm vi chiều cao của cột
        if (rowY < shelfBottomY + colHeight - thickness) {
          shelves.push(
            <mesh
              key={`horizontal-shelf-${col}-${row}`}
              position={[centerX, rowY, 0]}
            >
              <boxGeometry args={[colWidth + thickness, thickness, depth]} />
              <meshStandardMaterial
                map={texture}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          );
        }
      }
    }

    return shelves;
  };

  // Tính toán tổng chiều rộng thực tế để cập nhật tỷ lệ
  const totalWidth = calculateTotalWidth();

  return (
    <group ref={groupRef}>
      {/* Toàn bộ kệ sách */}
      <group>
        {/* Khung ngoài của kệ */}
        {renderOuterFrame()}

        {/* Các vách ngăn dọc bên trong */}
        {renderVerticalDividers()}

        {/* Các kệ ngang bên trong */}
        {renderHorizontalShelves()}
      </group>

      {/* Measurements (when enabled) */}
      {showMeasurements && (
        <group>
          <LineWithLabel
            start={[-totalWidth / 2, shelfBottomY + height + 0.1, 0]}
            end={[totalWidth / 2, shelfBottomY + height + 0.1, 0]}
            label={`${Math.round(totalWidth * 100)} cm`}
            color="#FF0000"
          />
          <LineWithLabel
            start={[totalWidth / 2 + 0.1, shelfBottomY, 0]}
            end={[totalWidth / 2 + 0.1, shelfBottomY + height, 0]}
            label={`${config.height} cm`}
            color="#0000FF"
          />
          <LineWithLabel
            start={[totalWidth / 2, shelfBottomY + height, -depth / 2]}
            end={[totalWidth / 2, shelfBottomY + height, depth / 2]}
            label={`${config.depth} cm`}
            color="#00AA00"
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
    </group>
  );
};

export default ShelfModel;
