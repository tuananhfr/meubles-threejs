import React, { useState } from "react";

import { useConfig } from "../../context/ConfigContext";

// Component con cho Tablettes standards
const StandardShelfComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleCancel = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditStandard: false,
    });
  };

  const selectedShelves = config.editShelf?.selectedShelves || [];
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
      updatedShelves[keyToUpdate].isVirtual = false; // Đánh dấu không phải kệ ảo
      updatedShelves[keyToUpdate].isStandard = true; // Đánh dấu là kệ tiêu chuẩn
      updatedShelves[keyToUpdate].isReinforced = false; // Đánh dấu không phải kệ tăng cường
      updatedShelves[keyToUpdate].isRemoved = false; // Đánh dấu không bị xóa
    });

    // Cập nhật config
    updateConfig("shelves", updatedShelves);

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
