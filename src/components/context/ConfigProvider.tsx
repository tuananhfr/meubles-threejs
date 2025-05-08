// src/context/ConfigProvider.tsx
import { ReactNode, useState, useEffect } from "react";
import { ConfigContext } from "./ConfigContext";

interface ConfigProviderProps {
  children: ReactNode;
}

// Chỉ export component này từ file
const ConfigProvider = ({ children }: ConfigProviderProps) => {
  // Khởi tạo các tham số
  const initialColumns = 3; // Số cột ban đầu
  const initialRows = 3; // Số hàng ban đầu

  const initialHeight = 116; // Chiều cao mặc định
  const initialWidth = 116; // Chiều rộng tổng ban đầu
  const initialDepth = 36; // Chiều sâu mặc định
  const initialThickness = 2; // Độ dày vách ngăn
  const initialcellHeight = 36; // Chiều cao của ô
  const initialcellWidth = 36; // Chiều rộng của ô

  // Tính toán chiều rộng mặc định cho mỗi cột (trừ đi độ dày vách ngăn)
  const totalThickness = initialThickness * (initialColumns + 1); // Tổng độ dày các vách ngăn
  const defaultColumnWidth = Math.floor(
    (initialWidth - totalThickness) / initialColumns
  );

  // Khởi tạo các đối tượng cho columnHeights và columnWidths
  const initialColumnHeights: ColumnDimensions = {};
  const initialColumnWidths: ColumnDimensions = {};

  // Sử dụng vòng lặp để khởi tạo giá trị cho từng cột
  for (let i = 0; i < initialColumns; i++) {
    initialColumnHeights[i] = initialHeight;
    initialColumnWidths[i] = defaultColumnWidth;
  }

  // Khởi tạo state
  const [config, setConfig] = useState<ConfigState>({
    width: initialWidth,
    height: initialHeight,
    depth: initialDepth,
    thickness: initialThickness,
    position: "Au sol",
    activeView: "Étagère entière",
    columns: initialColumns,
    rows: initialRows,

    columnHeights: initialColumnHeights,
    columnWidths: initialColumnWidths,
    columnWidthsOption: "36 cm",
    editColumns: {
      isOpenMenu: false,
      isOpenOption: false,
      isOpenEditHeight: false,
      isOpenEditWidth: false,
      isOpenEditDuplicate: false,
      isOpenEditDelete: false,
      selectedColumnInfo: null,
    },
    cellHeight: initialcellHeight,
    cellWidth: initialcellWidth,
  });

  // Thêm một hàm mới để cập nhật nhiều thuộc tính cùng lúc
  const batchUpdate = (updates: Partial<ConfigState>) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...updates,
    }));
  };

  // Hàm cập nhật cấu hình
  const updateConfig = <K extends keyof ConfigState>(
    key: K,
    value: ConfigState[K]
  ) => {
    // Xử lý đặc biệt khi cập nhật chiều cao tổng thể
    if (key === "height") {
      const newHeight = value as number;

      setConfig((prevConfig) => {
        // Tạo đối tượng columnHeights mới
        const updatedColumnHeights: ColumnDimensions = {};

        // Cập nhật chiều cao cho tất cả các cột
        // Phân biệt giữa các cột đã được tùy chỉnh và chưa tùy chỉnh
        for (let i = 0; i < prevConfig.columns; i++) {
          // Kiểm tra xem cột có được tùy chỉnh chiều cao chưa
          const currentColumnHeight = prevConfig.columnHeights[i];
          const isCustomHeight = currentColumnHeight !== prevConfig.height;

          if (isCustomHeight) {
            // Nếu đã tùy chỉnh, giữ tỷ lệ với chiều cao mới
            const ratio = currentColumnHeight / prevConfig.height;
            updatedColumnHeights[i] = Math.round(newHeight * ratio);
          } else {
            // Nếu chưa tùy chỉnh, cập nhật bằng chiều cao mới
            updatedColumnHeights[i] = newHeight;
          }
        }

        return {
          ...prevConfig,
          [key]: value,
          columnHeights: updatedColumnHeights,
        };
      });
    }
    // Xử lý đặc biệt cho trường hợp cập nhật thông tin cột
    else if (key === "editColumns") {
      const editColumnsValue = value as typeof config.editColumns;

      // Kiểm tra nếu người dùng đang thay đổi chiều cao cột
      if (
        editColumnsValue.selectedColumnInfo &&
        (editColumnsValue.isOpenEditHeight ||
          (!config.editColumns.isOpenEditHeight &&
            editColumnsValue.isOpenEditHeight))
      ) {
        // Cập nhật bình thường
        setConfig((prevConfig) => ({
          ...prevConfig,
          [key]: value,
        }));
      }
      // Kiểm tra nếu người dùng đã hoàn thành thay đổi chiều cao cột
      else if (
        config.editColumns.isOpenEditHeight &&
        !editColumnsValue.isOpenEditHeight &&
        editColumnsValue.selectedColumnInfo
      ) {
        const columnInfo = editColumnsValue.selectedColumnInfo;
        const columnIndex = columnInfo.index;
        const newColumnHeight = columnInfo.height;

        // Cập nhật chiều cao của cột cụ thể
        setConfig((prevConfig) => {
          const updatedColumnHeights = {
            ...prevConfig.columnHeights,
            [columnIndex]: newColumnHeight,
          };

          return {
            ...prevConfig,
            [key]: value,
            columnHeights: updatedColumnHeights,
          };
        });
      } else {
        // Cập nhật bình thường cho các trường hợp khác
        setConfig((prevConfig) => ({
          ...prevConfig,
          [key]: value,
        }));
      }
    } else {
      // Xử lý bình thường cho các trường hợp khác
      setConfig((prevConfig) => ({
        ...prevConfig,
        [key]: value,
      }));
    }
  };

  // Effect để tính số cột, hàng dựa vào chiều rộng, cao
  // Lưu ý: Chúng ta chỉ muốn kích hoạt effect này khi width, height hoặc thickness thay đổi
  // KHÔNG kích hoạt khi columns hoặc rows thay đổi do việc nhân bản cột
  useEffect(() => {
    // Cập nhật số cột dựa trên chiều rộng
    const newColumns = Math.max(
      1,
      Math.round((config.width - config.thickness * 2) / 38)
    );

    // Cập nhật số hàng dựa trên chiều cao
    const newRows = Math.max(
      1,
      Math.round((config.height - config.thickness) / 38)
    );

    // Kiểm tra xem có cần cập nhật không
    // Chỉ cập nhật nếu số cột hoặc số hàng thay đổi do thay đổi chiều rộng hoặc chiều cao
    if (config.columns !== newColumns || config.rows !== newRows) {
      // Cập nhật số cột và số hàng
      setConfig((prev) => {
        // Cũng cần cập nhật columnHeights và columnWidths khi số cột thay đổi
        const updatedColumnHeights: ColumnDimensions = {};
        const updatedColumnWidths: ColumnDimensions = {};

        // Tính chiều rộng mới cho mỗi cột
        const totalThickness = prev.thickness * (newColumns + 1);
        const newColumnWidth = Math.floor(
          (prev.width - totalThickness) / newColumns
        );

        // Khởi tạo giá trị cho từng cột mới
        for (let i = 0; i < newColumns; i++) {
          // Sử dụng giá trị cũ nếu có, nếu không thì dùng giá trị mặc định
          updatedColumnHeights[i] =
            i < prev.columns && prev.columnHeights[i]
              ? prev.columnHeights[i]
              : prev.height;
          updatedColumnWidths[i] = newColumnWidth; // Luôn cập nhật chiều rộng để phù hợp
        }

        return {
          ...prev,
          columns: newColumns,
          rows: newRows,
          columnHeights: updatedColumnHeights,
          columnWidths: updatedColumnWidths,
        };
      });
    }
  }, [
    config.width,
    config.height,
    config.thickness,
    // Đã loại bỏ config.columns và config.rows từ dependencies
    // để tránh effect này kích hoạt khi nhân bản cột
  ]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, batchUpdate }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
