import React from "react";
import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";

const FacadeEditorPanel: React.FC = () => {
  const { config, updateConfig, batchUpdate } = useConfig();

  const handleBackClick = () => {
    updateConfig("editFacade", {
      ...config.editFacade,
      isOpenMenu: false,
      selectedFacade: [],
      facadeType: "",
      heightFacade: 0,
    });
  };

  // Thêm hàm xử lý khi nhấn nút Annuler
  const handleCancelClick = () => {
    updateConfig("editFacade", {
      ...config.editFacade,
      selectedFacade: [],
    });
  };

  /**
   * Xóa các facade hiện tại nếu chúng chồng chéo với facade mới
   */
  const removeOverlappingFacades = (
    updatedFacadePanels: Record<string, FacadeData>,
    selectedFacadeGroups: any[]
  ) => {
    Object.keys(updatedFacadePanels).forEach((key) => {
      const panel = updatedFacadePanels[key];

      // Tìm các facade group chồng chéo với panel này
      for (const facadeGroup of selectedFacadeGroups) {
        if (panel.column === facadeGroup[0].column) {
          // Tính vị trí Y min/max của facade group
          let minY = Infinity;
          let maxY = -Infinity;

          facadeGroup.forEach((p: FacadeData) => {
            const halfHeight = p.dimensions[1] / 2;
            const topY = p.position[1] + halfHeight;
            const bottomY = p.position[1] - halfHeight;

            minY = Math.min(minY, bottomY);
            maxY = Math.max(maxY, topY);
          });

          // Kiểm tra xem có chồng chéo không
          const panelHalfHeight = panel.dimensions[1] / 2;
          const panelTop = panel.position[1] + panelHalfHeight;
          const panelBottom = panel.position[1] - panelHalfHeight;

          const overlaps =
            (panelBottom <= maxY && panelBottom >= minY) ||
            (panelTop <= maxY && panelTop >= minY) ||
            (panelBottom <= minY && panelTop >= maxY);

          if (overlaps) {
            delete updatedFacadePanels[key];

            break;
          }
        }
      }
    });

    return updatedFacadePanels;
  };

  /**
   * Tạo facade mới từ nhóm facade được chọn
   */
  const createNewFacades = (
    updatedFacadePanels: Record<string, FacadeData>,
    selectedFacadeGroups: any[]
  ) => {
    const newlyAddedFacades: FacadeData[] = [];

    selectedFacadeGroups.forEach((facadeGroup, groupIndex) => {
      if (facadeGroup.length === 1) {
        // Nếu nhóm chỉ có một panel, thêm trực tiếp
        const panel = facadeGroup[0];
        const customKey = `${
          config.editFacade.facadeType
        }-${Date.now()}-${groupIndex}-${panel.column}`;

        const newFacade = {
          key: customKey,
          row: panel.row,
          column: panel.column,
          position: panel.position,
          dimensions: panel.dimensions,
          material: config.texture.name,
        };

        updatedFacadePanels[customKey] = newFacade;
        newlyAddedFacades.push(newFacade);
      } else if (facadeGroup.length > 1) {
        // Nếu nhóm có nhiều panel, gộp thành một panel lớn
        const newFacade = createMergedFacade(facadeGroup, groupIndex);
        updatedFacadePanels[newFacade.key] = newFacade;
        newlyAddedFacades.push(newFacade);
      }
    });

    return { updatedFacadePanels, newlyAddedFacades };
  };

  /**
   * Tạo một facade hợp nhất từ nhiều panel
   */
  const createMergedFacade = (
    facadeGroup: any[],
    groupIndex: number
  ): FacadeData => {
    // Sắp xếp panels theo vị trí Y
    const sortedPanels = [...facadeGroup].sort(
      (a, b) => a.position[1] - b.position[1]
    );

    // Tính toán kích thước và vị trí của panel hợp nhất
    const minY = Math.min(
      ...sortedPanels.map((p) => p.position[1] - p.dimensions[1] / 2)
    );
    const maxY = Math.max(
      ...sortedPanels.map((p) => p.position[1] + p.dimensions[1] / 2)
    );
    const panelWidth = sortedPanels[0].dimensions[0];
    const panelDepth = sortedPanels[0].dimensions[2];
    const panelHeight = maxY - minY;
    const centerY = (maxY + minY) / 2;
    const centerX = sortedPanels[0].position[0];
    const centerZ = sortedPanels[0].position[2];

    const timestamp = Date.now();
    const column = sortedPanels[0].column;
    const customKey = `${config.editFacade.facadeType}-${timestamp}-${groupIndex}-${column}`;

    return {
      key: customKey,
      row: sortedPanels[0].row,
      column: column,
      position: [centerX, centerY, centerZ],
      dimensions: [panelWidth, panelHeight, panelDepth],
      material: config.texture.name,
    };
  };

  /**
   * Xử lý xóa shelf khi thêm Tiroir 36
   */
  const handleRemoveShelvesForTiroir36 = (
    facade: FacadeData,
    updatedShelves: Record<string, ShelfData>
  ) => {
    const { row, column } = facade;

    // Tính toán vị trí row của shelf cần xóa
    const targetRow = row + 0.5;

    // Kiểm tra xem targetRow có phải là số nguyên không
    const isInteger = Number.isInteger(targetRow);

    if (isInteger) {
      // Nếu là số nguyên, đánh dấu shelf thường là đã xóa
      const shelfKey = `${targetRow}-${column}`;
      if (updatedShelves[shelfKey]) {
        updatedShelves[shelfKey].isRemoved = true;
        updatedShelves[shelfKey].isStandard = false;
        updatedShelves[shelfKey].isReinforced = false;
        updatedShelves[shelfKey].isVirtual = false;
      }
    } else {
      // Nếu không phải số nguyên, đánh dấu shelf ảo là đã xóa
      const virtualKey = `${targetRow}-${column}-virtual`;
      if (updatedShelves[virtualKey]) {
        updatedShelves[virtualKey].isRemoved = true;
        updatedShelves[virtualKey].isStandard = false;
        updatedShelves[virtualKey].isReinforced = false;
        updatedShelves[virtualKey].isVirtual = false;
      }
    }

    return updatedShelves;
  };

  /**
   * Tính toán vị trí top shelf dựa vào loại facade
   */
  const calculateTopShelfRow = (facade: FacadeData) => {
    const { row } = facade;
    const facadeType = facade.key.split("-")[0];

    // Tính số panel dựa trên chiều cao theo cm của facade
    // Công thức: 17n + 2(n-1) = height => n = (height + 2) / 19
    const heightInCm = parseInt(facadeType.split("_").pop() || "0");
    const numberOfPanels = Math.round((heightInCm + 2) / 19);

    // Tính toán vị trí của top shelf: mỗi 2 panel = 1 row
    const rowsToAdd = numberOfPanels / 2;
    return row + rowsToAdd;
  };

  /**
   * Thêm hoặc khôi phục shelf thường
   */
  const addOrRestoreShelf = (
    key: string,
    row: number,
    column: number,
    updatedShelves: Record<string, ShelfData>,
    isVirtual: boolean = false
  ) => {
    if (!updatedShelves[key]) {
      // Nếu shelf chưa tồn tại trong cấu trúc dữ liệu, tạo mới
      updatedShelves[key] = {
        key: key,
        row: row,
        column: column,
        isRemoved: false,
        isStandard: !isVirtual,
        isReinforced: false,
        isVirtual: isVirtual,
      };
    } else {
      // Nếu shelf đã tồn tại, chỉ cập nhật các thuộc tính trạng thái, giữ nguyên row và column
      if (
        updatedShelves[key].isRemoved ||
        (isVirtual && !updatedShelves[key].isVirtual)
      ) {
        updatedShelves[key].isRemoved = false;
        updatedShelves[key].isStandard = !isVirtual;
        updatedShelves[key].isReinforced = false;
        updatedShelves[key].isVirtual = isVirtual;
      }
    }

    return updatedShelves;
  };

  /**
   * Thêm shelf top và bottom cho các loại facade không phải tiroir_36
   */
  const handleAddShelvesForNonTiroir = (
    facade: FacadeData,
    updatedShelves: Record<string, ShelfData>
  ) => {
    const { row, column } = facade;

    // Tính vị trí top shelf
    const topShelfRow = calculateTopShelfRow(facade);

    // Kiểm tra xem kệ đã tồn tại chưa trước khi thêm/khôi phục
    const bottomShelfKey = `${row}-${column}`;
    const topShelfKey = `${topShelfRow}-${column}`;
    const bottomVirtualKey = `${row}-${column}-virtual`;
    const topVirtualKey = `${topShelfRow}-${column}-virtual`;

    // Chỉ thêm/khôi phục kệ nếu chúng chưa tồn tại hoặc đã bị xóa
    if (
      !updatedShelves[bottomShelfKey] ||
      updatedShelves[bottomShelfKey].isRemoved
    ) {
      updatedShelves = addOrRestoreShelf(
        bottomShelfKey,
        row,
        column,
        updatedShelves
      );
    }

    if (!updatedShelves[topShelfKey] || updatedShelves[topShelfKey].isRemoved) {
      updatedShelves = addOrRestoreShelf(
        topShelfKey,
        topShelfRow,
        column,
        updatedShelves
      );
    }

    // Xử lý tương tự cho kệ ảo
    if (!Number.isInteger(row)) {
      if (
        !updatedShelves[bottomVirtualKey] ||
        updatedShelves[bottomVirtualKey].isRemoved
      ) {
        updatedShelves = addOrRestoreShelf(
          bottomVirtualKey,
          row,
          column,
          updatedShelves,
          true
        );
      }
    }

    if (!Number.isInteger(topShelfRow)) {
      if (
        !updatedShelves[topVirtualKey] ||
        updatedShelves[topVirtualKey].isRemoved
      ) {
        updatedShelves = addOrRestoreShelf(
          topVirtualKey,
          topShelfRow,
          column,
          updatedShelves,
          true
        );
      }
    }

    return updatedShelves;
  };
  // Trong FacadeEditorPanel.tsx

  /**
   * Xử lý shelves cho các facade mới thêm
   */
  const processShelves = (
    newlyAddedFacades: FacadeData[],
    updatedShelves: Record<string, ShelfData>
  ) => {
    // Xử lý từng facade mới được thêm vào
    newlyAddedFacades.forEach((facade) => {
      const isTiroir36 = facade.key.startsWith("tiroir_36");

      if (isTiroir36) {
        // Nếu là tiroir_36, xóa các shelf ở giữa liên quan
        updatedShelves = handleRemoveShelvesForTiroir36(facade, updatedShelves);

        // THÊM MỚI: Nhưng vẫn thêm shelf top và bottom cho tiroir_36
        updatedShelves = handleAddTopBottomShelvesForTiroir36(
          facade,
          updatedShelves
        );
      } else {
        // Với các loại facade khác, thêm shelf top và bottom
        updatedShelves = handleAddShelvesForNonTiroir(facade, updatedShelves);
      }
    });

    return updatedShelves;
  };

  /**
   * Thêm shelf top và bottom cho tiroir_36
   * Tương tự handleAddShelvesForNonTiroir nhưng chỉ thêm kệ trên và dưới
   */
  const handleAddTopBottomShelvesForTiroir36 = (
    facade: FacadeData,
    updatedShelves: Record<string, ShelfData>
  ) => {
    const { row, column } = facade;

    // Tính vị trí top shelf
    // Với tiroir_36, vị trí top shelf sẽ được tính theo cách riêng
    // Vì chiều cao của tiroir_36 là 36cm, và mỗi kệ cách nhau 19cm
    // Nên row + 2 sẽ là vị trí của kệ top cho tiroir_36
    const topShelfRow = row + 1;

    // Thêm/khôi phục shelf bottom
    const bottomShelfKey = `${row}-${column}`;
    updatedShelves = addOrRestoreShelf(
      bottomShelfKey,
      row,
      column,
      updatedShelves
    );

    // Thêm/khôi phục shelf top
    const topShelfKey = `${topShelfRow}-${column}`;
    updatedShelves = addOrRestoreShelf(
      topShelfKey,
      topShelfRow,
      column,
      updatedShelves
    );

    // Xử lý shelf virtual ở bottom nếu cần
    if (!Number.isInteger(row)) {
      const bottomVirtualKey = `${row}-${column}-virtual`;
      updatedShelves = addOrRestoreShelf(
        bottomVirtualKey,
        row,
        column,
        updatedShelves,
        true
      );
    }

    // Xử lý shelf virtual ở top nếu cần
    if (!Number.isInteger(topShelfRow)) {
      const topVirtualKey = `${topShelfRow}-${column}-virtual`;
      updatedShelves = addOrRestoreShelf(
        topVirtualKey,
        topShelfRow,
        column,
        updatedShelves,
        true
      );
    }

    return updatedShelves;
  };

  /**
   * Xử lý khi nhấn nút Apply
   */
  const handleApplyClick = () => {
    // Lấy danh sách các nhóm facade đã chọn
    const selectedFacadeGroups = config.editFacade?.selectedFacade || [];

    // Kiểm tra xem có phải đang ở chế độ "retire" không
    const isRetireMode = config.editFacade?.facadeType === "retire";

    // Sao chép sâu đối tượng shelves để cập nhật
    let updatedShelves: Record<string, ShelfData> = JSON.parse(
      JSON.stringify(config.shelves || {})
    );

    if (selectedFacadeGroups.length > 0) {
      // Tạo một bản sao của facadePanels hiện tại
      let updatedFacadePanels: Record<string, FacadeData> = {
        ...config.facadePanels,
      };
      let newlyAddedFacades: FacadeData[] = [];

      if (isRetireMode) {
        // Chế độ retire: xóa các panel đã chọn khỏi updatedFacadePanels
        selectedFacadeGroups.forEach((facadeGroup) => {
          facadeGroup.forEach((panel) => {
            if (panel.key && updatedFacadePanels[panel.key]) {
              delete updatedFacadePanels[panel.key];
            }
          });
        });
      } else {
        // Xóa các facade cũ chồng chéo
        updatedFacadePanels = removeOverlappingFacades(
          updatedFacadePanels,
          selectedFacadeGroups
        );

        // Thêm các facade mới
        const result = createNewFacades(
          updatedFacadePanels,
          selectedFacadeGroups
        );
        updatedFacadePanels = result.updatedFacadePanels;
        newlyAddedFacades = result.newlyAddedFacades;

        // Xử lý các shelf dựa trên các facade mới đã thêm
        updatedShelves = processShelves(newlyAddedFacades, updatedShelves);
      }

      // Cập nhật state với batchUpdate
      batchUpdate({
        facadePanels: updatedFacadePanels,
        shelves: updatedShelves,
        editFacade: {
          ...config.editFacade,
          selectedFacade: [],
          facadeType: "",
          heightFacade: 0,
        },
      });
    }
  };

  // Tính chiều cao hiệu dụng (chiều cao kệ không bao gồm chân)
  const effectiveHeight = config.height - (config.editFeet?.heightFeet || 0);

  // Danh sách các loại mặt tiền với hệ số chiều cao tương ứng
  const facadeTypes: FacadeType[] = [
    {
      id: "tiroir_17",
      name: "Tiroir",
      height: 17,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <path
            stroke="currentColor"
            fill="none"
            fillRule="evenodd"
            d="M19.53 28.16v23.68h40.94V28.16zm24.67 7.66h-8.4"
          ></path>
        </svg>
      ),
    },
    {
      id: "tiroir_36",
      name: "Tiroir",
      height: 36,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M24.93 24.93v30.14h30.14V24.93zm18.16 4.86h-6.18"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_basse_36",
      name: "Porte basse",
      height: 36, // Chiếm 85% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.88 57.47h34.24V22.53H22.88zm3.95-30.91h7"></path>{" "}
          </g>
        </svg>
      ),
    },
    // Thêm các loại mặt tiền khác tương tự...
    {
      id: "porte_basse_55",
      name: "Porte basse",
      height: 55, // Chiếm 90% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.85 17.67v44.66h34.3V17.67zm3.08 3.71h7"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_haut_74",
      name: "Porte haut",
      height: 74, // Chiếm 95% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.63 11.71v56.58h34.74V11.71zm3.12 3.91h7.12"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_haut_112",
      name: "Porte haut",
      height: 112, // Chiếm 100% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.63 11.71v56.58h34.74V11.71zm3.12 3.91h7.12"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_haut_150",
      name: "Porte haut",
      height: 150, // Chiếm 105% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.88 11.71v56.58h34.24V11.71zm4.83 25.42v6.38"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_haut_188",
      name: "Porte haut",
      height: 188, // Chiếm 110% chiều cao kệ
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.88 11.71v56.58h34.24V11.71zm4.83 25.42v6.38"></path>
          </g>
        </svg>
      ),
    },
    {
      id: "porte_haut_226",
      name: "Porte haut",
      height: 226,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22.88 11.71v56.58h34.24V11.71zm4.83 25.42v6.38"></path>
          </g>
        </svg>
      ),
    },

    {
      id: "retire",
      name: "Retire",
      height: 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 80 80"
          className=""
          xmlnsXlink="http://www.w3.org/1999/xlink"
          role="img"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.32"
            fill="none"
            fillRule="evenodd"
          >
            <path d="M22 22h36v48H22V22zm-5-6h46v6H17v-6zm14 14v32m9-32v32m9-32v32M31 10h18v6H31v-6z"></path>
          </g>
        </svg>
      ),
    },
  ];

  const handleFacadeTypeChange = (facadeType: FacadeType) => {
    const heightFacade = facadeType.height;

    updateConfig("editFacade", {
      ...config.editFacade,
      facadeType: facadeType.id,
      heightFacade: heightFacade,
      selectedFacade: [],
    });
  };

  const currentFacadeType = config.editFacade?.facadeType || "";

  // Kiểm tra xem có panel nào được chọn không
  const hasSelectedFacade =
    (config.editFacade?.selectedFacade || []).length > 0;

  // Kiểm tra xem có đang ở chế độ retire không
  const isRetireMode = currentFacadeType === "retire";

  const renderContent = () => {
    return (
      <div>
        <div className="my-2 text-secondary">
          Sélectionnez le type de portes pour votre étagère.
        </div>
        <div className="row row-cols-2 g-3 mb-3">
          {facadeTypes.map((facadeType) => {
            // Tính chiều cao mặt tiền dựa trên hệ số
            const facadeHeight = facadeType.height;

            // Kiểm tra xem mặt tiền có phù hợp với chiều cao kệ không
            const isDisabled =
              facadeType.id === "retire"
                ? Object.keys(config.facadePanels || {}).length === 0 // Disable nếu không có facade
                : facadeHeight > effectiveHeight; // Disable nếu chiều cao không phù hợp

            return (
              <div className="col" key={facadeType.id}>
                <button
                  className={`btn ${
                    currentFacadeType === facadeType.id
                      ? "btn-primary"
                      : "btn-outline-primary"
                  } rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center`}
                  onClick={() => handleFacadeTypeChange(facadeType)}
                  disabled={isDisabled}
                  style={{ opacity: isDisabled ? 0.5 : 1 }}
                >
                  <div className="mb-2">{facadeType.icon}</div>
                  <div>{facadeType.name}</div>
                  {facadeType.id !== "retire" && (
                    <div className="mt-1 small">{facadeType.height} cm</div>
                  )}
                  {isDisabled && (
                    <div className="small text-danger mt-1">
                      {facadeType.id === "retire" ? "" : "Hauteur insuffisante"}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Hiển thị 2 nút khi có panel được chọn */}
        {hasSelectedFacade && (
          <div>
            <div className="text-secondary">
              {isRetireMode
                ? "Veuillez confirmer la suppression des façades sélectionnées"
                : "Veuillez confirmer les changements"}
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={handleCancelClick}
              >
                Annuler
              </button>
              <button
                className={`btn ${isRetireMode ? "btn-danger" : "btn-primary"}`}
                onClick={handleApplyClick}
              >
                {isRetireMode ? "Supprimer" : "Appliquer"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-3">
        <BackButton onClick={handleBackClick} />
      </div>
      {renderContent()}
    </div>
  );
};

export default FacadeEditorPanel;
