import React from "react";
import { useConfig } from "../../context/ConfigContext";

const DuplicateColumnComponent: React.FC = () => {
  const { config, batchUpdate } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  const handleDuplicate = () => {
    if (columnInfo) {
      const colIndex = columnInfo.index;

      // 1. Tạo bản sao của columnWidths và columnHeights
      const newColumnWidths = { ...config.columnWidths };
      const newColumnHeights = { ...config.columnHeights };

      // 2. Sao chép chiều rộng và chiều cao của cột được chọn
      const sourceWidth = config.columnWidths[colIndex] || config.cellWidth;
      const sourceHeight = config.columnHeights[colIndex] || config.height;

      // 3. Dịch chuyển các cột phía sau để nhường chỗ cho cột mới
      // Lưu ý: Phải bắt đầu từ cuối và dịch về phía sau
      for (let i = config.columns; i > colIndex + 1; i--) {
        newColumnWidths[i] = newColumnWidths[i - 1] || config.cellWidth;
        newColumnHeights[i] = newColumnHeights[i - 1] || config.height;
      }

      // 4. Thêm cột mới vào vị trí ngay sau cột được chọn
      newColumnWidths[colIndex + 1] = sourceWidth;
      newColumnHeights[colIndex + 1] = sourceHeight;

      // Tính toán width mới **
      const newColumns = config.columns + 1;

      // Hàm tính width tổng (giống như trong ConfigProvider)
      const calculateTotalWidth = (
        columnWidths: ColumnDimensions,
        columns: number,
        thickness: number
      ): number => {
        let totalColumnWidth = 0;
        for (let i = 0; i < columns; i++) {
          totalColumnWidth += columnWidths[i] || 0;
        }
        const totalThickness = thickness * (columns + 1);
        return totalColumnWidth + totalThickness;
      };

      // Tính width mới
      const newWidth = calculateTotalWidth(
        newColumnWidths,
        newColumns,
        config.thickness
      );

      // 5. Xử lý backpanels
      const newBackPanels = { ...config.backPanels };
      const existingBackPanels = config.backPanels || {};

      // 5.1 Tạo danh sách các panel mới cần thêm vào
      const newPanelsToAdd: Record<string, BackPanelsData> = {};

      // 5.2 Dịch chuyển tất cả các panel ở cột phía sau
      Object.keys(existingBackPanels).forEach((key) => {
        const panel = { ...existingBackPanels[key] };

        // Nếu panel thuộc cột phía sau cột được sao chép
        if (panel.column > colIndex) {
          // Tạo key mới với cột đã dịch
          const newKey = `back-panel-${panel.row}-${panel.column + 1}`;

          // Cập nhật thông tin panel
          panel.key = newKey;
          panel.column = panel.column + 1;

          // Cập nhật vị trí X (dịch sang phải)
          panel.position = [
            panel.position[0] + sourceWidth, // Dịch X theo chiều rộng của cột được sao chép
            panel.position[1], // Giữ nguyên Y
            panel.position[2], // Giữ nguyên Z
          ];

          // Thêm vào danh sách panel mới
          newPanelsToAdd[newKey] = panel;

          // Xóa panel cũ
          delete newBackPanels[key];
        }
      });

      // 5.3 Sao chép các panel từ cột được chọn sang cột mới
      Object.keys(existingBackPanels).forEach((key) => {
        const panel = existingBackPanels[key];

        // Nếu panel thuộc cột được sao chép
        if (panel.column === colIndex) {
          // Tạo key mới cho panel được sao chép
          const newKey = `back-panel-${panel.row}-${colIndex + 1}`;

          // Sao chép thông tin panel
          const duplicatedPanel: BackPanelsData = {
            ...panel,
            key: newKey,
            column: colIndex + 1,
            position: [
              panel.position[0] + sourceWidth, // Dịch X theo chiều rộng của cột
              panel.position[1], // Giữ nguyên Y
              panel.position[2], // Giữ nguyên Z
            ],
          };

          // Thêm vào danh sách panel mới
          newPanelsToAdd[newKey] = duplicatedPanel;
        }
      });

      // 5.4 Kết hợp tất cả các panel
      const updatedBackPanels = {
        ...newBackPanels,
        ...newPanelsToAdd,
      };

      // 6. Xử lý shelves
      const newShelves = { ...config.shelves };
      const existingShelves = config.shelves || {};

      // 6.1 Tạo danh sách các shelf mới cần thêm vào
      const newShelvesToAdd: Record<string, ShelfData> = {};

      // 6.2 Dịch chuyển tất cả các shelf ở cột phía sau
      Object.keys(existingShelves).forEach((key) => {
        const shelf = { ...existingShelves[key] };

        // Nếu shelf thuộc cột phía sau cột được sao chép
        if (shelf.column > colIndex) {
          // Tạo key mới với cột đã dịch
          let newKey: string;
          if (key.includes("virtual")) {
            newKey = `${shelf.row}-${shelf.column + 1}-virtual`;
          } else {
            newKey = `${shelf.row}-${shelf.column + 1}`;
          }

          // Cập nhật thông tin shelf
          shelf.key = newKey;
          shelf.column = shelf.column + 1;

          // Thêm vào danh sách shelf mới
          newShelvesToAdd[newKey] = shelf;

          // Xóa shelf cũ
          delete newShelves[key];
        }
      });

      // 6.3 Sao chép các shelf từ cột được chọn sang cột mới
      Object.keys(existingShelves).forEach((key) => {
        const shelf = existingShelves[key];

        // Nếu shelf thuộc cột được sao chép
        if (shelf.column === colIndex) {
          // Tạo key mới cho shelf được sao chép
          let newKey: string;
          if (key.includes("virtual")) {
            newKey = `${shelf.row}-${colIndex + 1}-virtual`;
          } else {
            newKey = `${shelf.row}-${colIndex + 1}`;
          }

          // Sao chép thông tin shelf
          const duplicatedShelf: ShelfData = {
            ...shelf,
            key: newKey,
            column: colIndex + 1,
          };

          // Thêm vào danh sách shelf mới
          newShelvesToAdd[newKey] = duplicatedShelf;
        }
      });

      // 6.4 Kết hợp tất cả các shelf
      const updatedShelves = {
        ...newShelves,
        ...newShelvesToAdd,
      };

      // 7. Cập nhật tất cả các trạng thái cùng một lúc để tránh render nhiều lần
      batchUpdate({
        width: newWidth,
        columnWidths: newColumnWidths,
        columnHeights: newColumnHeights,
        columns: newColumns,
        backPanels: updatedBackPanels,
        shelves: updatedShelves,
        editColumns: {
          ...config.editColumns,
          isOpenEditDuplicate: false,
          isOpenOption: true,
        },
      });
    }
  };

  const handleCancel = () => {
    batchUpdate({
      editColumns: {
        ...config.editColumns,
        isOpenEditDuplicate: false,
        isOpenOption: true,
      },
    });
  };

  return (
    <div>
      <h5 className="mb-3">Dupliquer la colonne</h5>

      <div className="alert alert-info">
        Cette action va créer une copie identique de la colonne sélectionnée. La
        nouvelle colonne sera placée juste après la colonne actuelle.
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={handleDuplicate}>
          Dupliquer
        </button>
      </div>
    </div>
  );
};

export default DuplicateColumnComponent;
