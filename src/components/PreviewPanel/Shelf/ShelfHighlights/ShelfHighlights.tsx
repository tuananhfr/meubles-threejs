import { useState, useEffect, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useConfig } from "../../../context/ConfigContext";
import DeleteModeComponent from "./DeleteModeComponent";
import StandardReinforceModeComponent from "./StandardReinforceModeComponent";

interface ShelfInfo {
  index: number;
  row: number;
  column: number;
  width: number;
  height: number;
  depth: number;
  position: { x: number; y: number; z: number };
  isVirtual: boolean;
  isReinforced: boolean;
  isStandard?: boolean;
}

interface ShelfHighlightsProps {
  width: number;
  height: number;
  depth: number;
  thickness: number;
  columns: number;
  rows: number;
}

const ShelfHighlights: React.FC<ShelfHighlightsProps> = ({
  width,
  height,
  depth,
  thickness,
  columns,
  rows,
}) => {
  const { config, updateConfig } = useConfig();
  const [hoveredShelf, setHoveredShelf] = useState<string | null>(null);
  const [selectedShelves, setSelectedShelves] = useState<string[]>([]);
  const [shelfPositions, setShelfPositions] = useState<any[]>([]);

  // Track if we're in the initial render to prevent flickering
  const initialRenderRef = useRef(true);
  const hasResetRef = useRef(false);

  // Initialize display modes directly from config to prevent flickering
  const [currentMode, setCurrentMode] = useState(() => ({
    deleteMode: config.editShelf?.isOpenEditDelete || false,
    reinforcedMode: config.editShelf?.isOpenEditReinforced || false,
    standardMode: config.editShelf?.isOpenEditStandard || false,
  }));

  // Previous mode state to detect changes
  const [previousEditMode, setPreviousEditMode] = useState(() => ({
    isOpenEditStandard: config.editShelf?.isOpenEditStandard || false,
    isOpenEditReinforced: config.editShelf?.isOpenEditReinforced || false,
    isOpenEditDelete: config.editShelf?.isOpenEditDelete || false,
  }));

  // Synchronize mode state with config
  useEffect(() => {
    // Skip if we're in reset process
    if (hasResetRef.current) return;

    const newDeleteMode = config.editShelf?.isOpenEditDelete || false;
    const newReinforcedMode = config.editShelf?.isOpenEditReinforced || false;
    const newStandardMode = config.editShelf?.isOpenEditStandard || false;

    // Determine current mode state
    const currentEditMode = {
      isOpenEditStandard: newStandardMode,
      isOpenEditReinforced: newReinforcedMode,
      isOpenEditDelete: newDeleteMode,
    };

    // Check if mode has changed
    const hasModeChanged =
      currentEditMode.isOpenEditStandard !==
        previousEditMode.isOpenEditStandard ||
      currentEditMode.isOpenEditReinforced !==
        previousEditMode.isOpenEditReinforced ||
      currentEditMode.isOpenEditDelete !== previousEditMode.isOpenEditDelete;

    // Only update if mode has actually changed
    if (hasModeChanged) {
      // Đánh dấu đang trong quá trình reset
      hasResetRef.current = true;

      // Batch mode updates to prevent flickering
      setCurrentMode({
        deleteMode: newDeleteMode,
        reinforcedMode: newReinforcedMode,
        standardMode: newStandardMode,
      });

      // Reset selections
      setSelectedShelves([]);

      // Update config with empty selection
      updateConfig("editShelf", {
        ...config.editShelf,
        selectedShelves: [],
        isOpenOption: false,
      });

      // Update previous mode reference
      setPreviousEditMode(currentEditMode);

      // Reset flag sau một khoảng thời gian
      setTimeout(() => {
        hasResetRef.current = false;
      }, 100);
    }
  }, [
    config.editShelf?.isOpenEditStandard,
    config.editShelf?.isOpenEditReinforced,
    config.editShelf?.isOpenEditDelete,
    updateConfig,
    previousEditMode,
  ]);

  // Chuyển đổi cellWidth và cellHeight sang đơn vị 3D
  const cellWidth = config.cellWidth / 100;
  const cellHeight = config.cellHeight / 100;

  // Vị trí đáy của kệ (cố định cho mọi cột)
  const shelfBottomY = -height / 2;

  // Hàm lấy chiều rộng của một cột
  const getColumnWidth = (colIndex: number) => {
    if (config.columnWidths && config.columnWidths[colIndex] !== undefined) {
      return config.columnWidths[colIndex] / 100;
    }
    return cellWidth;
  };

  // Hàm lấy chiều cao của một cột
  const getColumnHeight = (colIndex: number) => {
    if (config.columnHeights && config.columnHeights[colIndex] !== undefined) {
      return config.columnHeights[colIndex] / 100;
    }
    return height;
  };

  // Hàm tính vị trí X của cột
  const getColumnXPosition = (colIndex: number) => {
    let startX = -width / 2;
    for (let i = 0; i < colIndex; i++) {
      startX += getColumnWidth(i) + thickness;
    }
    return startX;
  };

  // Hàm lấy số lượng kệ ngang cho mỗi cột dựa vào chiều cao của cột
  const getNumberOfShelvesForColumn = (columnIndex: number) => {
    const colHeight = getColumnHeight(columnIndex);
    // Khoảng cách giữa các kệ ngang
    const shelfSpacing = cellHeight + thickness;
    // Công thức từ HorizontalShelves.tsx
    const actualRows = Math.max(
      1,
      Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
    );
    return actualRows;
  };

  // Hàm kiểm tra kệ đã chuyển từ ảo sang thật
  const isVirtualShelfConverted = (row: number, column: number) => {
    // Chỉ xét các hàng không phải số nguyên (0.5, 1.5, etc.)
    if (row % 1 === 0) return false;

    // Tạo key cho kệ thật và kệ ảo
    const realKey = `${row}-${column}`;
    const virtualKey = `${row}-${column}-virtual`;

    // Kiểm tra trực tiếp trong config.shelves
    if (!config.shelves) return false;

    // Kiểm tra xem kệ thật có tồn tại không
    const realShelf = config.shelves[realKey];

    // Kiểm tra xem kệ ảo có tồn tại không hoặc đã bị xóa
    const virtualShelfMissing = !config.shelves[virtualKey];

    // Một kệ được chuyển từ ảo sang thật khi:
    // 1. Kệ thật tồn tại (có thể là reinforced hoặc standard)
    // 2. Kệ ảo không tồn tại hoặc đã bị xóa
    // 3. Hàng không phải số nguyên (đã kiểm tra ở đầu hàm)
    return !!realShelf && virtualShelfMissing;
  };

  /// Hàm kiểm tra kệ có phải là kệ tiêu chuẩn hoặc kệ tăng cường không
  const isStandardOrReinforcedShelf = (shelfId: string) => {
    if (!config.shelves) return false;

    // Lấy thông tin kệ từ config.shelves
    const shelf = config.shelves[shelfId];
    if (!shelf) return false;

    // Kiểm tra trực tiếp thuộc tính isStandard hoặc isReinforced
    if (shelf.isStandard || shelf.isReinforced) {
      return true;
    }

    // Trường hợp đặc biệt: kệ đáy và kệ đỉnh
    if (!shelf.isVirtual) {
      const parts = shelfId.split("-");
      const row = parseFloat(parts[0]);
      const column = parseInt(parts[1]);

      // Tính số kệ tối đa cho cột này
      const colHeight = config.columnHeights[column] || config.height;
      const cellHeight = config.cellHeight;
      const thickness = config.thickness;
      const shelfSpacing = cellHeight + thickness;
      const maxRows = Math.max(
        1,
        Math.floor((colHeight - 2 * thickness) / shelfSpacing) + 1
      );

      // Kệ đáy (row 0) và kệ đỉnh (row maxRows) luôn là standard
      if (row === 0 || row === maxRows) {
        return true;
      }
    }

    return false;
  };

  // Hàm tạo vị trí highlight và icon cho từng kệ ngang (thực và ảo)
  const calculateShelfPositions = () => {
    const positions: any[] = [];

    // Duyệt qua từng cột
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      // Lấy chiều rộng và chiều cao của cột
      const colWidth = getColumnWidth(columnIndex);
      const colHeight = getColumnHeight(columnIndex);

      // Lấy vị trí X của cột
      const colX = getColumnXPosition(columnIndex);
      // Tính vị trí x ở giữa cột
      const centerX = colX + colWidth / 2 + thickness / 2;

      // Khoảng cách giữa các kệ ngang
      const shelfSpacing = cellHeight + thickness;

      // Xác định số lượng kệ ngang cho cột này
      const actualRows = getNumberOfShelvesForColumn(columnIndex);

      // Vẽ kệ đáy (luôn có, không thể xóa)
      const bottomShelfId = `0-${columnIndex}`;
      positions.push({
        id: bottomShelfId,
        row: 0,
        column: columnIndex,
        x: centerX,
        y: shelfBottomY + thickness / 2,
        width: colWidth,
        height: thickness,
        type: "bottom",
        isVirtual: false,
        totalShelves: actualRows,
        // Thêm thông tin từ config.shelves nếu có
        ...(config.shelves && config.shelves[bottomShelfId]
          ? {
              isStandard: config.shelves[bottomShelfId].isStandard || false,
              isReinforced: config.shelves[bottomShelfId].isReinforced || false,
              isRemoved: config.shelves[bottomShelfId].isRemoved || false,
            }
          : {}),
      });

      // Vẽ kệ đỉnh (luôn có, không thể xóa)
      const topShelfId = `${actualRows}-${columnIndex}`;
      positions.push({
        id: topShelfId,
        row: actualRows,
        column: columnIndex,
        x: centerX,
        y: shelfBottomY + colHeight - thickness / 2,
        width: colWidth,
        height: thickness,
        type: "top",
        isVirtual: false,
        totalShelves: actualRows,
        // Thêm thông tin từ config.shelves nếu có
        ...(config.shelves && config.shelves[topShelfId]
          ? {
              isStandard: config.shelves[topShelfId].isStandard || false,
              isReinforced: config.shelves[topShelfId].isReinforced || false,
              isRemoved: config.shelves[topShelfId].isRemoved || false,
            }
          : {}),
      });

      // Vẽ kệ ngang ở giữa
      for (let row = 1; row < actualRows; row++) {
        // Vị trí Y bắt đầu từ đáy lên
        const rowY = shelfBottomY + thickness + row * shelfSpacing;

        // Chỉ vẽ kệ nếu nằm trong phạm vi chiều cao của cột
        if (rowY < shelfBottomY + colHeight - thickness) {
          const middleShelfId = `${row}-${columnIndex}`;
          positions.push({
            id: middleShelfId,
            row: row,
            column: columnIndex,
            x: centerX,
            y: rowY,
            width: colWidth,
            height: thickness,
            type: "middle",
            isVirtual: false,
            totalShelves: actualRows,
            // Thêm thông tin từ config.shelves nếu có
            ...(config.shelves && config.shelves[middleShelfId]
              ? {
                  isStandard: config.shelves[middleShelfId].isStandard || false,
                  isReinforced:
                    config.shelves[middleShelfId].isReinforced || false,
                  isRemoved: config.shelves[middleShelfId].isRemoved || false,
                }
              : {}),
          });
        }
      }

      // Vẽ kệ ảo ở giữa các kệ thật
      for (let row = 0; row < actualRows; row++) {
        // Tính vị trí của kệ thật hiện tại
        const currentShelfY =
          row === 0
            ? shelfBottomY + thickness / 2
            : shelfBottomY + thickness + row * shelfSpacing;

        // Tính vị trí của kệ thật tiếp theo
        const nextShelfY =
          row === actualRows - 1
            ? shelfBottomY + colHeight - thickness / 2
            : shelfBottomY + thickness + (row + 1) * shelfSpacing;

        // Vị trí của kệ ảo nằm giữa hai kệ thật
        const virtualShelfY = (currentShelfY + nextShelfY) / 2;
        // Tính toán row thực tế cho kệ ảo
        const virtualRow = row + 0.5;
        // Tạo ID duy nhất cho kệ ảo
        const virtualShelfId = `${virtualRow}-${columnIndex}-virtual`;

        positions.push({
          id: virtualShelfId,
          row: virtualRow,
          column: columnIndex,
          x: centerX,
          y: virtualShelfY,
          width: colWidth,
          height: thickness,
          type: "virtual",
          isVirtual: true,
          totalShelves: actualRows,
          // Thêm thông tin từ config.shelves nếu có
          ...(config.shelves && config.shelves[virtualShelfId]
            ? {
                isStandard: config.shelves[virtualShelfId].isStandard || false,
                isReinforced:
                  config.shelves[virtualShelfId].isReinforced || false,
                isRemoved: config.shelves[virtualShelfId].isRemoved || false,
              }
            : {}),
        });
      }
    }

    // Thêm các kệ đã chuyển từ ảo sang thật
    for (let col = 0; col < columns; col++) {
      const colWidth = getColumnWidth(col);
      const colHeight = getColumnHeight(col);
      const colX = getColumnXPosition(col);
      const centerX = colX + colWidth / 2 + thickness / 2;
      const shelfSpacing = cellHeight + thickness;
      const actualRows = getNumberOfShelvesForColumn(col);

      for (let row = 0.5; row < actualRows; row += 1) {
        if (row % 1 !== 0) {
          // Chỉ xét các hàng không phải số nguyên
          if (isVirtualShelfConverted(row, col)) {
            // Tính vị trí Y tương tự kệ ảo
            const rowY = shelfBottomY + thickness + row * shelfSpacing;

            // Chỉ thêm nếu nằm trong phạm vi chiều cao của cột
            if (
              rowY > shelfBottomY + thickness &&
              rowY < shelfBottomY + colHeight - thickness
            ) {
              const convertedShelfId = `${row}-${col}`;
              positions.push({
                id: convertedShelfId,
                row: row,
                column: col,
                x: centerX,
                y: rowY,
                width: colWidth,
                height: thickness,
                type: "converted",
                isVirtual: false,
                isConverted: true,
                totalShelves: actualRows,
                // Thêm thông tin từ config.shelves nếu có
                ...(config.shelves && config.shelves[convertedShelfId]
                  ? {
                      isStandard:
                        config.shelves[convertedShelfId].isStandard || false,
                      isReinforced:
                        config.shelves[convertedShelfId].isReinforced || false,
                      isRemoved:
                        config.shelves[convertedShelfId].isRemoved || false,
                    }
                  : {}),
              });
            }
          }
        }
      }
    }

    return positions;
  };

  // Cập nhật vị trí kệ khi config thay đổi
  useEffect(() => {
    // Bỏ qua nếu đang trong quá trình reset
    if (hasResetRef.current) return;

    // Tính toán lại vị trí của tất cả các kệ
    const newPositions = calculateShelfPositions();
    setShelfPositions(newPositions);

    // Xóa các kệ đã chọn khi cấu trúc thay đổi
    setSelectedShelves([]);

    // Cập nhật lại config nếu cần
    if (config.editShelf?.selectedShelves?.length > 0) {
      // Lọc ra những kệ vẫn còn tồn tại sau khi cấu trúc thay đổi
      const validShelves = config.editShelf.selectedShelves.filter((shelf) => {
        // Kiểm tra xem kệ này có còn hợp lệ không
        const columnIndex = shelf.column;
        const rowIndex = shelf.row;
        const totalShelves = getNumberOfShelvesForColumn(columnIndex);

        // Nếu là kệ ảo
        if (shelf.isVirtual) {
          const baseRow = Math.floor(rowIndex);
          return baseRow < totalShelves; // Hợp lệ nếu hàng cơ sở < tổng số kệ
        }

        // Nếu là kệ thường
        return rowIndex <= totalShelves;
      });

      // Cập nhật lại config với danh sách kệ hợp lệ
      updateConfig("editShelf", {
        ...config.editShelf,
        selectedShelves: validShelves,
      });
    }
  }, [
    config.columnWidths,
    config.columnHeights,
    config.cellHeight,
    config.shelves,
    columns,
    rows,
    width,
    height,
    thickness,
  ]);

  // Kiểm tra nếu kệ này là kệ tăng cường
  const isReinforcedShelf = (
    row: number,
    column: number,
    isVirtualShelf: boolean
  ) => {
    // Trả về false nếu đang reset hoặc không có selectedShelves
    if (hasResetRef.current || !config.editShelf?.selectedShelves) return false;

    // Tìm trong danh sách tất cả các kệ đã chọn
    return config.editShelf.selectedShelves.some(
      (shelf) =>
        shelf.row === row &&
        shelf.column === column &&
        shelf.isVirtual === isVirtualShelf &&
        shelf.isReinforced === true
    );
  };

  // Kiểm tra nếu kệ này là kệ chuẩn
  const isStandardShelf = (
    row: number,
    column: number,
    isVirtualShelf: boolean
  ) => {
    // Trả về false nếu đang reset hoặc không có selectedShelves
    if (hasResetRef.current || !config.editShelf?.selectedShelves) return false;

    // Tìm trong danh sách tất cả các kệ đã chọn
    return config.editShelf.selectedShelves.some(
      (shelf) =>
        shelf.row === row &&
        shelf.column === column &&
        shelf.isVirtual === isVirtualShelf &&
        (shelf.isStandard === true ||
          (!shelf.isReinforced && !shelf.isStandard))
    );
  };

  // Xử lý khi nhấp vào kệ
  const handleShelfClick = (shelfInfo: any) => {
    const shelfId = shelfInfo.id;

    setSelectedShelves((prevSelected) => {
      // Kiểm tra nếu kệ đã được chọn
      const isSelected = prevSelected.includes(shelfId);
      let newSelected;

      if (isSelected) {
        // Nếu đã chọn thì bỏ chọn
        newSelected = prevSelected.filter((id) => id !== shelfId);
      } else {
        // Nếu chưa chọn thì thêm vào danh sách
        newSelected = [...prevSelected, shelfId];
      }

      // Cập nhật thông tin cho config
      updateSelectedShelvesInfo(newSelected);

      return newSelected;
    });
  };

  // Hàm cập nhật thông tin các kệ đã chọn vào config
  const updateSelectedShelvesInfo = (selectedIds: string[]) => {
    // Bỏ qua nếu đang trong quá trình reset
    if (hasResetRef.current) return;

    // Lấy thông tin chi tiết của các kệ đã chọn
    const selectedShelvesInfo = selectedIds
      .map((id) => {
        const shelf = shelfPositions.find((s) => s.id === id);
        if (!shelf) return null;

        // Kiểm tra xem kệ này đã có trong danh sách kệ đã chọn chưa
        let isReinforcedValue = false;
        let isStandardValue = false;

        if (config.editShelf?.selectedShelves) {
          const existingShelf = config.editShelf.selectedShelves.find(
            (s) =>
              s.row === shelf.row &&
              s.column === shelf.column &&
              s.isVirtual === shelf.isVirtual
          );

          if (existingShelf) {
            isReinforcedValue = existingShelf.isReinforced || false;
            isStandardValue = existingShelf.isStandard || false;
          }
        }

        // Đặt giá trị mặc định dựa vào chế độ đang hiển thị
        if (config.editShelf?.isOpenEditReinforced) {
          isReinforcedValue = true;
          isStandardValue = false;
        } else if (config.editShelf?.isOpenEditStandard) {
          isReinforcedValue = false;
          isStandardValue = true;
        }

        return {
          index: shelf.isVirtual
            ? parseFloat(shelf.id.split("-")[0]) + 0.5
            : parseFloat(shelf.id.split("-")[0]),
          row: shelf.row,
          column: shelf.column,
          width: shelf.width * 100,
          height: shelf.height * 100,
          depth: depth * 100,
          position: {
            x: shelf.x * 100,
            y: shelf.y * 100,
            z: 0,
          },
          isVirtual: shelf.isVirtual || false,
          isReinforced: isReinforcedValue,
          isStandard: isStandardValue,
          totalShelves: shelf.totalShelves,
        };
      })
      .filter(Boolean) as ShelfInfo[];

    // Cập nhật config với danh sách các kệ đã chọn
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenOption: selectedShelvesInfo.length > 0,
      selectedShelves: selectedShelvesInfo,
    });
  };

  // Xử lý sự kiện hover
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const { point } = event;
    let hoveredShelfId = null;

    // Kiểm tra xem pointer có nằm trong phạm vi của kệ nào không
    for (const shelf of shelfPositions) {
      const halfWidth = shelf.width / 2;
      const halfHeight = shelf.height / 2;

      // Tính toán giới hạn của kệ
      const shelfMinX = shelf.x - halfWidth;
      const shelfMaxX = shelf.x + halfWidth;
      const shelfMinY = shelf.y - halfHeight;
      const shelfMaxY = shelf.y + halfHeight;

      // Kiểm tra xem điểm có nằm trong kệ không
      if (
        point.x >= shelfMinX &&
        point.x <= shelfMaxX &&
        point.y >= shelfMinY &&
        point.y <= shelfMaxY
      ) {
        hoveredShelfId = shelf.id;
        break;
      }
    }

    if (hoveredShelfId !== hoveredShelf) {
      setHoveredShelf(hoveredShelfId);
      document.body.style.cursor = hoveredShelfId !== null ? "pointer" : "auto";
    }
  };

  // Reset khi pointer rời khỏi kệ
  const handlePointerLeave = () => {
    setHoveredShelf(null);
    document.body.style.cursor = "auto";
  };

  // Cập nhật hoặc khởi tạo selectedShelves nếu chưa có
  useEffect(() => {
    if (hasResetRef.current) return;

    if (!config.editShelf?.selectedShelves) {
      updateConfig("editShelf", {
        ...config.editShelf,
        selectedShelves: [],
      });
    }
  }, [config.editShelf, updateConfig]);

  // Reset selected shelves khi menu đóng
  useEffect(() => {
    // Bỏ qua nếu đang trong quá trình reset
    if (hasResetRef.current) return;

    if (!config.editShelf?.isOpenMenu) {
      setSelectedShelves([]);
      setHoveredShelf(null);
      document.body.style.cursor = "auto";

      if (config.editShelf?.isOpenOption) {
        updateConfig("editShelf", {
          ...config.editShelf,
          isOpenMenu: false,
          isOpenOption: false,
          isOpenEditStandard: false,
          isOpenEditReinforced: false,
          isOpenEditDelete: false,
          selectedShelves: config.editShelf.selectedShelves || [],
        });
      }
    } else if (config.editShelf && !config.editShelf.selectedShelves?.length) {
      setSelectedShelves([]);
      setHoveredShelf(null);
      document.body.style.cursor = "auto";
    }
  }, [config.editShelf, updateConfig]);

  // Tính toán vị trí kệ khi component khởi tạo
  useEffect(() => {
    const positions = calculateShelfPositions();
    setShelfPositions(positions);
  }, []);

  // Chỉ hiển thị khi menu đang mở và một trong các chế độ chỉnh sửa đang kích hoạt
  if (
    !config.editShelf?.isOpenMenu ||
    (!config.editShelf?.isOpenEditReinforced &&
      !config.editShelf?.isOpenEditStandard &&
      !config.editShelf?.isOpenEditDelete)
  ) {
    return null;
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {currentMode.deleteMode ? (
        <DeleteModeComponent
          shelfPositions={shelfPositions}
          selectedShelves={selectedShelves}
          hoveredShelf={hoveredShelf}
          depth={depth}
          handleShelfClick={handleShelfClick}
          isStandardOrReinforcedShelf={isStandardOrReinforcedShelf}
          hasResetRef={hasResetRef}
        />
      ) : (
        <StandardReinforceModeComponent
          shelfPositions={shelfPositions}
          selectedShelves={selectedShelves}
          hoveredShelf={hoveredShelf}
          depth={depth}
          handleShelfClick={handleShelfClick}
          isStandardMode={currentMode.standardMode}
          isReinforcedMode={currentMode.reinforcedMode}
          hasResetRef={hasResetRef}
        />
      )}
    </group>
  );
};

export default ShelfHighlights;
