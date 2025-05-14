import React from "react";
import { useState, useEffect } from "react";
import { useConfig } from "../../context/ConfigContext";
import DimensionControl from "../Section/DimensionControl";

const HeightAdjustmentComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  // State cho chiều cao đang chỉnh sửa
  const [editingHeight, setEditingHeight] = useState(
    columnInfo ? config.columnHeights[columnInfo.index] : config.height
  );

  // Cập nhật state khi columnInfo thay đổi
  useEffect(() => {
    if (columnInfo) {
      const colHeight = config.columnHeights[columnInfo.index] || config.height;
      setEditingHeight(colHeight);
    }
  }, [columnInfo, config.columnHeights, config.height]);

  // Xử lý khi chiều cao thay đổi
  const handleHeightChange = (newHeight: number) => {
    setEditingHeight(newHeight);

    if (columnInfo && columnInfo.index !== undefined) {
      const colIndex = columnInfo.index;
      const newColumnHeights = { ...config.columnHeights };
      newColumnHeights[colIndex] = newHeight;
      updateConfig("columnHeights", newColumnHeights);
      updateConfig("height", newHeight);
    }
  };

  // Tính số kệ dựa trên chiều cao
  const calculateShelvesCount = (height: number) => {
    const cellHeight = config.cellHeight;
    const thickness = config.thickness;
    const shelfSpacing = cellHeight + thickness;

    return Math.max(1, Math.floor((height - 2 * thickness) / shelfSpacing) + 1);
  };

  // Xử lý khi bấm nút Hủy
  const handleBack = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: true,
      isOpenEditHeight: false,
    });
  };

  const handleApply = () => {
    if (!columnInfo || columnInfo.index === undefined) return;

    // Cập nhật thông tin columnInfo
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: true,
      isOpenEditHeight: false,
      selectedColumnInfo: {
        ...columnInfo,
        height: editingHeight,
      },
    });
  };

  return (
    <div>
      <DimensionControl
        label="Hauteur"
        value={editingHeight}
        min={40}
        max={420}
        step={38}
        onChange={handleHeightChange}
      />

      <div className="dimension-info mt-2 mb-3">
        <small>Hauteur actuelle: {Math.round(editingHeight)} cm</small>
        <br />
        <small>
          Nombre d'étagères estimé: {calculateShelvesCount(editingHeight)}
        </small>
      </div>

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
