import {
  calculateDefaultPanelProperties,
  isPermanentlyDeletedPanel,
} from "./utils";

/**
 * Xử lý các kệ nửa hàng khi xóa kệ
 */
export const handleHalfRowShelvesOnRemove = (
  virtualShelves: ShelfInfo[],
  updatedBackPanels: Record<string, BackPanelsData>,
  getColumnWidth: (col: number) => number,
  getColumnXPosition: (col: number) => number,
  shelfBottomY: number,
  cellHeight: number,
  thickness: number,
  depth: number
): Record<string, BackPanelsData> => {
  virtualShelves.forEach((shelf) => {
    const { row, column } = shelf;

    // Xử lý kệ nửa hàng
    if (row % 1 !== 0) {
      const panelRowToRestore = Math.floor(row);
      const customPanelKey = `custom-panel-${row}-${column}`;
      const panelKeyToRestore = `back-panel-${panelRowToRestore}-${column}`;

      // Xóa custom panel nếu tồn tại
      if (updatedBackPanels[customPanelKey]) {
        delete updatedBackPanels[customPanelKey];
      }

      // Khôi phục panel gốc nếu tồn tại
      if (updatedBackPanels[panelKeyToRestore]) {
        // Lấy lại tất cả thông số mặc định cho panel gốc
        const { position, dimensions } = calculateDefaultPanelProperties(
          column,
          panelRowToRestore,
          getColumnWidth,
          getColumnXPosition,
          shelfBottomY,
          cellHeight,
          thickness,
          depth
        );

        updatedBackPanels[panelKeyToRestore] = {
          ...updatedBackPanels[panelKeyToRestore],
          isRemoved: false,
          permanentlyDeleted: false,
          position,
          dimensions,
        };
      }
    }
  });

  return updatedBackPanels;
};

/**
 * Xử lý một nhóm kệ liên tiếp khi xóa kệ
 */
export const handleShelfGroupOnRemove = (
  group: ShelfInfo[],
  column: number,
  activeShelvesList: ShelfData[],
  updatedBackPanels: Record<string, BackPanelsData>,
  thickness: number
): Record<string, BackPanelsData> => {
  // Kệ đầu tiên và cuối cùng trong nhóm
  const firstShelf = group[0];
  const lastShelf = group[group.length - 1];

  // Tìm kệ gần nhất phía dưới và kệ gần nhất phía trên
  const lowerShelves = activeShelvesList.filter((s) => s.row < firstShelf.row);
  const upperShelves = activeShelvesList.filter((s) => s.row > lastShelf.row);

  // Nếu không có kệ phía trên hoặc phía dưới, bỏ qua
  if (lowerShelves.length === 0 || upperShelves.length === 0) {
    return updatedBackPanels;
  }

  // Tìm panel tiếp theo (không bị xóa vĩnh viễn)
  let nextRowOffset = 1;
  let nextPanelKey = `back-panel-${lastShelf.row}-${column}`;
  let nextPanel = updatedBackPanels[nextPanelKey];

  // Tìm panel tiếp theo mà không bị xóa vĩnh viễn
  while (nextPanel && isPermanentlyDeletedPanel(nextPanel)) {
    nextRowOffset++;
    nextPanelKey = `back-panel-${lastShelf.row - 1 + nextRowOffset}-${column}`;
    nextPanel = updatedBackPanels[nextPanelKey];
  }

  // Nếu không tìm thấy panel phù hợp, bỏ qua
  if (!nextPanel) {
    return updatedBackPanels;
  }

  // Đánh dấu tất cả panel liên quan đến nhóm kệ là đã xóa vĩnh viễn
  for (let i = 0; i < group.length; i++) {
    const panelKey = `back-panel-${group[i].row - 1}-${column}`;
    if (updatedBackPanels[panelKey]) {
      updatedBackPanels[panelKey].isRemoved = true;
      updatedBackPanels[panelKey].permanentlyDeleted = true;
    }
  }

  // Tính chiều cao mới và vị trí của panel tiếp theo
  let accumulatedHeight = 0;
  const panelPositions: number[] = [];
  const panelHeights: number[] = [];

  // Thu thập thông tin về panel tiếp theo
  panelPositions.push(nextPanel.position[1]);
  panelHeights.push(nextPanel.dimensions[1]);

  // Thu thập thông tin từ tất cả panel liên quan đến nhóm kệ
  for (let i = 0; i < group.length; i++) {
    const panelKey = `back-panel-${group[i].row - 1}-${column}`;
    if (updatedBackPanels[panelKey]) {
      accumulatedHeight += updatedBackPanels[panelKey].dimensions[1];
      panelPositions.push(updatedBackPanels[panelKey].position[1]);
      panelHeights.push(updatedBackPanels[panelKey].dimensions[1]);
    }
  }

  // Thêm độ dày của kệ cho mỗi kệ bị xóa
  accumulatedHeight += thickness * group.length;

  // Tính vị trí Y mới (trung bình có trọng số)
  let weightedSumY = 0;
  let totalWeight = 0;

  for (let i = 0; i < panelPositions.length; i++) {
    const weight = panelHeights[i];
    weightedSumY += panelPositions[i] * weight;
    totalWeight += weight;
  }

  const newPositionY =
    totalWeight > 0 ? weightedSumY / totalWeight : nextPanel.position[1];

  // Cập nhật chiều cao và vị trí cho panel tiếp theo
  nextPanel.dimensions[1] += accumulatedHeight;
  nextPanel.position[1] = newPositionY;

  return updatedBackPanels;
};

/**
 * Xử lý các kệ thường khi xóa kệ
 */
export const handleRegularShelvesOnRemove = (
  regularShelves: ShelfInfo[],
  column: number,
  updatedBackPanels: Record<string, BackPanelsData>,
  shelves: Record<string, ShelfData>,
  thickness: number
): Record<string, BackPanelsData> => {
  if (regularShelves.length === 0) {
    return updatedBackPanels;
  }

  // Tìm tất cả kệ trong cùng cột (không bị xóa và không nằm trong danh sách đang xóa)
  const activeShelvesList = Object.values(shelves)
    .filter(
      (s) =>
        s.column === column &&
        !s.isRemoved &&
        !regularShelves.some(
          (selected) => selected.row === s.row && selected.column === s.column
        )
    )
    .sort((a, b) => a.row - b.row);

  // Tìm tất cả hàng liên tiếp
  const shelfGroups: ShelfInfo[][] = [];
  let currentGroup: ShelfInfo[] = [];

  for (let i = 0; i < regularShelves.length; i++) {
    if (i === 0 || regularShelves[i].row === regularShelves[i - 1].row + 1) {
      // Kệ liên tiếp, thêm vào nhóm hiện tại
      currentGroup.push(regularShelves[i]);
    } else {
      // Kệ không liên tiếp, tạo nhóm mới
      if (currentGroup.length > 0) {
        shelfGroups.push(currentGroup);
      }
      currentGroup = [regularShelves[i]];
    }
  }

  // Thêm nhóm cuối cùng
  if (currentGroup.length > 0) {
    shelfGroups.push(currentGroup);
  }

  // Xử lý từng nhóm kệ liên tiếp
  shelfGroups.forEach((group) => {
    updatedBackPanels = handleShelfGroupOnRemove(
      group,
      column,
      activeShelvesList,
      updatedBackPanels,
      thickness
    );
  });

  return updatedBackPanels;
};
