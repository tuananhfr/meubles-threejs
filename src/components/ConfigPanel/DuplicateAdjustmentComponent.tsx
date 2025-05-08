import React from "react";
import { useConfig } from "../context/ConfigContext";

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

      // 5. Cập nhật tất cả các trạng thái cùng một lúc để tránh render nhiều lần
      batchUpdate({
        columnWidths: newColumnWidths,
        columnHeights: newColumnHeights,
        columns: config.columns + 1,
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
