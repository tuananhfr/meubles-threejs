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
  const initialHeight = 116; // Chiều cao mặc định
  const initialWidth = 116; // Chiều rộng tổng ban đầu
  const initialDepth = 35; // Chiều sâu mặc định
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
    columnHeights: initialColumnHeights,
    columnWidths: initialColumnWidths,
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

  // Hàm cập nhật cấu hình
  const updateConfig = <K extends keyof ConfigState>(
    key: K,
    value: ConfigState[K]
  ) => {
    setConfig({
      ...config,
      [key]: value,
    });
  };

  // Effect để tính số cột dựa vào chiều rộng
  useEffect(() => {
    const newColumns = Math.max(
      1,
      Math.round((config.width - config.thickness * 2) / 38)
    );
    if (config.columns !== newColumns) {
      // Cập nhật số cột
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
          columnHeights: updatedColumnHeights,
          columnWidths: updatedColumnWidths,
        };
      });
    }
  }, [config.width, config.thickness, config.columns]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
