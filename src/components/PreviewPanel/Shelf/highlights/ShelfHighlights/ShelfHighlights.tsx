import { useState, useEffect, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";

import DeleteModeComponent from "./DeleteModeComponent";
import StandardReinforceModeComponent from "./StandardReinforceModeComponent";
import { useConfig } from "../../../../context/ConfigContext";
import TextureModeComponent from "./TextureModeComponent";

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
  const [shelfPositions, setShelfPositions] = useState<ShelfPosition[]>([]);

  const hasResetRef = useRef(false);

  // Initialize display modes directly from config to prevent flickering
  const [currentMode, setCurrentMode] = useState(() => ({
    deleteMode: config.editShelf?.isOpenEditDelete || false,
    reinforcedMode: config.editShelf?.isOpenEditReinforced || false,
    standardMode: config.editShelf?.isOpenEditStandard || false,
    textureMode: config.editShelf?.isOpenEditTexture || false,
  }));

  // Previous mode state to detect changes
  const [previousEditMode, setPreviousEditMode] = useState(() => ({
    isOpenEditStandard: config.editShelf?.isOpenEditStandard || false,
    isOpenEditReinforced: config.editShelf?.isOpenEditReinforced || false,
    isOpenEditDelete: config.editShelf?.isOpenEditDelete || false,
    isOpenEditTexture: config.editShelf?.isOpenEditTexture || false,
  }));

  // Synchronize mode state with config
  useEffect(() => {
    // Skip if we're in reset process
    if (hasResetRef.current) return;

    const newDeleteMode = config.editShelf?.isOpenEditDelete || false;
    const newReinforcedMode = config.editShelf?.isOpenEditReinforced || false;
    const newStandardMode = config.editShelf?.isOpenEditStandard || false;
    const newTextureMode = config.editShelf?.isOpenEditTexture || false;

    // Determine current mode state
    const currentEditMode = {
      isOpenEditStandard: newStandardMode,
      isOpenEditReinforced: newReinforcedMode,
      isOpenEditDelete: newDeleteMode,
      isOpenEditTexture: newTextureMode,
    };

    // Check if mode has changed
    const hasModeChanged =
      currentEditMode.isOpenEditStandard !==
        previousEditMode.isOpenEditStandard ||
      currentEditMode.isOpenEditReinforced !==
        previousEditMode.isOpenEditReinforced ||
      currentEditMode.isOpenEditDelete !== previousEditMode.isOpenEditDelete ||
      currentEditMode.isOpenEditTexture !== previousEditMode.isOpenEditTexture;

    // Only update if mode has actually changed
    if (hasModeChanged) {
      // Chỉ reset selections khi chuyển từ mode khác sang mode khác
      // KHÔNG reset khi texture mode được bật
      const shouldResetSelections =
        // Reset khi tắt tất cả modes
        (!newDeleteMode &&
          !newReinforcedMode &&
          !newStandardMode &&
          !newTextureMode) ||
        // Reset khi chuyển từ texture mode sang mode khác (không phải texture)
        (previousEditMode.isOpenEditTexture &&
          !newTextureMode &&
          (newDeleteMode || newReinforcedMode || newStandardMode)) ||
        // Reset khi chuyển từ các mode khác sang texture mode
        (!previousEditMode.isOpenEditTexture &&
          newTextureMode &&
          (previousEditMode.isOpenEditDelete ||
            previousEditMode.isOpenEditReinforced ||
            previousEditMode.isOpenEditStandard)) ||
        // Reset khi chuyển giữa các mode không phải texture
        (!newTextureMode &&
          !previousEditMode.isOpenEditTexture &&
          hasModeChanged);

      if (shouldResetSelections) {
        // Đánh dấu đang trong quá trình reset
        hasResetRef.current = true;

        // Reset selections
        setSelectedShelves([]);

        // Update config with empty selection
        updateConfig("editShelf", {
          ...config.editShelf,
          selectedShelves: [],
          isOpenOption: false,
        });

        // Reset flag sau một khoảng thời gian
        setTimeout(() => {
          hasResetRef.current = false;
        }, 100);
      }

      // Batch mode updates to prevent flickering
      setCurrentMode({
        deleteMode: newDeleteMode,
        reinforcedMode: newReinforcedMode,
        standardMode: newStandardMode,
        textureMode: newTextureMode,
      });

      // Update previous mode reference
      setPreviousEditMode(currentEditMode);
    }
  }, [
    config.editShelf?.isOpenEditStandard,
    config.editShelf?.isOpenEditReinforced,
    config.editShelf?.isOpenEditDelete,
    config.editShelf?.isOpenEditTexture,
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
  // const isVirtualShelfConverted = (row: number, column: number) => {
  //   // Chỉ xét các hàng không phải số nguyên (0.5, 1.5, etc.)
  //   if (row % 1 === 0) return false;

  //   // Tạo key cho kệ thật và kệ ảo
  //   const realKey = `${row}-${column}`;
  //   const virtualKey = `${row}-${column}-virtual`;

  //   // Kiểm tra trực tiếp trong config.shelves
  //   if (!config.shelves) return false;

  //   // Kiểm tra xem kệ thật có tồn tại không
  //   const realShelf = config.shelves[realKey];

  //   // Kiểm tra xem kệ ảo có tồn tại không hoặc đã bị xóa
  //   const virtualShelfMissing = !config.shelves[virtualKey];

  //   // Một kệ được chuyển từ ảo sang thật khi:
  //   // 1. Kệ thật tồn tại (có thể là reinforced hoặc standard)
  //   // 2. Kệ ảo không tồn tại hoặc đã bị xóa
  //   // 3. Hàng không phải số nguyên (đã kiểm tra ở đầu hàm)
  //   return !!realShelf && virtualShelfMissing;
  // };

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
    const positions: ShelfPosition[] = [];

    // Nếu không có config.shelves, return empty array
    if (!config.shelves) return positions;

    // Duyệt qua tất cả các shelf trong config.shelves
    Object.entries(config.shelves).forEach(([shelfId, shelfData]) => {
      // Bỏ qua shelf đã bị xóa
      if (shelfData.isRemoved) return;

      // Parse shelfId để lấy thông tin vị trí
      const parts = shelfId.split("-");
      const row = parseFloat(parts[0]);
      const column = parseInt(parts[1]);
      const isVirtual = shelfId.includes("-virtual");

      // Tính toán vị trí 3D cho shelf này
      const colWidth = getColumnWidth(column);
      const colHeight = getColumnHeight(column);
      const colX = getColumnXPosition(column);
      const centerX = colX + colWidth / 2 + thickness / 2;

      // Tính vị trí Y dựa vào row
      const shelfSpacing = cellHeight + thickness;
      let shelfY;

      if (row === 0) {
        // Shelf đáy
        shelfY = shelfBottomY + thickness / 2;
      } else if (row === getNumberOfShelvesForColumn(column)) {
        // Shelf đỉnh
        shelfY = shelfBottomY + colHeight - thickness / 2;
      } else {
        // Shelf ở giữa hoặc shelf converted
        shelfY = shelfBottomY + thickness / 2 + row * shelfSpacing;
      }

      // Xác định type của shelf
      let type = "middle";
      if (row === 0) type = "bottom";
      else if (row === getNumberOfShelvesForColumn(column)) type = "top";
      else if (isVirtual) type = "virtual";
      else if (row % 1 !== 0) type = "converted"; // Shelf có row không nguyên (0.5, 1.5...)

      // Tạo ShelfPosition object
      const shelfPosition: ShelfPosition = {
        id: shelfId,
        row: row,
        column: column,
        x: centerX,
        y: shelfY,
        z: 0,
        width: colWidth,
        height: thickness,
        type: type,
        isVirtual: isVirtual,
        totalShelves: getNumberOfShelvesForColumn(column),
        // Thêm thông tin từ shelfData
        isStandard: shelfData.isStandard || false,
        isReinforced: shelfData.isReinforced || false,
        isRemoved: shelfData.isRemoved || false,
      };

      positions.push(shelfPosition);
    });

    return positions;
  };
  // Cập nhật vị trí kệ khi config thay đổi
  useEffect(() => {
    // Tính toán lại vị trí của tất cả các kệ
    const newPositions = calculateShelfPositions();
    setShelfPositions(newPositions);

    // Bỏ qua nếu đang trong quá trình reset
    if (hasResetRef.current) return;
    // Chỉ xóa selections khi KHÔNG ở texture mode
    if (!config.editShelf?.isOpenEditTexture) {
      // Xóa các kệ đã chọn khi cấu trúc thay đổi (chỉ khi không ở texture mode)
      setSelectedShelves([]);

      // Cập nhật lại config nếu cần
      if (config.editShelf?.selectedShelves?.length > 0) {
        // Lọc ra những kệ vẫn còn tồn tại sau khi cấu trúc thay đổi
        const validShelves = config.editShelf.selectedShelves.filter(
          (shelf) => {
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
          }
        );

        // Cập nhật lại config với danh sách kệ hợp lệ
        updateConfig("editShelf", {
          ...config.editShelf,
          selectedShelves: validShelves,
        });
      }
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

  // Xử lý khi nhấp vào kệ
  const handleShelfClick = (shelfInfo: ShelfPosition) => {
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
        // Không set default values cho texture mode

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

    // Preserve all current states for texture mode
    const currentEditShelf = config.editShelf || {};

    updateConfig("editShelf", {
      ...currentEditShelf,
      isOpenOption: selectedShelvesInfo.length > 0,
      selectedShelves: selectedShelvesInfo,
      // Preserve texture mode state và không auto-set isOpenMenu
      isOpenEditTexture: currentEditShelf.isOpenEditTexture || false,
    });
  };

  // Xử lý sự kiện hover - GIỮ NGUYÊN
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

  // Reset khi pointer rời khỏi kệ - GIỮ NGUYÊN
  const handlePointerLeave = () => {
    setHoveredShelf(null);
    document.body.style.cursor = "auto";
  };

  // Cập nhật hoặc khởi tạo selectedShelves nếu chưa có - GIỮ NGUYÊN
  useEffect(() => {
    if (hasResetRef.current) return;

    if (!config.editShelf?.selectedShelves) {
      updateConfig("editShelf", {
        ...config.editShelf,
        selectedShelves: [],
      });
    }
  }, [config.editShelf, updateConfig]);

  // Reset selected shelves khi menu đóng - NHƯNG KHÔNG reset cho texture mode
  useEffect(() => {
    // Bỏ qua nếu đang trong quá trình reset
    if (hasResetRef.current) return;

    // Chỉ reset khi menu đóng VÀ KHÔNG ở texture mode
    if (!config.editShelf?.isOpenMenu && !config.editShelf?.isOpenEditTexture) {
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
          selectedShelves: [],
        });
      }
    } else if (
      config.editShelf?.isOpenMenu &&
      !config.editShelf.selectedShelves?.length
    ) {
      // Chỉ reset nếu menu mở nhưng không có selections và không ở texture mode
      if (!config.editShelf.isOpenEditTexture) {
        setSelectedShelves([]);
        setHoveredShelf(null);
        document.body.style.cursor = "auto";
      }
    }
  }, [config.editShelf, updateConfig]);

  // Tính toán vị trí kệ khi component khởi tạo
  useEffect(() => {
    const positions = calculateShelfPositions();
    setShelfPositions(positions);
  }, []);

  // Điều kiện hiển thị
  const shouldShowTextureMode = config.editShelf?.isOpenEditTexture;

  const shouldShowOtherModes =
    config.editShelf?.isOpenMenu &&
    (config.editShelf?.isOpenEditReinforced ||
      config.editShelf?.isOpenEditStandard ||
      config.editShelf?.isOpenEditDelete);

  // Hiển thị khi một trong hai điều kiện được thỏa mãn
  if (!shouldShowTextureMode && !shouldShowOtherModes) {
    return null;
  }

  return (
    <group
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {shouldShowTextureMode ? (
        <TextureModeComponent
          shelfPositions={shelfPositions}
          selectedShelves={selectedShelves}
          hoveredShelf={hoveredShelf}
          depth={depth}
          handleShelfClick={handleShelfClick}
          hasResetRef={hasResetRef}
          isStandardOrReinforcedShelf={isStandardOrReinforcedShelf}
        />
      ) : currentMode.deleteMode ? (
        <DeleteModeComponent
          shelfPositions={shelfPositions}
          selectedShelves={selectedShelves}
          hoveredShelf={hoveredShelf}
          depth={depth}
          handleShelfClick={handleShelfClick}
          hasResetRef={hasResetRef}
          isStandardOrReinforcedShelf={isStandardOrReinforcedShelf}
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
