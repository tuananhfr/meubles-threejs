/**
 * Chuyển đổi từ định dạng object sang định dạng key string
 */
export const shelfToKey = (shelf: ShelfInfo): string => {
  return shelf.isVirtual
    ? `${shelf.row}-${shelf.column}-virtual`
    : `${shelf.row}-${shelf.column}`;
};

/**
 * Chuyển đổi từ định dạng key string sang object
 */
export const keyToShelf = (key: string): Partial<ShelfInfo> => {
  // Format: "row-column" hoặc "row-column-virtual"
  const isVirtual = key.includes("-virtual");
  const parts = key.replace("-virtual", "").split("-");

  return {
    row: parseFloat(parts[0]), // Sử dụng parseFloat để hỗ trợ row dạng số thập phân (0.5)
    column: parseInt(parts[1]),
    isVirtual: isVirtual,
  };
};

/**
 * Hàm đồng bộ từ selectedShelves sang reinforcedShelves và removedShelves
 */
export const syncFromSelectedShelves = (
  selectedShelves: ShelfInfo[],
  updateConfig: (key: string, value: any) => void
): void => {
  if (!selectedShelves) return;

  const reinforcedShelves: string[] = [];
  const standardShelves: string[] = [];
  const removedShelves: string[] = [];

  // Chuyển đổi từ selectedShelves sang các mảng key
  selectedShelves.forEach((shelf) => {
    const key = shelfToKey(shelf);

    if (shelf.isReinforced) {
      reinforcedShelves.push(key);
    }

    if (shelf.isStandard) {
      standardShelves.push(key);
    }

    if (shelf.isRemoved) {
      removedShelves.push(key);
    }
  });

  // Cập nhật config
  updateConfig("reinforcedShelves", reinforcedShelves);
  updateConfig("standardShelves", standardShelves);
  updateConfig("removedShelves", removedShelves);
};

/**
 * Hàm đồng bộ từ reinforcedShelves và removedShelves sang selectedShelves
 */
export const syncToSelectedShelves = (
  config: any,
  updateConfig: (key: string, value: any) => void
): void => {
  const allSelectedShelves: ShelfInfo[] = [];

  // Chuyển đổi từ reinforcedShelves sang selectedShelves
  if (config.reinforcedShelves && config.reinforcedShelves.length > 0) {
    config.reinforcedShelves.forEach((key: string) => {
      const baseShelf = keyToShelf(key);

      // Tìm xem shelf này đã có trong allSelectedShelves chưa
      const existingIndex = allSelectedShelves.findIndex(
        (s) =>
          s.row === baseShelf.row &&
          s.column === baseShelf.column &&
          s.isVirtual === baseShelf.isVirtual
      );

      if (existingIndex >= 0) {
        // Cập nhật shelf đã tồn tại
        allSelectedShelves[existingIndex] = {
          ...allSelectedShelves[existingIndex],
          isReinforced: true,
          isStandard: false,
        };
      } else {
        // Thêm shelf mới
        allSelectedShelves.push({
          index: baseShelf.isVirtual
            ? baseShelf.row
            : Math.floor(baseShelf.row || 0),
          row: baseShelf.row || 0,
          column: baseShelf.column || 0,
          width: 0, // Sẽ cập nhật sau
          height: 0, // Sẽ cập nhật sau
          depth: 0, // Sẽ cập nhật sau
          position: { x: 0, y: 0, z: 0 }, // Sẽ cập nhật sau
          isVirtual: baseShelf.isVirtual || false,
          isReinforced: true,
          isStandard: false,
          isRemoved: false,
        } as ShelfInfo);
      }
    });
  }

  // Chuyển đổi từ standardShelves sang selectedShelves
  if (config.standardShelves && config.standardShelves.length > 0) {
    config.standardShelves.forEach((key: string) => {
      const baseShelf = keyToShelf(key);

      // Tìm xem shelf này đã có trong allSelectedShelves chưa
      const existingIndex = allSelectedShelves.findIndex(
        (s) =>
          s.row === baseShelf.row &&
          s.column === baseShelf.column &&
          s.isVirtual === baseShelf.isVirtual
      );

      if (existingIndex >= 0) {
        // Cập nhật shelf đã tồn tại
        allSelectedShelves[existingIndex] = {
          ...allSelectedShelves[existingIndex],
          isReinforced: false,
          isStandard: true,
        };
      } else {
        // Thêm shelf mới
        allSelectedShelves.push({
          index: baseShelf.isVirtual
            ? baseShelf.row
            : Math.floor(baseShelf.row || 0),
          row: baseShelf.row || 0,
          column: baseShelf.column || 0,
          width: 0, // Sẽ cập nhật sau
          height: 0, // Sẽ cập nhật sau
          depth: 0, // Sẽ cập nhật sau
          position: { x: 0, y: 0, z: 0 }, // Sẽ cập nhật sau
          isVirtual: baseShelf.isVirtual || false,
          isReinforced: false,
          isStandard: true,
          isRemoved: false,
        } as ShelfInfo);
      }
    });
  }

  // Cập nhật removedShelves
  if (config.removedShelves && config.removedShelves.length > 0) {
    config.removedShelves.forEach((key: string) => {
      const baseShelf = keyToShelf(key);

      // Tìm xem shelf này đã có trong allSelectedShelves chưa
      const existingIndex = allSelectedShelves.findIndex(
        (s) =>
          s.row === baseShelf.row &&
          s.column === baseShelf.column &&
          s.isVirtual === baseShelf.isVirtual
      );

      if (existingIndex >= 0) {
        // Cập nhật shelf đã tồn tại
        allSelectedShelves[existingIndex] = {
          ...allSelectedShelves[existingIndex],
          isRemoved: true,
        };
      } else {
        // Thêm shelf mới
        allSelectedShelves.push({
          index: baseShelf.isVirtual
            ? baseShelf.row
            : Math.floor(baseShelf.row || 0),
          row: baseShelf.row || 0,
          column: baseShelf.column || 0,
          width: 0, // Sẽ cập nhật sau
          height: 0, // Sẽ cập nhật sau
          depth: 0, // Sẽ cập nhật sau
          position: { x: 0, y: 0, z: 0 }, // Sẽ cập nhật sau
          isVirtual: baseShelf.isVirtual || false,
          isReinforced: false,
          isStandard: false,
          isRemoved: true,
        } as ShelfInfo);
      }
    });
  }

  // Cập nhật dimensions cho các shelf mới được thêm
  // Lưu ý: Cần có hàm tính toán kích thước kệ từ row và column
  // Giả sử shelfPositions đã có

  // Cập nhật config
  updateConfig("editShelf", {
    ...config.editShelf,
    selectedShelves: allSelectedShelves,
  });
};

// Hàm kiểm tra một kệ có trong danh sách không - dùng cho cả hai component
export const isShelfInList = (
  row: number,
  column: number,
  isVirtual: boolean,
  list: string[]
): boolean => {
  if (!list || list.length === 0) return false;

  const key = isVirtual ? `${row}-${column}-virtual` : `${row}-${column}`;

  return list.includes(key);
};
