import { useState, useEffect, useRef } from "react";
import { useConfig } from "../../context/ConfigContext";

const widthOptions = ["36 cm", "48 cm"];
const WidthAdjustmentComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const columnInfo = config.editColumns.selectedColumnInfo;

  // Lưu giá trị chiều rộng ban đầu để khôi phục khi hủy
  const originalWidth = useRef<number | null>(null);

  // Sử dụng state của component để theo dõi giá trị được chỉnh sửa
  const [selectedWidth, setSelectedWidth] = useState<string>(
    columnInfo ? `${config.columnWidths[columnInfo.index]} cm` : "36 cm"
  );

  // Cập nhật selectedWidth và lưu giá trị ban đầu khi columnInfo thay đổi
  useEffect(() => {
    if (columnInfo) {
      const currentWidth = config.columnWidths[columnInfo.index];

      // Lưu giá trị ban đầu nếu chưa được lưu
      if (originalWidth.current === null) {
        originalWidth.current = currentWidth;
      }

      const formattedWidth = `${currentWidth} cm`;
      setSelectedWidth(
        widthOptions.includes(formattedWidth) ? formattedWidth : "36 cm"
      );
    }
  }, [columnInfo, config.columnWidths]);

  const handleWidthSelect = (widthOption: string) => {
    setSelectedWidth(widthOption);

    if (columnInfo) {
      // Trích xuất số từ chuỗi (ví dụ: "36 cm" -> 36)
      const numericWidth = parseInt(widthOption.split(" ")[0]);

      // Cập nhật columnWidths tạm thời
      const newColumnWidths = { ...config.columnWidths };
      newColumnWidths[columnInfo.index] = numericWidth;
      updateConfig("columnWidths", newColumnWidths);

      // Cập nhật columnInfo tạm thời
      const updatedColumnInfo = {
        ...columnInfo,
        width: numericWidth,
      };

      // Cập nhật columnInfo trong config
      updateConfig("editColumns", {
        ...config.editColumns,
        selectedColumnInfo: updatedColumnInfo,
      });
    }
  };

  const handleApply = () => {
    if (columnInfo) {
      // Trích xuất số từ chuỗi (ví dụ: "36 cm" -> 36)
      const numericWidth = parseInt(selectedWidth.split(" ")[0]);

      // Cập nhật columnInfo với chiều rộng mới
      const updatedColumnInfo = {
        ...columnInfo,
        width: numericWidth,
      };

      // Cập nhật columnWidths (để đảm bảo)
      const newColumnWidths = { ...config.columnWidths };
      newColumnWidths[columnInfo.index] = numericWidth;

      // Cập nhật state và đóng menu chỉnh sửa
      updateConfig("columnWidths", newColumnWidths);
      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenOption: true,
        isOpenEditWidth: false,
        selectedColumnInfo: updatedColumnInfo,
      });
      updateConfig("width", config.width + 12);

      // Reset giá trị ban đầu
      originalWidth.current = null;
    }
  };

  const handleCancel = () => {
    if (columnInfo && originalWidth.current !== null) {
      // Khôi phục giá trị ban đầu
      const newColumnWidths = { ...config.columnWidths };
      newColumnWidths[columnInfo.index] = originalWidth.current;
      updateConfig("columnWidths", newColumnWidths);

      // Cập nhật columnInfo với chiều rộng ban đầu
      const updatedColumnInfo = {
        ...columnInfo,
        width: originalWidth.current,
      };

      // Đóng menu chỉnh sửa
      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenOption: true,
        isOpenEditWidth: false,
        selectedColumnInfo: updatedColumnInfo,
      });

      // Reset giá trị ban đầu
      originalWidth.current = null;
    } else {
      // Nếu không có giá trị ban đầu, chỉ đóng menu
      updateConfig("editColumns", {
        ...config.editColumns,
        isOpenEditWidth: false,
        isOpenOption: true,
      });
    }
  };

  return (
    <div>
      <h5 className="mb-3">Choisir la largeur</h5>
      <div className="row row-cols-2 g-3 mb-3">
        {widthOptions.map((option, index) => (
          <div className="col" key={index}>
            <button
              className={`btn ${
                selectedWidth === option ? "btn-primary" : "btn-outline-primary"
              } rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center`}
              onClick={() => handleWidthSelect(option)}
            >
              <div>
                <i className="bi bi-arrows fs-2"></i>
              </div>
              <div>{option}</div>
            </button>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={handleApply}>
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default WidthAdjustmentComponent;
