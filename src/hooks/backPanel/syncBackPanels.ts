import { createBackPanel } from "./utils";

/**
 * Cập nhật tất cả back panel dựa trên trạng thái hiện tại của các shelf
 */
export const syncBackPanelsWithShelves = (
  shelves: Record<string, ShelfData>,
  backPanels: Record<string, BackPanelsData>,
  getShelfYPosition: (row: number) => number,
  getColumnWidth: (col: number) => number,
  getColumnXPosition: (col: number) => number,
  thickness: number,
  depth: number
): Record<string, BackPanelsData> => {
  // Tạo bản sao sâu của backPanels
  const updatedBackPanels: Record<string, BackPanelsData> = {};

  // Lưu lại các panel tùy chỉnh nếu có
  if (backPanels) {
    Object.keys(backPanels).forEach((key) => {
      if (key.startsWith("custom-panel-")) {
        updatedBackPanels[key] = { ...backPanels[key] };
      }
    });
  }

  // Lọc ra tất cả shelf không bị isRemoved
  const allShelves = Object.values(shelves)
    .filter((shelf) => !shelf.isRemoved && !shelf.isVirtual)
    .sort((a, b) => {
      if (a.column !== b.column) return a.column - b.column;
      return a.row - b.row;
    });

  // Nhóm shelves theo cột
  const shelvesByColumn: Record<number, ShelfData[]> = {};
  allShelves.forEach((shelf) => {
    if (!shelvesByColumn[shelf.column]) {
      shelvesByColumn[shelf.column] = [];
    }
    shelvesByColumn[shelf.column].push(shelf);
  });

  // Xử lý từng cột
  Object.keys(shelvesByColumn).forEach((colStr) => {
    const column = parseInt(colStr);
    const shelvesInColumn = shelvesByColumn[column];

    // Sắp xếp shelves theo hàng (tăng dần)
    shelvesInColumn.sort((a, b) => a.row - b.row);

    // Nếu có ít nhất 2 shelf trong cột (để tạo panel ở giữa)
    if (shelvesInColumn.length >= 2) {
      // Xử lý từng cặp shelf kề nhau
      for (let i = 0; i < shelvesInColumn.length - 1; i++) {
        const currentShelf = shelvesInColumn[i];
        const nextShelf = shelvesInColumn[i + 1];

        // Tính vị trí Y của hai shelf
        const currentShelfY = getShelfYPosition(currentShelf.row);
        const nextShelfY = getShelfYPosition(nextShelf.row);

        // Tính chiều cao panel giữa hai shelf
        const panelHeight = nextShelfY - currentShelfY - thickness;

        // Vị trí Y của panel (điểm giữa)
        const panelY = currentShelfY + thickness + panelHeight / 2;

        // Thông số cơ bản của panel
        const colWidth = getColumnWidth(column);
        const colX = getColumnXPosition(column);
        const backPanelZ = -depth / 2 + thickness / 2 + 0.0001;

        // Tạo key cho panel: sử dụng row của shelf hiện tại
        // Quan trọng: Giữ nguyên giá trị row không làm tròn vì có thể là số thập phân
        const panelKey = `back-panel-${currentShelf.row}-${column}`;

        // Giữ lại trạng thái isRemoved nếu panel đã tồn tại
        let isRemoved = true; // Mặc định hiển thị panel
        if (backPanels && backPanels[panelKey]) {
          isRemoved = backPanels[panelKey].isRemoved;
        }

        // Lấy giá trị permanentlyDeleted nếu có
        let permanentlyDeleted = false;
        if (
          backPanels &&
          backPanels[panelKey] &&
          backPanels[panelKey].permanentlyDeleted !== undefined
        ) {
          permanentlyDeleted = backPanels[panelKey].permanentlyDeleted;
        }

        //  Giữ lại texture nếu panel đã tồn tại
        let existingTexture = undefined;
        if (
          backPanels &&
          backPanels[panelKey] &&
          backPanels[panelKey].texture
        ) {
          existingTexture = backPanels[panelKey].texture;
        }

        // Tạo panel với texture được bảo tồn
        const newPanel = createBackPanel(
          panelKey,
          currentShelf.row, // Giữ nguyên row, không làm tròn
          column,
          [colX + colWidth / 2 + thickness / 2, panelY, backPanelZ],
          [colWidth, panelHeight, thickness],
          isRemoved,
          permanentlyDeleted
        );

        //  Gán lại texture sau khi tạo panel
        if (existingTexture) {
          newPanel.texture = existingTexture;
        }

        updatedBackPanels[panelKey] = newPanel;
      }
    }
  });

  return updatedBackPanels;
};
