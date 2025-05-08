import { useConfig } from "../context/ConfigContext";
import DimensionControl from "./section/DimensionControl";
import { useState, useEffect } from "react";

const HeightAdjustmentComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  // Sử dụng state của component để theo dõi giá trị được chỉnh sửa
  const [editingHeight, setEditingHeight] = useState(
    columnInfo ? config.columnHeights[columnInfo.index] : config.height
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

  const handleBack = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: true,
      isOpenEditHeight: false,
    });
  };

  const handleApply = () => {
    if (columnInfo) {
      // Cập nhật columnInfo với chiều cao mới
      const updatedColumnInfo = {
        ...columnInfo,
        height: editingHeight,
      };

      // Cập nhật editColumns với thông tin cột đã cập nhật
      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenOption: true,
        isOpenEditHeight: false,
        selectedColumnInfo: updatedColumnInfo,
      });

      // Đảm bảo columnHeights được cập nhật
      const newColumnHeights = { ...config.columnHeights };
      newColumnHeights[columnInfo.index] = editingHeight;
      updateConfig("columnHeights", newColumnHeights);
    }
  };

  return (
    <div>
      <>
        <DimensionControl
          label="Hauteur"
          value={editingHeight} // Sử dụng state nội bộ thay vì trực tiếp từ config
          min={40}
          max={420}
          step={38}
          onChange={handleHeightChange}
        />

        <div className="dimension-info mt-2 mb-3">
          <small>Hauteur actuelle: {Math.round(editingHeight)} cm</small>
        </div>
      </>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-secondary" onClick={handleBack}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={handleApply}>
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default HeightAdjustmentComponent;
