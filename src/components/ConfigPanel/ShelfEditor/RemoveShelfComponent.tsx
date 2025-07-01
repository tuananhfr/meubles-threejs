import React from "react";
import { useConfig } from "../../context/ConfigContext";
import { useBackPanelManager } from "../../../hooks/useBackPanelManager";

const RemoveShelfComponent: React.FC = () => {
  const { config, batchUpdate } = useConfig();
  const { handleBackPanelOnShelfRemove } = useBackPanelManager();

  const handleBack = () => {
    batchUpdate({
      editShelf: {
        ...config.editShelf,
        isOpenEditDelete: false,
      },
    });
  };

  // Hàm chính để xử lý xóa kệ
  const handleConfirmRemove = () => {
    // Lấy danh sách kệ đã chọn
    const selectedShelves = config.editShelf?.selectedShelves || [];

    if (!selectedShelves.length) {
      return;
    }

    // Sao chép sâu đối tượng shelves
    const updatedShelves = JSON.parse(JSON.stringify(config.shelves || {}));

    // Xử lý từng kệ đã chọn để cập nhật trạng thái shelves
    selectedShelves.forEach((shelf) => {
      if (shelf.isVirtual) {
        // CASE 1: Xử lý virtual shelf - chỉ đánh dấu removed
        const virtualKey = `${shelf.row}-${shelf.column}-virtual`;

        if (!updatedShelves[virtualKey]) {
          updatedShelves[virtualKey] = {
            key: virtualKey,
            row: shelf.row,
            column: shelf.column,
            isVirtual: true,
            isStandard: false,
            isReinforced: false,
            isRemoved: false,
          };
        }

        updatedShelves[virtualKey].isRemoved = true;
        updatedShelves[virtualKey].isStandard = false;
        updatedShelves[virtualKey].isReinforced = false;
      } else {
        // CASE 2: Xử lý real shelf
        const realKey = `${shelf.row}-${shelf.column}`;
        const virtualKey = `${shelf.row}-${shelf.column}-virtual`;

        if (shelf.row % 1 !== 0) {
          // CASE 2A: Real shelf tại vị trí virtual (0.5, 1.5, 2.5...)
          // → Chuyển về virtual shelf

          // Lưu thông tin cũ
          const oldRealShelf = updatedShelves[realKey];

          // Xóa real shelf
          if (updatedShelves[realKey]) {
            delete updatedShelves[realKey];
          }

          // Tạo virtual shelf mới
          updatedShelves[virtualKey] = {
            key: virtualKey,
            row: shelf.row,
            column: shelf.column,
            isVirtual: true,
            isStandard: false,
            isReinforced: false,
            isRemoved: false,
            // Preserve texture nếu có
            ...(oldRealShelf?.texture && { texture: oldRealShelf.texture }),
          };
        } else {
          // CASE 2B: Real shelf tại vị trí standard (0, 1, 2...)
          // → Chỉ đánh dấu removed (không thể xóa hoàn toàn)

          if (!updatedShelves[realKey]) {
            // Tạo mới nếu chưa tồn tại (case edge)
            updatedShelves[realKey] = {
              key: realKey,
              row: shelf.row,
              column: shelf.column,
              isVirtual: false,
              isStandard: false,
              isReinforced: false,
              isRemoved: true,
            };
          } else {
            // Cập nhật shelf hiện có
            updatedShelves[realKey].isRemoved = true;
            updatedShelves[realKey].isStandard = false;
            updatedShelves[realKey].isReinforced = false;
          }
        }
      }
    });

    // Sử dụng hook useBackPanelManager để xử lý backPanels
    const updatedBackPanels = handleBackPanelOnShelfRemove(
      JSON.parse(JSON.stringify(config.backPanels || {}))
    );

    // Cập nhật lại config
    batchUpdate({
      shelves: updatedShelves,
      backPanels: updatedBackPanels,
      editShelf: {
        ...config.editShelf,
        isOpenMenu: true,
        isOpenOption: false,
        isOpenEditDelete: false,
        selectedShelves: [],
      },
    });
  };

  const selectedCount = config.editShelf?.selectedShelves?.length || 0;
  const virtualCount =
    config.editShelf?.selectedShelves?.filter((shelf) => shelf.isVirtual)
      ?.length || 0;

  return (
    <div className="shelf-remove-component">
      <div className="d-flex align-items-center">
        <h5>Retirer des tablettes</h5>
      </div>

      <div className="alert alert-warning mb-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Attention: Cette action est irréversible!
      </div>

      <div className="mb-4">
        {virtualCount > 0 && selectedCount === virtualCount && (
          <div className="alert alert-info">
            <small>
              Vous avez seulement sélectionné des positions virtuelles. Cette
              action n'aura pas d'effet sur votre meuble actuel.
            </small>
          </div>
        )}
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-secondary flex-grow-1"
          onClick={handleBack}
        >
          Annuler
        </button>
        <button
          className="btn btn-danger flex-grow-1"
          onClick={handleConfirmRemove}
          disabled={selectedCount === 0}
        >
          Confirmer
        </button>
      </div>
    </div>
  );
};

export default RemoveShelfComponent;
