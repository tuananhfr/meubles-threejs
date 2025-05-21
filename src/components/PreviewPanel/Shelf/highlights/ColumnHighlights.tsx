import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";

const ColumnHighlights: React.FC<ColumnHighlightsProps> = ({
  width,
  height,
  depth,
  thickness,
  columns,
}) => {
  const { config, updateConfig } = useConfig();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  // Chuyển đổi cellWidth và cellHeight sang đơn vị 3D
  const cellWidth = config.cellWidth / 100;
  const cellHeight = config.cellHeight / 100;

  // Vị trí đáy của kệ (cố định cho mọi cột)
  const shelfBottomY = -height / 2;

  // Helper function để lấy chiều cao thực tế của mỗi cột
  const getColumnHeight = (colIndex: number) => {
    if (config.columnHeights && config.columnHeights[colIndex] !== undefined) {
      return config.columnHeights[colIndex] / 100;
    }
    return height; // Sử dụng trực tiếp height từ props
  };

  // Helper function để lấy chiều rộng thực tế của mỗi cột
  const getColumnWidth = (colIndex: number) => {
    if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
      return config.columnWidths[colIndex] / 100;
    }
    return cellWidth;
  };

  // Helper function để tính vị trí X của mỗi cột
  const getColumnXPosition = (colIndex: number) => {
    let startX = -width / 2;
    for (let i = 0; i < colIndex; i++) {
      startX += getColumnWidth(i) + thickness;
    }
    return startX;
  };

  // Hàm tạo vị trí highlight và icon cho từng cột
  const getColumnPositions = () => {
    const positions = [];

    // Tính toán vị trí cho từng cột
    for (let i = 0; i < columns; i++) {
      const colWidth = getColumnWidth(i);
      const colHeight = getColumnHeight(i);
      const startX = getColumnXPosition(i);

      // Tính vị trí x ở giữa cột
      const centerX = startX + colWidth / 2 + thickness / 2;

      // Tính vị trí y dựa trên chiều cao thực tế
      // Đáy cột cố định ở shelfBottomY, phần trên mở rộng lên
      const centerY = shelfBottomY + colHeight / 2;

      // Tính vị trí icon ở giữa cột
      // Sử dụng số hàng (rows) để chia đều chiều cao cột
      const actualRows = Math.max(
        1,
        Math.floor((colHeight - thickness) / (cellHeight + thickness))
      );
      const shelfSpacing = colHeight / actualRows;
      const iconY = shelfBottomY + (actualRows / 2) * shelfSpacing;

      positions.push({
        col: i,
        x: centerX,
        y: centerY,
        iconY: iconY,
        width: colWidth,
        height: colHeight,
      });
    }

    return positions;
  };

  const columnPositions = getColumnPositions();

  // Xử lý khi nhấp vào cột
  const handleColumnClick = (colIndex: number) => {
    setSelectedColumn((prevSelected) => {
      if (prevSelected === colIndex) {
        updateConfig("editColumns", {
          ...config.editColumns,
          isOpenOption: false,
          isOpenEditHeight: false,
          selectedColumnInfo: null,
        });
        return null;
      }

      // Lấy thông tin chi tiết về cột được chọn
      const position = columnPositions[colIndex];
      const columnInfo: ColumnInfo = {
        index: colIndex,
        width: position.width * 100, // Chuyển về cm
        height: position.height * 100, // Chuyển về cm
        depth: depth * 100, // Chuyển về cm
        position: {
          x: position.x * 100, // Chuyển về cm
          y: 0,
          z: 0,
        },
      };

      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenOption: true,
        selectedColumnInfo: columnInfo,
      });

      return colIndex;
    });
  };

  // Xử lý sự kiện hover
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const x = event.point.x;
    let hoveredCol = null;

    // Kiểm tra xem pointer có nằm trong phạm vi của cột nào không
    for (let i = 0; i < columnPositions.length; i++) {
      const pos = columnPositions[i];
      const halfWidth = pos.width / 2;
      const columnStartX = pos.x - halfWidth - thickness / 2;
      const columnEndX = pos.x + halfWidth + thickness / 2;

      if (x >= columnStartX && x <= columnEndX) {
        hoveredCol = i;
        break;
      }
    }

    if (hoveredCol !== hoveredColumn) {
      setHoveredColumn(hoveredCol);
      document.body.style.cursor = hoveredCol !== null ? "pointer" : "auto";
    }
  };

  // Reset khi pointer rời khỏi kệ
  const handlePointerLeave = () => {
    setHoveredColumn(null);
    document.body.style.cursor = "auto";
  };

  // Reset selected column khi menu đóng
  useEffect(() => {
    if (!config.editColumns.isOpenMenu) {
      setSelectedColumn(null);
      setHoveredColumn(null);
      document.body.style.cursor = "auto";

      if (config.editColumns.isOpenOption) {
        updateConfig("editColumns", {
          ...config.editColumns,
          isOpenOption: false,
          selectedColumnInfo: null,
          isOpenEditHeight: false,
          isOpenEditWidth: false,
          isOpenEditDuplicate: false,
          isOpenEditDelete: false,
        });
      }
    } else if (
      !config.editColumns.isOpenOption &&
      config.editColumns.selectedColumnInfo === null
    ) {
      // Nếu menu mở nhưng không có cột nào được chọn, reset selectedColumn
      setSelectedColumn(null);
      setHoveredColumn(null);
      document.body.style.cursor = "auto";
    }
  }, [
    config.editColumns,
    config.editColumns.isOpenMenu,
    config.editColumns.isOpenOption,
    updateConfig,
  ]);

  // Chỉ hiển thị khi menu đang mở
  if (!config.editColumns.isOpenMenu) {
    return null;
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Highlight cho mỗi cột */}
      {columnPositions.map((pos, index) => (
        <mesh
          key={`column-highlight-${index}`}
          position={[pos.x, pos.y, 0]}
          onClick={(e) => {
            handleColumnClick(pos.col);
            e.stopPropagation();
          }}
        >
          <boxGeometry args={[pos.width + thickness, pos.height, depth]} />
          <meshBasicMaterial
            color={selectedColumn === pos.col ? "#d4f5d4" : "#e6f7f9"}
            transparent
            opacity={
              hoveredColumn === index || selectedColumn === pos.col ? 0.5 : 0
            }
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      ))}

      {/* Biểu tượng "+" hoặc "✓" */}
      {columnPositions.map((pos, index) => (
        <group
          key={`add-icon-${index}`}
          position={[pos.x, pos.iconY, depth / 2 + 0.01]}
        >
          <mesh>
            <circleGeometry args={[0.05, 32]} />
            <meshBasicMaterial color="white" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            color={selectedColumn === pos.col ? "#4CAF50" : "#17a2b8"}
            fontSize={0.06}
            anchorX="center"
            anchorY="middle"
          >
            {selectedColumn === pos.col ? "✓" : "+"}
          </Text>
        </group>
      ))}
    </group>
  );
};

export default ColumnHighlights;
