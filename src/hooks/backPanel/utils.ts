/**
 * Tính toán thuộc tính mặc định cho một back panel
 */
export const calculateDefaultPanelProperties = (
  column: number,
  row: number,
  getColumnWidth: (col: number) => number,
  getColumnXPosition: (col: number) => number,
  shelfBottomY: number,
  cellHeight: number,
  thickness: number,
  depth: number
) => {
  const colWidth = getColumnWidth(column);
  const colX = getColumnXPosition(column);
  const cellY =
    shelfBottomY + thickness + row * (cellHeight + thickness) + cellHeight / 2;
  const backPanelZ = -depth / 2 + thickness / 2 + 0.0001;

  return {
    position: [colX + colWidth / 2 + thickness / 2, cellY, backPanelZ] as [
      number,
      number,
      number
    ],
    dimensions: [colWidth, cellHeight, thickness] as [number, number, number],
  };
};

/**
 * Tạo một back panel mới với tham số đã cho
 */
export const createBackPanel = (
  key: string,
  row: number,
  column: number,
  position: [number, number, number],
  dimensions: [number, number, number],

  isRemoved: boolean = false,
  permanentlyDeleted: boolean = false
): BackPanelsData => {
  return {
    key,
    row,
    column,
    position,
    dimensions,

    isRemoved,
    permanentlyDeleted,
  };
};

/**
 * Kiểm tra xem một panel có bị xóa vĩnh viễn không
 */
export const isPermanentlyDeletedPanel = (panel: BackPanelsData): boolean => {
  return panel.isRemoved === true && panel.permanentlyDeleted === true;
};

/**
 * Tính vị trí Y của shelf dựa trên row
 */
export const calculateShelfYPosition = (
  row: number,
  shelfBottomY: number,
  cellHeight: number,
  thickness: number
): number => {
  return shelfBottomY + row * (cellHeight + thickness);
};

/**
 * Tính vị trí Y của panel dựa trên row
 */
export const calculatePanelYPosition = (
  row: number,
  shelfBottomY: number,
  cellHeight: number,
  thickness: number
): number => {
  return (
    shelfBottomY + thickness + row * (cellHeight + thickness) + cellHeight / 2
  );
};
