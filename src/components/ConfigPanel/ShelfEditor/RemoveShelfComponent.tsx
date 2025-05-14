import { useConfig } from "../../context/ConfigContext";

const RemoveShelfComponent: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBack = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditDelete: false,
    });
  };
  const handleConfirmRemove = () => {
    // Lấy danh sách kệ đã chọn
    const selectedShelves = config.editShelf?.selectedShelves || [];

    if (!selectedShelves.length) {
      return;
    }

    // Sao chép sâu đối tượng shelves
    const updatedShelves = JSON.parse(JSON.stringify(config.shelves || {}));

    // Xử lý từng kệ đã chọn
    selectedShelves.forEach((shelf) => {
      // Format key cho kệ - GIỮ NGUYÊN ĐỊNH DẠNG
      const key = shelf.isVirtual
        ? `${shelf.row}-${shelf.column}-virtual`
        : `${shelf.row}-${shelf.column}`;

      // Format key thật và key ảo cho việc xử lý
      const realKey = `${shelf.row}-${shelf.column}`;
      const virtualKey = `${shelf.row}-${shelf.column}-virtual`;

      // 1. Đánh dấu kệ hiện tại là đã xóa
      if (!updatedShelves[key]) {
        // Tạo mới nếu chưa tồn tại
        updatedShelves[key] = {
          key: key,
          row: shelf.row,
          column: shelf.column,
          isVirtual: shelf.isVirtual,
        };
      }

      // Đánh dấu kệ là đã xóa và không còn là kệ tiêu chuẩn hoặc tăng cường
      updatedShelves[key].isRemoved = true;
      updatedShelves[key].isStandard = false;
      updatedShelves[key].isReinforced = false;

      // 2. Xử lý đặc biệt với kệ nửa hàng thật (row không phải số nguyên)
      // Nếu là kệ thật nửa hàng, cũng đánh dấu kệ ảo tương ứng là đã xóa
      if (!shelf.isVirtual && shelf.row % 1 !== 0) {
        if (!updatedShelves[virtualKey]) {
          // Tạo mới kệ ảo nếu chưa tồn tại
          updatedShelves[virtualKey] = {
            key: virtualKey,
            row: shelf.row,
            column: shelf.column,
            isVirtual: true,
          };
        }

        // Đánh dấu kệ ảo tương ứng là đã xóa
        updatedShelves[virtualKey].isRemoved = true;
        updatedShelves[virtualKey].isStandard = false;
        updatedShelves[virtualKey].isReinforced = false;
      }
    });

    // Cập nhật lại config
    updateConfig("shelves", updatedShelves);

    // Đóng panel xóa và reset trạng thái chọn
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenMenu: true,
      isOpenOption: false,
      isOpenEditDelete: false,
      selectedShelves: [],
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
