import { useConfig } from "../context/ConfigContext";

import { useState, useEffect } from "react";

const WidthtAdjustmentComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  // Sử dụng state của component để theo dõi giá trị được chỉnh sửa
  const [editingHeight, setEditingHeight] = useState(
    columnInfo ? config.columnWidths[columnInfo.index] : config.cellWidth
  );

  // Cập nhật editingHeight khi columnInfo thay đổi
  useEffect(() => {
    if (columnInfo) {
      setEditingHeight(config.columnHeights[columnInfo.index] || config.height);
    }
  }, [columnInfo, config.columnHeights, config.height]);

  const handleHeightChange = (newHeight: number) => {
    // Cập nhật state nội bộ trước để UI phản hồi ngay lập tức
    setEditingHeight(newHeight);

    if (columnInfo && columnInfo.index !== undefined) {
      // Cập nhật trực tiếp
      const colIndex = columnInfo.index;
      const newColumnHeights = { ...config.columnHeights };
      newColumnHeights[colIndex] = newHeight;

      // Gọi updateConfig với đối tượng columnHeights mới
      updateConfig("columnHeights", newColumnHeights);
    }
  };

  const handleApply = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: true,
      isOpenEditHeight: false,
    });
  };

  return (
    <div>
      <div className="row row-cols-2 g-3 mb-3">
        {/* Nút điều chỉnh chiều cao */}
        <div className="col">
          <button className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <div>
              <i className="bi bi-arrows-vertical fs-2"></i>
            </div>
            <div>
              W: {editingHeight}
              cm
            </div>
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-3">
        <button className="btn btn-primary" onClick={handleApply}>
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default WidthtAdjustmentComponent;
