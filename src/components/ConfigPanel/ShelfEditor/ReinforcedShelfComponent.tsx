import React from "react";

import { useConfig } from "../../context/ConfigContext";

const ReinforcedShelfComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();

  // Lấy danh sách kệ đã chọn
  const selectedShelves = config.editShelf?.selectedShelves || [];

  // Kiểm tra những kệ nào đã là kệ tăng cường
  const isReinforcedShelf = (shelfInfo: any) => {
    return shelfInfo.isReinforced;
  };

  const handleApply = () => {
    // Lấy danh sách kệ đã chọn
    const selectedShelves = config.editShelf?.selectedShelves || [];

    if (!selectedShelves.length) {
      handleCancel();
      return;
    }

    // Sao chép sâu đối tượng shelves
    const updatedShelves = JSON.parse(JSON.stringify(config.shelves || {}));

    // Xử lý từng kệ đã chọn
    selectedShelves.forEach((shelf) => {
      // Format keys
      const row = shelf.row;
      const column = shelf.column;

      // Xác định key cần cập nhật
      const keyToUpdate = shelf.isVirtual
        ? `${row}-${column}-virtual` // Nếu là kệ ảo, cập nhật kệ ảo
        : `${row}-${column}`; // Nếu là kệ thật, cập nhật kệ thật

      // Đảm bảo kệ tồn tại
      if (!updatedShelves[keyToUpdate]) {
        updatedShelves[keyToUpdate] = {
          key: keyToUpdate,
          row: row,
          column: column,
        };
      }

      // Cập nhật các thuộc tính
      updatedShelves[keyToUpdate].isVirtual = false;
      updatedShelves[keyToUpdate].isStandard = false;
      updatedShelves[keyToUpdate].isReinforced = true;
      updatedShelves[keyToUpdate].isRemoved = false;
    });

    // Cập nhật config
    updateConfig("shelves", updatedShelves);

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
