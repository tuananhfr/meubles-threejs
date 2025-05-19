import React from "react";
import { useConfig } from "../../context/ConfigContext";

// Component con cho Tablettes standards
const SurfaceOptionComponent: React.FC = () => {
  const { config, updateConfig, batchUpdate } = useConfig();

  const handleCancel = () => {
    // Đóng menu tùy chọn và reset danh sách panel đã chọn
    updateConfig("editBackboard", {
      ...config.editBackboard,
      isSurfaceOption: false,
      selectedBackboard: [],
    });
  };

  const handleApply = () => {
    // Nếu không có panel nào được chọn, chỉ đóng menu
    if (config.editBackboard.selectedBackboard.length === 0) {
      updateConfig("editBackboard", {
        ...config.editBackboard,
        isSurfaceOption: false,
      });
      return;
    }

    // Tạo bản sao của backPanels hiện tại
    const updatedBackPanels = { ...config.backPanels };

    // Cập nhật trạng thái isRemoved cho mỗi panel đã chọn
    config.editBackboard.selectedBackboard.forEach((selectedPanel) => {
      const panelKey = selectedPanel.key;

      if (updatedBackPanels[panelKey]) {
        // Bỏ qua các panel đã xóa vĩnh viễn
        if (updatedBackPanels[panelKey].permanentlyDeleted) {
          return;
        }

        // Buộc giá trị isRemoved thành ngược lại với giá trị hiện tại
        const currentIsRemoved = updatedBackPanels[panelKey].isRemoved;

        updatedBackPanels[panelKey] = {
          ...updatedBackPanels[panelKey],
          isRemoved: !currentIsRemoved,
        };
      }
    });

    // Cập nhật state bằng cách trực tiếp sử dụng updatedBackPanels
    // thay vì sử dụng batchUpdate nếu có vấn đề
    batchUpdate({
      backPanels: updatedBackPanels,
      editBackboard: {
        ...config.editBackboard,
        isSurfaceOption: false,
        selectedBackboard: [],
      },
    });
  };

  return (
    <div className="shelf-standard-component">
      <div className="my-2 text-secondary">
        Cliquez sur une section pour ajouter ou supprimer des panneaux de fond.
      </div>
      <div className="d-flex justify-content-between my-3">
        <button className="btn btn-secondary me-2" onClick={handleCancel}>
          Annuler
        </button>
        <button
          className="btn btn-primary"
          onClick={handleApply}
          disabled={config.editBackboard.selectedBackboard.length === 0} // Disable nếu không có panel nào được chọn
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};

export default SurfaceOptionComponent;
