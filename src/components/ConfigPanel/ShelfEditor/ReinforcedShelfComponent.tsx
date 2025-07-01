import React from "react";

import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";

const ReinforcedShelfComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { handleBackPanelOnShelfAdd } = useBackPanelManager();

  // Lấy danh sách kệ đã chọn
  const selectedShelves = config.editShelf?.selectedShelves || [];

  // Kiểm tra những kệ nào đã là kệ tăng cường
  const isReinforcedShelf = (shelfInfo: ShelfInfo) => {
    return shelfInfo.isReinforced;
  };

  const handleApply = () => {
    // Lấy danh sách kệ đã chọn
    if (!selectedShelves.length) {
      handleCancel();
      return;
    }

    // Sao chép sâu đối tượng shelves
    const updatedShelves = JSON.parse(JSON.stringify(config.shelves || {}));

    // Xử lý từng kệ đã chọn
    selectedShelves.forEach((shelf) => {
      const row = shelf.row;
      const column = shelf.column;

      if (shelf.isVirtual) {
        // CASE 1: Chuyển đổi shelf ảo thành shelf thật
        const oldVirtualKey = `${row}-${column}-virtual`;
        const newRealKey = `${row}-${column}`;

        // Lưu lại thông tin của shelf ảo cũ (nếu cần preserve một số thuộc tính)
        const oldShelfData = updatedShelves[oldVirtualKey];

        // Xóa shelf ảo cũ
        if (updatedShelves[oldVirtualKey]) {
          delete updatedShelves[oldVirtualKey];
        }

        // Kiểm tra xem shelf thật đã tồn tại chưa
        if (updatedShelves[newRealKey]) {
          // Nếu đã tồn tại, chỉ cập nhật thuộc tính
          updatedShelves[newRealKey].isVirtual = false;
          updatedShelves[newRealKey].isStandard = false;
          updatedShelves[newRealKey].isReinforced = true;
          updatedShelves[newRealKey].isRemoved = false;
        } else {
          // Tạo shelf thật mới
          updatedShelves[newRealKey] = {
            key: newRealKey,
            row: row,
            column: column,
            isVirtual: false,
            isStandard: false,
            isReinforced: true,
            isRemoved: false,
            // Preserve texture nếu shelf ảo cũ có texture
            ...(oldShelfData?.texture && { texture: oldShelfData.texture }),
          };
        }
      } else {
        // CASE 2: Cập nhật shelf thật hiện có
        const realKey = `${row}-${column}`;

        // Đảm bảo shelf thật tồn tại
        if (!updatedShelves[realKey]) {
          updatedShelves[realKey] = {
            key: realKey,
            row: row,
            column: column,
            isVirtual: false,
            isStandard: false,
            isReinforced: false,
            isRemoved: false,
          };
        }

        // Cập nhật thuộc tính để thành standard shelf
        updatedShelves[realKey].isVirtual = false;
        updatedShelves[realKey].isStandard = true;
        updatedShelves[realKey].isReinforced = false;
        updatedShelves[realKey].isRemoved = false;
      }
    });

    // Sử dụng hook useBackPanelManager để xử lý backPanels
    const updatedBackPanels = handleBackPanelOnShelfAdd(
      JSON.parse(JSON.stringify(config.backPanels || {}))
    );

    // Cập nhật config
    updateConfig("shelves", updatedShelves);
    updateConfig("backPanels", updatedBackPanels);

    // Cập nhật trạng thái chỉnh sửa
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditReinforced: false,
      selectedShelves: [],
    });

    // Đóng panel
    handleCancel();
  };

  const handleCancel = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditReinforced: false,
    });
  };
  return (
    <div className="shelf-reinforced-component">
      <div className="d-flex align-items-center">
        <h5>Tablettes renforcées</h5>
      </div>

      <div className="my-3">
        <p>Caractéristiques des tablettes renforcées:</p>
        <ul className="text-secondary">
          <li>Capacité de charge: jusqu'à 120 kg</li>
          <li>Épaisseur: 25 mm</li>
          <li>Matériau: Aggloméré haute densité</li>
          <li>Renfort métallique central</li>
        </ul>
      </div>

      <div className="alert alert-info">
        <small>
          <i className="bi bi-info-circle me-2"></i>
          Les tablettes renforcées offrent une meilleure résistance à la charge
          et sont idéales pour les objets lourds.
        </small>
      </div>

      <div className="d-flex justify-content-between my-3">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={handleApply}
          disabled={selectedShelves.length === 0}
        >
          Appliquer
        </button>
      </div>
      <div className="d-grid gap-2">
        {/* Badge Prix */}
        {selectedShelves.length > 0 && (
          <div className="alert alert-light border d-flex justify-content-between align-items-center">
            <span>Prix supplémentaire:</span>
            <span className="badge bg-primary fs-6">
              +
              {(
                selectedShelves.filter((s) => !isReinforcedShelf(s)).length * 15
              ).toFixed(2)}{" "}
              €
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReinforcedShelfComponent;
