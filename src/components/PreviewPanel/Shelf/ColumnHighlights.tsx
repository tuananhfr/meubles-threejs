import { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../context/ConfigContext";

interface ColumnInfo {
  index: number;
  width: number;
  height: number;
  depth: number;
  position: { x: number; y: number; z: number };
}

const ColumnHighlights: React.FC<ColumnHighlightsProps> = ({
  width,
  height,
  depth,
  thickness,
  columns,
  rows,
}) => {
  const { config, updateConfig } = useConfig();
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  // Tính kích thước thực của mỗi ô
  const totalWallWidth = thickness * (columns + 1);
  const cellWidth = (width - totalWallWidth) / columns;
  const cellHeight = height / rows;

  // Xác định vị trí các biểu tượng thêm
  const getAddIconPositions = () => {
    const positions = [];

    // Vị trí bắt đầu của kệ
    const startX = -width / 2;

    // Thêm biểu tượng cho mỗi cột
    for (let i = 0; i < columns; i++) {
      // Tính vị trí x chính xác ở giữa mỗi ô
      const x =
        startX + thickness + i * (cellWidth + thickness) + cellWidth / 2;

      // Xử lý vị trí y dựa trên rows (số ô theo chiều dọc)
      let y;

      // Kiểm tra số ô trong hàng dọc là chẵn hay lẻ
      if (rows % 2 === 0) {
        // Số ô chẵn - đặt giữa 2 ô ở giữa
        const middleWallY = -height / 2 + (rows / 2) * cellHeight;
        y = middleWallY; // Đặt trên vách ngăn giữa ô 3 và 4 (nếu có 6 ô)
      } else {
        // Số ô lẻ - đặt ở giữa ô giữa
        const middleRow = Math.floor(rows / 2);
        y = -height / 2 + (middleRow + 0.5) * cellHeight;
      }

      // Thêm vị trí biểu tượng vào mảng kết quả
      positions.push({
        col: i,
        row: rows % 2 === 0 ? rows / 2 - 0.5 : Math.floor(rows / 2),
        x,
        y,
      });
    }

    return positions;
  };

  const addIconPositions = getAddIconPositions();

  // Cập nhật hàm xử lý khi nhấp vào cột để chỉ chọn một cột và lưu thông tin về cột
  const handleColumnClick = (colIndex: number) => {
    setSelectedColumn((prevSelected) => {
      // Nếu cột đang được chọn, hủy chọn (trả về null)
      if (prevSelected === colIndex) {
        updateConfig("editColumns", {
          ...config.editColumns,
          isOpenOption: false,
          selectedColumnInfo: null,
        });

        return null;
      }

      // Lấy thông tin về cột được chọn
      const columnInfo: ColumnInfo = {
        index: colIndex,
        width: cellWidth * 100, // Chuyển về cm
        height: height * 100, // Chuyển về cm
        depth: depth * 100, // Chuyển về cm
        position: {
          x: addIconPositions[colIndex].x * 100, // Chuyển về cm
          y: 0,
          z: 0,
        },
      };

      // Nếu không, chọn cột mới và lưu thông tin về cột
      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenOption: true,
        selectedColumnInfo: columnInfo,
      });

      return colIndex;
    });
  };

  // xử lý để đảm bảo sự kiện hover hoạt động nhất quán
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    // Kiểm tra nếu tọa độ chuột nằm trong phạm vi của cột nào
    const x = event.point.x;
    let hoveredCol = null;

    for (let i = 0; i < addIconPositions.length; i++) {
      const pos = addIconPositions[i];
      const columnStartX = pos.x - cellWidth / 2;
      const columnEndX = pos.x + cellWidth / 2;

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

  // đặt lại khi chuột rời khỏi kệ
  const handlePointerLeave = () => {
    setHoveredColumn(null);
    document.body.style.cursor = "auto";
  };

  // Reset selected column when menu is closed
  useEffect(() => {
    if (!config.editColumns.isOpenMenu) {
      setSelectedColumn(null);
      setHoveredColumn(null);
      document.body.style.cursor = "auto";

      // Also reset the isOpenOption if needed
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
    }
  }, [
    config.editColumns,
    config.editColumns.isOpenMenu,
    config.editColumns.isOpenOption,
    updateConfig,
  ]);

  // Chỉ hiển thị nếu menu đang mở
  if (!config.editColumns.isOpenMenu) {
    return null;
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Highlight cho mỗi cột */}
      {addIconPositions.map((pos, index) => (
        <mesh
          key={`column-highlight-${index}`}
          position={[pos.x, 0, 0]}
          onClick={(e) => {
            handleColumnClick(pos.col);
            e.stopPropagation();
          }}
        >
          <boxGeometry args={[cellWidth, height, depth]} />
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

      {/* Biểu tượng "+" hoặc "✓" tùy thuộc vào trạng thái */}
      {addIconPositions.map((pos, index) => (
        <group
          key={`add-icon-${index}`}
          position={[pos.x, pos.y, depth / 2 + 0.01]}
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
