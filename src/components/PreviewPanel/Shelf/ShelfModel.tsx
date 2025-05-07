import { useRef } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import LineWithLabel from "../LineWithLabel";
import ColumnHighlights from "./ColumnHighlights";

interface ShelfModelProps {
  showMeasurements?: boolean;
}

const ShelfModel: React.FC<ShelfModelProps> = ({
  showMeasurements = false,
}) => {
  const { config } = useConfig();
  const meshRef = useRef<THREE.Mesh>(null);

  // Tính toán kích thước kệ dựa vào config
  const width = config.width / 100; // Chuyển từ cm sang đơn vị 3D
  const height = config.height / 100;
  const depth = config.depth / 100;

  // Độ dày của vách ngăn
  const thickness = config.thickness / 100; // Chuyển từ cm sang đơn vị 3D

  // Số cột và số hàng
  const columns = config.columns;
  const rows = Math.max(1, Math.round((height - thickness) / 0.38));

  // Tạo màu dựa trên loại kệ
  const shelfColor = "#d4be8d"; // Màu gỗ tự nhiên
  const hasBackPanel = config.position === "Suspendu"; // Chỉ có kệ sau nếu là "Suspendu"

  // THÊM MỚI: Hàm để lấy chiều cao cho mỗi cột
  const getColumnHeight = (colIndex: number) => {
    // Nếu có chiều cao riêng cho cột này, sử dụng nó
    if (config.columnHeights && config.columnHeights[colIndex] !== undefined) {
      return config.columnHeights[colIndex] / 100; // Chuyển từ cm sang đơn vị 3D
    }
    // Nếu không, sử dụng chiều cao chung
    return height;
  };

  // THÊM MỚI: Tính chiều rộng thực của mỗi ô
  const totalWallWidth = thickness * (columns + 1);
  const defaultCellWidth = (width - totalWallWidth) / columns;

  // THÊM MỚI: Hàm để lấy chiều rộng cho mỗi cột
  const getColumnWidth = (colIndex: number) => {
    // Nếu có chiều rộng riêng cho cột này, sử dụng nó
    if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
      return config.columnWidths[colIndex] / 100; // Chuyển từ cm sang đơn vị 3D
    }
    // Nếu không, sử dụng chiều rộng mặc định
    return defaultCellWidth;
  };

  // THÊM MỚI: Tính vị trí X cho các vách ngăn dọc
  const getVerticalWallPositions = () => {
    const positions = [];
    let currentX = -width / 2 + thickness; // Bắt đầu sau vách trái

    for (let i = 0; i < columns - 1; i++) {
      // Thêm vị trí vách sau mỗi cột
      currentX += getColumnWidth(i);
      positions.push(currentX);
      currentX += thickness; // Thêm độ dày vách
    }

    return positions;
  };

  const verticalWallPositions = getVerticalWallPositions();

  return (
    <group ref={meshRef}>
      {/* Khung ngoài */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={shelfColor} transparent opacity={0.1} />
      </mesh>

      {/* THAY ĐỔI: Vách ngăn dọc - sử dụng vị trí tính từ hàm getVerticalWallPositions */}
      {verticalWallPositions.map((posX, i) => (
        <mesh key={`vertical-${i}`} position={[posX, 0, 0]}>
          <boxGeometry args={[thickness, getColumnHeight(i), depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>
      ))}

      {/* Vách ngăn ngang */}
      {Array(rows - 1)
        .fill(0)
        .map((_, i) => (
          <mesh
            key={`horizontal-${i}`}
            position={[0, -height / 2 + (i + 1) * (height / rows), 0]}
          >
            <boxGeometry args={[width, thickness, depth]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        ))}

      {/* Mặt sau - chỉ hiển thị khi là "Suspendu" */}
      {hasBackPanel && (
        <mesh position={[0, 0, -depth / 2]}>
          <boxGeometry args={[width, height, thickness]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>
      )}

      {/* Mặt trên */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>

      {/* Mặt dưới */}
      <mesh position={[0, -height / 2, 0]}>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>

      {/* Mặt trái */}
      <mesh position={[-width / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>

      {/* Mặt phải */}
      <mesh position={[width / 2, 0, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial color={shelfColor} />
      </mesh>

      {/* Thêm phần đo lường khi showMeasurements = true */}
      {showMeasurements && (
        <group>
          {/* Đo chiều rộng */}
          <LineWithLabel
            start={[-width / 2, height / 2 + 0.1, 0]}
            end={[width / 2, height / 2 + 0.1, 0]}
            label={`${config.width} cm`}
            color="#FF0000"
          />

          {/* Đo chiều cao */}
          <LineWithLabel
            start={[width / 2 + 0.1, -height / 2, 0]}
            end={[width / 2 + 0.1, height / 2, 0]}
            label={`${config.height} cm`}
            color="#0000FF"
          />

          {/* Đo chiều sâu */}
          <LineWithLabel
            start={[width / 2, height / 2, -depth / 2]}
            end={[width / 2, height / 2, depth / 2]}
            label={`${config.depth} cm`}
            color="#00AA00"
          />
        </group>
      )}

      {/* ColumnHighlights */}
      <ColumnHighlights
        width={width}
        height={height}
        depth={depth}
        thickness={thickness}
        columns={columns}
        rows={rows}
      />
    </group>
  );
};

export default ShelfModel;
