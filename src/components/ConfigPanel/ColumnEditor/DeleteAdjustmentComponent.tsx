import React from "react";
import { useConfig } from "../../context/ConfigContext";

const DeleteColumnComponent: React.FC = () => {
  const { config, batchUpdate } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  const handleDelete = () => {
    if (columnInfo && config.columns > 1) {
      // Đảm bảo luôn còn ít nhất 1 cột
      const colIndex = columnInfo.index;

      // 1. Tạo bản sao của columnWidths và columnHeights
      const newColumnWidths = { ...config.columnWidths };
      const newColumnHeights = { ...config.columnHeights };

      // 2. Dịch chuyển các cột phía sau để lấp vào chỗ trống
      for (let i = colIndex; i < config.columns - 1; i++) {
        newColumnWidths[i] = newColumnWidths[i + 1] || config.cellWidth;
        newColumnHeights[i] = newColumnHeights[i + 1] || config.height;
      }

      // 3. Xóa cột cuối cùng (bây giờ là dư thừa)
      delete newColumnWidths[config.columns - 1];
      delete newColumnHeights[config.columns - 1];

      //  Tính toán width mới
      const newColumns = config.columns - 1;

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

      // 4. Xử lý backpanels
      const newBackPanels = { ...config.backPanels };
      const existingBackPanels = config.backPanels || {};

      // 4.1 Tạo danh sách các panel mới cần thêm vào sau khi dịch chuyển
      const newPanelsToAdd: Record<string, BackPanelsData> = {};

      // 4.2 Xóa tất cả các panel thuộc cột bị xóa
      Object.keys(existingBackPanels).forEach((key) => {
        const panel = existingBackPanels[key];
        if (panel.column === colIndex) {
          delete newBackPanels[key];
        }
      });

      // 4.3 Dịch chuyển tất cả các panel ở cột phía sau cột bị xóa
      Object.keys(existingBackPanels).forEach((key) => {
        const panel = { ...existingBackPanels[key] };

        // Nếu panel thuộc cột phía sau cột bị xóa
        if (panel.column > colIndex) {
          // Tính toán vị trí cột mới (giảm 1)
          const newColIndex = panel.column - 1;

          // Tạo key mới với cột đã dịch
          const newKey = `back-panel-${panel.row}-${newColIndex}`;

          // Tính toán vị trí X mới
          // Cần tính toán vị trí mới dựa trên chiều rộng của cột bị xóa
          const deletedColWidth =
            config.columnWidths[colIndex] || config.cellWidth;

          // Cập nhật thông tin panel
          panel.key = newKey;
          panel.column = newColIndex;

          // Cập nhật vị trí X (dịch sang trái)
          panel.position = [
            panel.position[0] - deletedColWidth, // Dịch X theo chiều rộng của cột bị xóa
            panel.position[1], // Giữ nguyên Y
            panel.position[2], // Giữ nguyên Z
          ];

          // Thêm vào danh sách panel mới
          newPanelsToAdd[newKey] = panel;

          // Xóa panel cũ
          delete newBackPanels[key];
        }
      });

      // 4.4 Kết hợp tất cả các panel còn lại
      const updatedBackPanels: Record<string, BackPanelsData> = {
        ...newBackPanels,
        ...newPanelsToAdd,
      };

      // 5. Xử lý shelves
      const newShelves = { ...config.shelves };
      const existingShelves = config.shelves || {};

      // 5.1 Tạo danh sách các shelf mới sau khi dịch chuyển
      const newShelvesToAdd: Record<string, ShelfData> = {};

      // 5.2 Xóa tất cả các shelf thuộc cột bị xóa
      Object.keys(existingShelves).forEach((key) => {
        const shelf = existingShelves[key];
        if (shelf.column === colIndex) {
          delete newShelves[key];
        }
      });

      // 5.3 Dịch chuyển tất cả các shelf ở cột phía sau cột bị xóa
      Object.keys(existingShelves).forEach((key) => {
        const shelf = { ...existingShelves[key] };

        // Nếu shelf thuộc cột phía sau cột bị xóa
        if (shelf.column > colIndex) {
          // Tính toán vị trí cột mới (giảm 1)
          const newColIndex = shelf.column - 1;

          // Tạo key mới với cột đã dịch
          let newKey: string;
          if (key.includes("virtual")) {
            newKey = `${shelf.row}-${newColIndex}-virtual`;
          } else {
            newKey = `${shelf.row}-${newColIndex}`;
          }

          // Cập nhật thông tin shelf
          shelf.key = newKey;
          shelf.column = newColIndex;

          // Thêm vào danh sách shelf mới
          newShelvesToAdd[newKey] = shelf;

          // Xóa shelf cũ
          delete newShelves[key];
        }
      });

      // 5.4 Kết hợp tất cả các shelf còn lại
      const updatedShelves = {
        ...newShelves,
        ...newShelvesToAdd,
      };

      // 6. Cập nhật tất cả các trạng thái cùng một lúc
      batchUpdate({
        width: newWidth,
        columnWidths: newColumnWidths,
        columnHeights: newColumnHeights,
        columns: newColumns,
        backPanels: updatedBackPanels,
        shelves: updatedShelves,
        editColumns: {
          ...config.editColumns,
          isOpenEditDelete: false,
          isOpenOption: false,
          selectedColumnInfo: null, // Bỏ chọn cột sau khi xóa
        },
      });
    }
  };

  const handleCancel = () => {
    batchUpdate({
      editColumns: {
        ...config.editColumns,
        isOpenEditDelete: false,
        isOpenOption: true,
      },
    });
  };

  // Kiểm tra xem còn bao nhiêu cột
  const onlyOneColumnLeft = config.columns <= 1;

  return (
    <div>
      <h5 className="mb-3">Supprimer la colonne</h5>

      {onlyOneColumnLeft ? (
        <div className="alert alert-warning">
          Impossible de supprimer cette colonne car c'est la seule colonne
          restante. Une étagère doit avoir au moins une colonne.
        </div>
      ) : (
        <div className="alert alert-danger">
          Attention! Cette action va supprimer définitivement la colonne
          sélectionnée. Cette action ne peut pas être annulée.
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Annuler
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={onlyOneColumnLeft}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default DeleteColumnComponent;
