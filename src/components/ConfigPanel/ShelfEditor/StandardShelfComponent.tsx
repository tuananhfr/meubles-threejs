import React from "react";
import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";

// Component con cho Tablettes standards
const StandardShelfComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { handleBackPanelOnShelfAdd } = useBackPanelManager();

  const handleCancel = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditStandard: false,
    });
  };

  const selectedShelves = config.editShelf?.selectedShelves || [];

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
          updatedShelves[newRealKey].isStandard = true;
          updatedShelves[newRealKey].isReinforced = false;
          updatedShelves[newRealKey].isRemoved = false;
        } else {
          // Tạo shelf thật mới
          updatedShelves[newRealKey] = {
            key: newRealKey,
            row: row,
            column: column,
            isVirtual: false,
            isStandard: true,
            isReinforced: false,
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
      isOpenEditStandard: false,
      selectedShelves: [],
    });

    // Đóng panel
    handleCancel();
  };

  return (
    <div className="shelf-standard-component">
      <div className="d-flex align-items-center">
        <h5>Tablettes standards</h5>
      </div>

      <div className="my-3">
        <p>Caractéristiques des tablettes standards:</p>
        <ul className="text-secondary">
          <li>Capacité de charge: jusqu'à 70 kg</li>
          <li>Épaisseur: 18 mm</li>
          <li>Matériau: Aggloméré mélaminé</li>
        </ul>
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
    </div>
  );
};

export default StandardShelfComponent;
