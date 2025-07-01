import { createBackPanel } from "./utils";

/**
 * Hàm helper để lấy trạng thái từ row số nguyên cho row thập phân
 */
const getStateFromIntegerRow = (
  panelKey: string,
  column: number,
  currentRow: number,
  backPanels: Record<string, BackPanelsData>,
  stateKey: "isRemoved" | "permanentlyDeleted"
) => {
  // Kiểm tra nếu row hiện tại là số thập phân
  if (currentRow % 1 !== 0) {
    // Tạo key cho row số nguyên tương ứng
    const integerRow = Math.floor(currentRow);
    const integerPanelKey = `back-panel-${integerRow}-${column}`;

    // Nếu panel số nguyên tồn tại, lấy trạng thái từ đó
    if (
      backPanels &&
      backPanels[integerPanelKey] &&
      backPanels[integerPanelKey][stateKey] !== undefined
    ) {
      return backPanels[integerPanelKey][stateKey];
    }
  }

  // Nếu không phải số thập phân hoặc không tìm thấy panel số nguyên,
  // thì lấy trạng thái từ chính panel hiện tại (nếu có)
  if (
    backPanels &&
    backPanels[panelKey] &&
    backPanels[panelKey][stateKey] !== undefined
  ) {
    return backPanels[panelKey][stateKey];
  }

  // Trả về giá trị mặc định
  return stateKey === "isRemoved" ? true : false;
};

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
        // Giữ nguyên giá trị row không làm tròn vì có thể là số thập phân
        const panelKey = `back-panel-${currentShelf.row}-${column}`;

        // Sử dụng hàm helper để lấy trạng thái
        // Row thập phân sẽ kế thừa trạng thái từ row số nguyên tương ứng
        const isRemoved = getStateFromIntegerRow(
          panelKey,
          column,
          currentShelf.row,
          backPanels,
          "isRemoved"
        );

        const permanentlyDeleted = getStateFromIntegerRow(
          panelKey,
          column,
          currentShelf.row,
          backPanels,
          "permanentlyDeleted"
        );

        // Texture vẫn giữ logic cũ (không cần kế thừa từ row số nguyên)
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

        // Gán lại texture sau khi tạo panel
        if (existingTexture) {
          newPanel.texture = existingTexture;
        }

        updatedBackPanels[panelKey] = newPanel;
      }
    }
  });

  return updatedBackPanels;
};
