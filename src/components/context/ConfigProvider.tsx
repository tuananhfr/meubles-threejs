// src/context/ConfigProvider.tsx
import { ReactNode, useState, useEffect } from "react";
import { ConfigContext } from "./ConfigContext";
import oakTexture from "../../assets/images/samples-oak-wood-effect-800x800.jpg";

import walnutTexture from "../../assets/images/samples-walnut-wood-effect-800x800.jpg";
import wengeTexture from "../../assets/images/samples-wenge-wood-effect-800x800.jpg";
import whiteTexture from "../../assets/images/white_u11209.jpg";
import lightGreyTexture from "../../assets/images/light_grey_u12044.jpg";
import taupeTexture from "../../assets/images/taupe_u15133.jpg";

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

  const textures = [
    { name: "Oak", src: oakTexture },
    { name: "Walnut", src: walnutTexture },
    { name: "Wenge", src: wengeTexture },
    { name: "White", src: whiteTexture },
    { name: "Light Grey", src: lightGreyTexture },
    { name: "Taupe", src: taupeTexture },
  ];

  // Khởi tạo shelves mặc định - KHÔNG có texture riêng
  const initializeShelves = () => {
    const initialShelves: Record<string, ShelfData> = {};

    // Tạo kệ cho mỗi vị trí hàng x cột
    for (let col = 0; col < initialColumns; col++) {
      // Tính số hàng thực tế cho cột này
      const shelfSpacing = initialcellHeight + initialThickness;
      const actualRows = Math.max(
        1,
        Math.floor((initialHeight - 2 * initialThickness) / shelfSpacing) + 1
      );

      // Kệ đáy (row 0) - luôn là kệ tiêu chuẩn
      initialShelves[`0-${col}`] = {
        key: `0-${col}`,
        row: 0,
        column: col,
        isVirtual: false,
        isStandard: true,
        isReinforced: false,
        isRemoved: false,
        // Không set texture mặc định, để dùng config.texture
      };

      // Kệ đỉnh - luôn là kệ tiêu chuẩn
      initialShelves[`${actualRows}-${col}`] = {
        key: `${actualRows}-${col}`,
        row: actualRows,
        column: col,
        isVirtual: false,
        isStandard: true,
        isReinforced: false,
        isRemoved: false,
        // Không set texture mặc định
      };

      // Các kệ ở giữa - mặc định là kệ tiêu chuẩn
      for (let row = 1; row < actualRows; row++) {
        initialShelves[`${row}-${col}`] = {
          key: `${row}-${col}`,
          row: row,
          column: col,
          isVirtual: false,
          isStandard: true, // Mặc định là kệ tiêu chuẩn
          isReinforced: false,
          isRemoved: false,
          // Không set texture mặc định
        };
      }

      // Các kệ ảo giữa các kệ thật
      for (let row = 0; row < actualRows; row++) {
        const virtualKey = `${row + 0.5}-${col}-virtual`;
        initialShelves[virtualKey] = {
          key: virtualKey,
          row: row + 0.5,
          column: col,
          isVirtual: true,
          isStandard: false,
          isReinforced: false,
          isRemoved: false,
          // Không set texture mặc định
        };
      }
    }

    return initialShelves;
  };

  // Định nghĩa interface cho backPanelsData

  // Khởi tạo state
  const [config, setConfig] = useState<ConfigState>({
    width: initialWidth,
    height: initialHeight,
    depth: initialDepth,
    price: 0,
    originalPrice: 0,
    componentPrice: {
      priceBackPanels: 0,
      priceHorizontalShelves: 0,
      priceVerticalShelves: 0,
      priceFacadePanels: 0,
      priceFeet: 0,
    },
    thickness: initialThickness,
    position: "Au sol",
    activeView: "",
    columns: initialColumns,
    rows: initialRows,
    texture: textures[0],
    listTextures: textures,
    columnHeights: initialColumnHeights,
    columnWidths: initialColumnWidths,
    columnWidthsOption: "36 cm",
    shelves: initializeShelves(),
    backPanels: {},
    facadePanels: {},
    verticalPanels: {},
    editColumns: {
      isOpenMenu: false,
      isOpenOption: false,
      isOpenEditHeight: false,
      isOpenEditWidth: false,
      isOpenEditDuplicate: false,
      isOpenEditDelete: false,
      selectedColumnInfo: null,
    },
    editShelf: {
      isOpenMenu: false,
      isOpenOption: false,
      isOpenEditStandard: false,
      isOpenEditReinforced: false,
      isOpenEditDelete: false,
      isOpenEditTexture: false,
      selectedShelves: [],
    },
    editFeet: {
      isOpenMenu: false,
      feetType: "sans_pieds",
      heightFeet: 0,
      texture: textures[0],
    },
    editFacade: {
      isOpenMenu: false,
      isOpenEditTexture: false,
      facadeType: "",
      heightFacade: 0,
      selectedFacade: [],
    },
    editBackboard: {
      isOpenMenu: false,
      isSurfaceTotal: false,
      isDeleteTotal: true,
      isSurfaceOption: false,
      isOpenEditTexture: false,
      selectedBackboard: [],
    },
    editVerticalPanels: {
      // ADDED: Edit state cho vertical panels
      isOpenEditTexture: false,
      selectedPanels: [],
    },
    cellHeight: initialcellHeight,
    cellWidth: initialcellWidth,
  });

  // Hàm tính lại width tổng dựa trên columnWidths và số cột
  const calculateTotalWidth = (
    columnWidths: ColumnDimensions,
    columns: number,
    thickness: number
  ): number => {
    // Tính tổng width của tất cả các cột
    let totalColumnWidth = 0;
    for (let i = 0; i < columns; i++) {
      totalColumnWidth += columnWidths[i] || 0;
    }

    // Tổng thickness = thickness * (số cột + 1)
    const totalThickness = thickness * (columns + 1);

    // Width tổng = tổng width các cột + tổng thickness
    return totalColumnWidth + totalThickness;
  };

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
        // Tính toán mức chênh lệch chiều cao
        const heightDifference = newHeight - prevConfig.height;

        // Tính chiều cao tối thiểu cho 1 row (cellHeight + 2*thickness)
        const minColumnHeight =
          prevConfig.cellHeight + 2 * prevConfig.thickness;

        // Tạo đối tượng columnHeights mới
        const updatedColumnHeights: ColumnDimensions = {};

        // Cập nhật chiều cao cho tất cả các cột
        for (let i = 0; i < prevConfig.columns; i++) {
          // Tính chiều cao mới cho cột
          const newColumnHeight =
            prevConfig.columnHeights[i] + heightDifference;

          // Đảm bảo chiều cao không thấp hơn mức tối thiểu
          updatedColumnHeights[i] = Math.max(newColumnHeight, minColumnHeight);
        }

        // Kiểm tra xem có cột nào bị giới hạn bởi minHeight không
        const hasConstrainedColumns = Object.values(updatedColumnHeights).some(
          (height, index) =>
            height === minColumnHeight &&
            prevConfig.columnHeights[index] + heightDifference < minColumnHeight
        );

        // Nếu có cột bị giới hạn, tính lại height tổng dựa trên cột cao nhất thực tế
        let finalTotalHeight = newHeight;
        if (hasConstrainedColumns) {
          const maxActualColumnHeight = Math.max(
            ...Object.values(updatedColumnHeights)
          );
          finalTotalHeight =
            maxActualColumnHeight + (prevConfig.editFeet?.heightFeet || 0);
        }

        return {
          ...prevConfig,
          [key]: finalTotalHeight, // Sử dụng height đã được điều chỉnh
          columnHeights: updatedColumnHeights,
        };
      });
    } else if (key === "editFeet") {
      // Xử lý khi cập nhật thông tin chân kệ
      const newFeetInfo = value as ConfigState["editFeet"];
      const oldFeetInfo = config.editFeet;

      // Nếu chiều cao chân thay đổi
      if (newFeetInfo.heightFeet !== oldFeetInfo.heightFeet) {
        // Cập nhật heightFeet thay đổi chiều cao tổng thể mà không thay đổi số hàng
        const heightDifference =
          newFeetInfo.heightFeet - oldFeetInfo.heightFeet;

        setConfig((prevConfig) => {
          return {
            ...prevConfig,
            [key]: newFeetInfo,
            height: prevConfig.height + heightDifference,
            // KHÔNG cập nhật columnHeights vì chúng ta muốn giữ nguyên cấu trúc kệ
            // Chỉ tăng chiều cao tổng thể
          };
        });
      } else {
        // Nếu không thay đổi chiều cao chân, xử lý bình thường
        setConfig((prevConfig) => ({
          ...prevConfig,
          [key]: value,
        }));
      }
    } else if (key === "columnHeights") {
      // Xử lý khi cập nhật chiều cao cột
      const updatedColumnHeights = value as ColumnDimensions;

      setConfig((prevConfig) => {
        // Tính chiều cao tối thiểu cho 1 row
        const minColumnHeight =
          prevConfig.cellHeight + 2 * prevConfig.thickness;

        // Áp dụng giới hạn tối thiểu cho tất cả các cột
        const constrainedColumnHeights: ColumnDimensions = {};
        for (let i = 0; i < prevConfig.columns; i++) {
          const columnHeight =
            updatedColumnHeights[i] || prevConfig.columnHeights[i];
          constrainedColumnHeights[i] = Math.max(columnHeight, minColumnHeight);
        }

        // Tính toán chiều cao mới (lấy giá trị lớn nhất trong các cột)
        let maxHeight = 0;
        for (let i = 0; i < prevConfig.columns; i++) {
          maxHeight = Math.max(maxHeight, constrainedColumnHeights[i]);
        }

        // Thêm chiều cao chân vào tổng chiều cao
        const totalHeight = maxHeight + (prevConfig.editFeet?.heightFeet || 0);

        return {
          ...prevConfig,
          [key]: constrainedColumnHeights,
          height: totalHeight,
        };
      });
    } else if (key === "columnWidths") {
      //  Khi cập nhật columnWidths, tự động tính lại width tổng
      const updatedColumnWidths = value as ColumnDimensions;

      setConfig((prevConfig) => {
        // Tính lại width tổng dựa trên columnWidths mới
        const newTotalWidth = calculateTotalWidth(
          updatedColumnWidths,
          prevConfig.columns,
          prevConfig.thickness
        );

        return {
          ...prevConfig,
          [key]: updatedColumnWidths,
          width: newTotalWidth, // Tự động cập nhật width tổng
        };
      });
    } else if (key === "columns") {
      // Khi cập nhật số cột, cũng cần tính lại width
      const newColumns = value as number;

      setConfig((prevConfig) => {
        // Tính lại width tổng với số cột mới
        const newTotalWidth = calculateTotalWidth(
          prevConfig.columnWidths,
          newColumns,
          prevConfig.thickness
        );

        return {
          ...prevConfig,
          [key]: newColumns,
          width: newTotalWidth, // Tự động cập nhật width tổng
        };
      });
    } else if (key === "width") {
      // Khi cập nhật width trực tiếp, tính số cột mới
      const newWidth = value as number;

      setConfig((prevConfig) => {
        // Tính width hiện tại từ columnWidths
        const currentCalculatedWidth = calculateTotalWidth(
          prevConfig.columnWidths,
          prevConfig.columns,
          prevConfig.thickness
        );

        // Tính width chênh lệch
        const widthDifference = newWidth - currentCalculatedWidth;

        // Nếu không có chênh lệch, chỉ cập nhật width
        if (Math.abs(widthDifference) < 1) {
          return {
            ...prevConfig,
            [key]: newWidth,
          };
        }

        // Tính số cột cần thêm/bớt
        const columnSpacing = prevConfig.cellWidth + prevConfig.thickness;
        const columnsToAdd = Math.round(widthDifference / columnSpacing);

        // Tính số cột mới
        const newColumns = Math.max(1, prevConfig.columns + columnsToAdd);

        // Cập nhật columnWidths cho số cột mới
        const updatedColumnWidths: ColumnDimensions = {
          ...prevConfig.columnWidths,
        };
        const updatedColumnHeights: ColumnDimensions = {
          ...prevConfig.columnHeights,
        };

        if (columnsToAdd > 0) {
          // Thêm các cột mới với cellWidth
          for (let i = prevConfig.columns; i < newColumns; i++) {
            updatedColumnWidths[i] = prevConfig.cellWidth;
            updatedColumnHeights[i] =
              prevConfig.columnHeights[0] || prevConfig.height; // Dùng chiều cao của cột đầu tiên hoặc chiều cao tổng
          }
        } else if (columnsToAdd < 0) {
          // Xóa các cột cuối
          for (let i = newColumns; i < prevConfig.columns; i++) {
            delete updatedColumnWidths[i];
            delete updatedColumnHeights[i];
          }
        }

        // Tính lại width chính xác từ columnWidths mới
        const finalWidth = calculateTotalWidth(
          updatedColumnWidths,
          newColumns,
          prevConfig.thickness
        );

        return {
          ...prevConfig,
          width: finalWidth,
          columns: newColumns,
          columnWidths: updatedColumnWidths,
          columnHeights: updatedColumnHeights,
        };
      });
    } else {
      // Xử lý bình thường cho các trường hợp khác
      setConfig((prevConfig) => ({
        ...prevConfig,
        [key]: value,
      }));
    }
  };

  // Effect để tính số hàng dựa vào chiều cao
  useEffect(() => {
    // Tính chiều cao hiệu dụng (trừ đi chiều cao chân nếu có)
    const effectiveHeight = config.editFeet?.heightFeet
      ? config.height - config.editFeet.heightFeet
      : config.height;

    // Cập nhật số hàng dựa trên chiều cao hiệu dụng (không tính phần chân)
    const newRows = Math.max(
      1,
      Math.round((effectiveHeight - config.thickness) / 38)
    );

    // Chỉ cập nhật rows nếu khác với giá trị hiện tại
    if (config.rows !== newRows) {
      setConfig((prev) => ({
        ...prev,
        rows: newRows,
      }));
    }
  }, [
    config.height,
    config.thickness,
    config.editFeet?.heightFeet,
    config.rows, // Thêm config.rows để tránh infinite loop
  ]);

  // useEffect để tự động cập nhật shelves khi columnHeights thay đổi
  useEffect(() => {
    // Chỉ tiếp tục nếu shelves đã được khởi tạo
    if (!config.shelves) return;

    // Tạo một bản sao của shelves hiện tại
    const updatedShelves = { ...config.shelves };
    let shelvesDirty = false;

    // 1. Xử lý thay đổi số cột - xóa kệ ở các cột vượt quá số cột mới
    Object.keys(updatedShelves).forEach((key) => {
      const col = parseInt(key.split("-")[1]);
      if (col >= config.columns) {
        delete updatedShelves[key];
        shelvesDirty = true;
      }
    });

    // 2. Xử lý thay đổi chiều cao
    for (let colIndex = 0; colIndex < config.columns; colIndex++) {
      // Tính số hàng dựa trên chiều cao
      const colHeight = config.columnHeights[colIndex];
      const shelfSpacing = config.cellHeight + config.thickness;
      const expectedRows = Math.max(
        1,
        Math.round((colHeight - config.thickness) / shelfSpacing)
      );

      // Tính số hàng hiện có trong cột này
      const colShelves = Object.keys(updatedShelves).filter((key) => {
        const parts = key.split("-");
        const col = parseInt(parts[1]);
        return col === colIndex && !key.includes("virtual");
      });

      // Tìm số hàng cao nhất trong cột này
      let highestRow = 0;
      colShelves.forEach((key) => {
        const row = parseFloat(key.split("-")[0]);
        if (row > highestRow) highestRow = row;
      });

      // Nếu số hàng không khớp, cần cập nhật shelves
      if (expectedRows !== highestRow) {
        shelvesDirty = true;

        if (expectedRows > highestRow) {
          // THÊM KỆ mới khi tăng chiều cao

          // 1. Thêm kệ thật mới
          for (let row = highestRow + 1; row <= expectedRows; row++) {
            const shelfId = `${row}-${colIndex}`;
            updatedShelves[shelfId] = {
              key: shelfId,
              row: row,
              column: colIndex,
              isVirtual: false,
              isStandard: true,
              isReinforced: false,
              isRemoved: false,
              // Không set texture mặc định cho shelf mới
            };
          }

          // 2. Thêm kệ ảo mới
          for (let row = Math.floor(highestRow); row < expectedRows; row++) {
            const virtualRow = row + 0.5;
            if (virtualRow < expectedRows) {
              const virtualShelfId = `${virtualRow}-${colIndex}-virtual`;
              // Chỉ thêm nếu chưa tồn tại
              if (!updatedShelves[virtualShelfId]) {
                updatedShelves[virtualShelfId] = {
                  key: virtualShelfId,
                  row: virtualRow,
                  column: colIndex,
                  isVirtual: true,
                  isStandard: false,
                  isReinforced: false,
                  isRemoved: false,
                  // Không set texture mặc định cho shelf ảo mới
                };
              }
            }
          }
        } else {
          // XÓA KỆ khi giảm chiều cao

          // Xóa tất cả kệ (thật và ảo) có row > expectedRows
          Object.keys(updatedShelves).forEach((key) => {
            const parts = key.split("-");
            const row = parseFloat(parts[0]);
            const col = parseInt(parts[1]);

            if (col === colIndex && row > expectedRows) {
              delete updatedShelves[key];
            }
          });

          // Đảm bảo kệ đỉnh tồn tại
          const topShelfId = `${expectedRows}-${colIndex}`;
          updatedShelves[topShelfId] = {
            key: topShelfId,
            row: expectedRows,
            column: colIndex,
            isVirtual: false,
            isStandard: true,
            isReinforced: false,
            isRemoved: false,
            // Không set texture mặc định cho kệ đỉnh mới
          };
        }
      }
    }

    // Chỉ cập nhật state nếu có thay đổi
    if (shelvesDirty) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        shelves: updatedShelves,
      }));
    }
  }, [
    config.columnHeights,
    config.columns,
    config.cellHeight,
    config.thickness,
  ]);

  // useEffect để xử lý thay đổi số cột (khi columns thay đổi từ việc cập nhật width)
  useEffect(() => {
    // Chỉ tiếp tục nếu shelves đã được khởi tạo
    if (!config.shelves) return;

    // Tạo một bản sao của shelves hiện tại
    const updatedShelves = { ...config.shelves };
    let shelvesDirty = false;

    // Tìm cột lớn nhất trong shelves hiện tại
    let maxColumnInShelves = -1;
    Object.keys(updatedShelves).forEach((key) => {
      const col = parseInt(key.split("-")[1]);
      if (col > maxColumnInShelves) {
        maxColumnInShelves = col;
      }
    });

    // Nếu số cột hiện tại nhỏ hơn cột lớn nhất trong shelves
    // => Đã giảm số cột, cần xóa shelves ở cột vượt quá
    if (config.columns <= maxColumnInShelves) {
      // Xóa tất cả các shelf thuộc cột >= config.columns
      Object.keys(updatedShelves).forEach((key) => {
        const col = parseInt(key.split("-")[1]);
        if (col >= config.columns) {
          delete updatedShelves[key];
          shelvesDirty = true;
        }
      });
    }
    // Nếu số cột hiện tại lớn hơn cột lớn nhất đã có trong shelves
    // => Đã tăng số cột, cần thêm shelves cho cột mới
    else if (config.columns > maxColumnInShelves + 1) {
      // Thêm các shelf mới cho cột mới
      for (
        let colIndex = maxColumnInShelves + 1;
        colIndex < config.columns;
        colIndex++
      ) {
        // Tính số hàng dựa trên chiều cao
        const colHeight = config.columnHeights[colIndex];
        const shelfSpacing = config.cellHeight + config.thickness;
        const expectedRows = Math.max(
          1,
          Math.round((colHeight - config.thickness) / shelfSpacing)
        );

        // Thêm kệ đáy (row 0)
        updatedShelves[`0-${colIndex}`] = {
          key: `0-${colIndex}`,
          row: 0,
          column: colIndex,
          isVirtual: false,
          isStandard: true,
          isReinforced: false,
          isRemoved: false,
          // Không set texture mặc định cho kệ đáy mới
        };

        // Thêm kệ đỉnh
        updatedShelves[`${expectedRows}-${colIndex}`] = {
          key: `${expectedRows}-${colIndex}`,
          row: expectedRows,
          column: colIndex,
          isVirtual: false,
          isStandard: true,
          isReinforced: false,
          isRemoved: false,
          // Không set texture mặc định cho kệ đỉnh mới
        };

        // Thêm kệ ở giữa
        for (let row = 1; row < expectedRows; row++) {
          updatedShelves[`${row}-${colIndex}`] = {
            key: `${row}-${colIndex}`,
            row: row,
            column: colIndex,
            isVirtual: false,
            isStandard: true,
            isReinforced: false,
            isRemoved: false,
            // Không set texture mặc định cho kệ giữa mới
          };
        }

        // Thêm kệ ảo
        for (let row = 0; row < expectedRows; row++) {
          const virtualRow = row + 0.5;
          if (virtualRow < expectedRows) {
            updatedShelves[`${virtualRow}-${colIndex}-virtual`] = {
              key: `${virtualRow}-${colIndex}-virtual`,
              row: virtualRow,
              column: colIndex,
              isVirtual: true,
              isStandard: false,
              isReinforced: false,
              isRemoved: false,
              // Không set texture mặc định cho kệ ảo mới
            };
          }
        }

        shelvesDirty = true;
      }
    }

    // Chỉ cập nhật state nếu có thay đổi
    if (shelvesDirty) {
      setConfig((prevConfig) => ({
        ...prevConfig,
        shelves: updatedShelves,
      }));
    }
  }, [
    config.columns,
    config.columnHeights,
    config.cellHeight,
    config.thickness,
  ]);

  return (
    <ConfigContext.Provider value={{ config, updateConfig, batchUpdate }}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
