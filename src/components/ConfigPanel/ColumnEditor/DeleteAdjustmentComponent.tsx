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

      // 4. Cập nhật tất cả các trạng thái cùng một lúc
      batchUpdate({
        columnWidths: newColumnWidths,
        columnHeights: newColumnHeights,
        columns: config.columns - 1,
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
