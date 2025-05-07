import { useRef } from "react";
import * as THREE from "three";
import { useConfig } from "../../context/ConfigContext";
import LineWithLabel from "../LineWithLabel";
import ColumnHighlights from "./ColumnHighlights";

interface ShelfModelProps {
  showMeasurements?: boolean;
}

/**
 * Shelf model component that correctly handles different column heights
 */
const ShelfModel1: React.FC<ShelfModelProps> = ({
  showMeasurements = false,
}) => {
  const { config } = useConfig();
  const groupRef = useRef<THREE.Group>(null);

  // Convert dimensions from cm to 3D units
  const width = config.width / 100;
  const height = config.height / 100;
  const depth = config.depth / 100;
  const thickness = config.thickness / 100;

  // Calculate number of columns and rows
  const columns = config.columns;
  const rows = Math.max(1, Math.round((height - thickness) / 0.38));

  // Shelf color
  const shelfColor = "#d4be8d"; // Natural wood color
  const hasBackPanel = config.position === "Suspendu";

  // Helper function to get the height for each column
  const getColumnHeight = (colIndex: number) => {
    if (config.columnHeights && config.columnHeights[colIndex] !== undefined) {
      return config.columnHeights[colIndex] / 100;
    }
    return height;
  };

  // Helper function to get the width for each column
  const getColumnWidth = (colIndex: number) => {
    if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
      return config.columnWidths[colIndex] / 100;
    }
    return config.cellWidth / 100;
  };

  // Tính vị trí cho các vách ngăn dọc (vertical dividers)
  const getVerticalDividers = () => {
    const dividers = [];
    let currentX = -width / 2 + thickness; // Bắt đầu sau vách trái

    for (let col = 0; col < columns - 1; col++) {
      const colWidth = getColumnWidth(col);
      const nextColHeight = getColumnHeight(col + 1);
      const currentColHeight = getColumnHeight(col);

      // Lấy chiều cao lớn nhất giữa hai cột liền kề
      const dividerHeight = Math.max(currentColHeight, nextColHeight);

      // Tính vị trí Y để đáy của vách ngăn luôn ở vị trí cố định
      // Đưa vách ngăn lên phía trên thay vì căn giữa
      const yPosition = -height / 2 + dividerHeight / 2;

      // Tính vị trí X cho vách ngăn
      currentX += colWidth;

      // Thêm vách ngăn dọc với vị trí Y đã điều chỉnh
      dividers.push(
        <mesh
          key={`vertical-divider-${col}`}
          position={[currentX, yPosition, 0]}
        >
          <boxGeometry args={[thickness, dividerHeight, depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>
      );

      currentX += thickness; // Di chuyển đến đầu cột tiếp theo
    }

    return dividers;
  };

  // Tính vị trí cho các vách ngăn ngang (horizontal dividers)
  const getHorizontalDividers = () => {
    const dividers = [];

    // Tạo các kệ ngang cho từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);

      // Tính vị trí X bắt đầu cho cột này
      let startX = -width / 2; // Bắt đầu từ mép trái của kệ
      for (let i = 0; i < col; i++) {
        startX += getColumnWidth(i) + thickness;
      }

      // Tính toán chiều rộng thực tế và vị trí X trung tâm
      let actualWidth = colWidth;
      let colCenterX;

      if (col === 0) {
        // Cột đầu tiên: bao gồm cả vách trái
        actualWidth = colWidth + thickness;
        colCenterX = startX + actualWidth / 2;
      } else if (col === columns - 1) {
        // Cột cuối cùng: bao gồm cả vách phải
        actualWidth = colWidth + thickness;
        colCenterX = startX + colWidth / 2;
      } else {
        // Các cột ở giữa: không thay đổi chiều rộng
        colCenterX = startX + colWidth / 2 + thickness / 2;
      }

      // Tạo các kệ ngang cho cột này
      const colRows = Math.max(1, Math.round((colHeight - thickness) / 0.38));

      // Thêm vách trên cùng nếu chiều cao cột khác với chiều cao chung
      if (colHeight !== height) {
        const topY = -height / 2 + colHeight - thickness / 2;

        dividers.push(
          <mesh key={`horizontal-top-${col}`} position={[colCenterX, topY, 0]}>
            <boxGeometry args={[actualWidth, thickness, depth]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        );
      }

      // Thêm các vách ngang ở giữa
      for (let row = 1; row < colRows; row++) {
        // Tính vị trí Y của kệ ngang - từ đáy lên
        const rowY =
          -height / 2 + thickness + row * ((colHeight - thickness) / colRows);

        dividers.push(
          <mesh
            key={`horizontal-divider-${col}-${row}`}
            position={[colCenterX, rowY, 0]}
          >
            <boxGeometry args={[actualWidth, thickness, depth]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        );
      }
    }

    return dividers;
  };

  // Thêm hàm mới để tạo các vách bên (trái, phải) cho mỗi cột khi có chiều cao khác nhau
  const getSideWalls = () => {
    const walls = [];

    // Duyệt qua từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);

      // Tính vị trí X bắt đầu cho cột
      let startX = -width / 2;
      for (let i = 0; i < col; i++) {
        startX += getColumnWidth(i) + thickness;
      }

      // Chỉ xử lý đặc biệt cho các cột có chiều cao khác với chiều cao tổng thể
      if (colHeight !== height) {
        // Vách bên trái của cột
        if (col === 0) {
          // Đây là cột đầu tiên - cần tạo vách trái đặc biệt cho phần cao hơn
          // Tính chiều cao phần cần thêm
          const extraHeight = colHeight - height;
          // Tính vị trí Y cho vách trái phần mở rộng
          const wallY = -height / 2 + height + extraHeight / 2;

          walls.push(
            <mesh
              key={`left-wall-extended-${col}`}
              position={[startX + thickness / 2, wallY, 0]}
            >
              <boxGeometry args={[thickness, extraHeight, depth]} />
              <meshStandardMaterial color={shelfColor} />
            </mesh>
          );
        }

        // Vách bên phải của cột
        const rightWallX = startX + colWidth + thickness / 2;

        // Xác định chiều cao của vách phải
        let rightWallHeight = colHeight;
        let rightWallY = -height / 2 + colHeight / 2;

        // Nếu không phải là cột cuối, cần kiểm tra chiều cao của cột bên cạnh
        if (col < columns - 1) {
          const nextColHeight = getColumnHeight(col + 1);
          // Nếu cột bên cạnh thấp hơn, chỉ cần tạo phần chênh lệch
          if (colHeight > nextColHeight) {
            rightWallHeight = colHeight - nextColHeight;
            rightWallY = -height / 2 + nextColHeight + rightWallHeight / 2;
          } else {
            // Nếu cột bên cạnh cao hơn hoặc bằng, không cần vách phải mới
            continue;
          }
        }

        // Thêm vách phải nếu cần
        if (rightWallHeight > 0) {
          // Nếu là cột cuối cùng, chỉ tạo phần mở rộng của vách phải
          if (col === columns - 1) {
            // Chỉ thêm phần vách phải mở rộng nếu chiều cao cột lớn hơn chiều cao khung
            if (colHeight > height) {
              const extraHeight = colHeight - height;
              const extraWallY = -height / 2 + height + extraHeight / 2;

              walls.push(
                <mesh
                  key={`right-wall-extended-${col}`}
                  position={[rightWallX, extraWallY, 0]}
                >
                  <boxGeometry args={[thickness, extraHeight, depth]} />
                  <meshStandardMaterial color={shelfColor} />
                </mesh>
              );
            }
          } else {
            // Cho các cột không phải cột cuối
            walls.push(
              <mesh
                key={`right-wall-${col}`}
                position={[rightWallX, rightWallY, 0]}
              >
                <boxGeometry args={[thickness, rightWallHeight, depth]} />
                <meshStandardMaterial color={shelfColor} />
              </mesh>
            );
          }
        }
      }
    }

    return walls;
  };

  // Thêm hàm tạo vách sau cho các cột có chiều cao khác nhau
  const getBackWalls = () => {
    // Nếu không cần vách sau, trả về mảng rỗng
    if (!hasBackPanel) return [];

    const backWalls = [];

    // Duyệt qua từng cột
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);

      // Chỉ xử lý cho các cột có chiều cao khác với chiều cao tổng thể
      if (colHeight !== height && colHeight > height) {
        // Tính vị trí X bắt đầu cho cột
        let startX = -width / 2;
        for (let i = 0; i < col; i++) {
          startX += getColumnWidth(i) + thickness;
        }

        // Tính toán kích thước và vị trí
        const extraHeight = colHeight - height;
        const backWallY = -height / 2 + height + extraHeight / 2;
        const backWallX = startX + colWidth / 2 + thickness / 2;

        backWalls.push(
          <mesh
            key={`back-wall-extended-${col}`}
            position={[backWallX, backWallY, -depth / 2 + thickness / 2]}
          >
            <boxGeometry args={[colWidth, extraHeight, thickness]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        );
      }
    }

    return backWalls;
  };

  return (
    <group ref={groupRef}>
      {/* Khung ngoài và các vách ngăn */}
      <group>
        {/* Khung ngoài - chỉ hiển thị khung mờ để tham khảo */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={shelfColor} transparent opacity={0.1} />
        </mesh>

        {/* Vách trên */}
        <mesh position={[0, height / 2 - thickness / 2, 0]}>
          <boxGeometry args={[width, thickness, depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>

        {/* Vách dưới */}
        <mesh position={[0, -height / 2 + thickness / 2, 0]}>
          <boxGeometry args={[width, thickness, depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>

        {/* Vách trái */}
        <mesh position={[-width / 2 + thickness / 2, 0, 0]}>
          <boxGeometry args={[thickness, height, depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>

        {/* Vách phải */}
        <mesh position={[width / 2 - thickness / 2, 0, 0]}>
          <boxGeometry args={[thickness, height, depth]} />
          <meshStandardMaterial color={shelfColor} />
        </mesh>

        {/* Vách sau (nếu cần) */}
        {hasBackPanel && (
          <mesh position={[0, 0, -depth / 2 + thickness / 2]}>
            <boxGeometry args={[width, height, thickness]} />
            <meshStandardMaterial color={shelfColor} />
          </mesh>
        )}

        {/* Các vách ngăn dọc */}
        {getVerticalDividers()}

        {/* Các vách ngăn ngang */}
        {getHorizontalDividers()}

        {/* Các vách bên cho cột có chiều cao khác */}
        {getSideWalls()}

        {/* Các vách sau cho cột có chiều cao khác */}
        {getBackWalls()}
      </group>

      {/* Measurement lines */}
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

export default ShelfModel1;
