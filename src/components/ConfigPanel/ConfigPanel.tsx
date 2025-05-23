import React from "react";

import DimensionControl from "./section/DimensionControl";
import OptionButtons from "./section/OptionButtons";
import OptionSection from "./section/OptionSection";
import SelectorButtons from "./section/SelectorButtons";
import "../../css/components/ConfigPanel.css";
import ColumnEditorPanel from "./ColumnEditor/ColumnEditorPanel";
import ShelfEditorPanel from "./ShelfEditor/ShelfEditorPanel";
import FeetEditorPanel from "./FeetEditor/FeetEditorPanel";
import FacadeEditorPanel from "./FacadeEditor/FacadeEditorPanel";
import BackboardEditorPanel from "./BackboardEditor/BackboardEditorPanel";
import { useConfig } from "../context/ConfigContext";
import TextureSelector from "./section/TextureSelector";

const ConfigPanel: React.FC = () => {
  const { config, updateConfig, batchUpdate } = useConfig();

  // Check if any editor menu is open
  const isAnyEditorMenuOpen =
    config.editColumns?.isOpenMenu ||
    config.editShelf?.isOpenMenu ||
    config.editFeet?.isOpenMenu ||
    config.editFacade?.isOpenMenu ||
    config.editBackboard?.isOpenMenu;

  // Reset activeView to "Étagère entière" when any editor menu opens
  React.useEffect(() => {
    if (isAnyEditorMenuOpen && config.activeView !== "Étagère entière") {
      // Sử dụng batchUpdate để thực hiện tất cả changes cùng lúc
      const updates: any = {
        activeView: "Étagère entière",
      };

      // Reset texture editing states
      if (config.editShelf?.isOpenEditTexture) {
        updates.editShelf = {
          ...config.editShelf,
          isOpenEditTexture: false,
          selectedShelves: [],
        };
      }

      if (config.editVerticalPanels?.isOpenEditTexture) {
        updates.editVerticalPanels = {
          ...config.editVerticalPanels,
          isOpenEditTexture: false,
          selectedPanels: [],
        };
      }

      if (config.editFacade?.isOpenEditTexture) {
        updates.editFacade = {
          ...config.editFacade,
          isOpenEditTexture: false,
          selectedFacade: [],
        };
      }

      if (config.editBackboard?.isOpenEditTexture) {
        updates.editBackboard = {
          ...config.editBackboard,
          isOpenEditTexture: false,
          selectedBackboard: [],
          isSurfaceTotal: false,
          isDeleteTotal: false,
          isSurfaceOption: false,
        };
      }

      batchUpdate(updates);
    }
  }, [isAnyEditorMenuOpen, config.activeView, batchUpdate]);

  // Logic để hiển thị menu chính
  const isMainMenuOpen = !isAnyEditorMenuOpen;

  // Các hàm xử lý để mở các menu phụ
  const handleEditColumns = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenMenu: true,
    });
  };

  const handleEditShelf = () => {
    updateConfig("editShelf", {
      ...(config.editShelf || {}),
      isOpenMenu: true,
    });
  };

  const handleEditFeet = () => {
    updateConfig("editFeet", {
      ...(config.editFeet || {}),
      isOpenMenu: true,
    });
  };

  const handleEditFacade = () => {
    updateConfig("editFacade", {
      ...(config.editFacade || {}),
      isOpenMenu: true,
    });
  };

  const handleEditBackboard = () => {
    updateConfig("editBackboard", {
      ...(config.editBackboard || {}),
      isOpenMenu: true,
    });
  };

  const handleChangeHeight = (value: number) => {
    updateConfig("height", value);
  };

  const handleChangePoses = (value: string) => {
    // Nếu chọn "Suspendu", reset chân kệ về "sans_pieds" và điều chỉnh chiều cao
    if (value === "Suspendu") {
      // Lưu lại chiều cao chân kệ hiện tại
      const currentFeetHeight = config.editFeet?.heightFeet || 0;

      // Tính toán chiều cao mới (loại bỏ chiều cao chân kệ)
      const newHeight = config.height - currentFeetHeight;

      // Cập nhật cả position, editFeet và height cùng lúc
      batchUpdate({
        position: value as "Au sol" | "Suspendu",
        editFeet: {
          ...config.editFeet,
          feetType: "sans_pieds",
          heightFeet: 0,
          isOpenMenu: false,
        },
        height: newHeight, // Cập nhật height để loại bỏ chiều cao chân kệ
      });
    } else {
      // Nếu không phải "Suspendu", chỉ cập nhật position
      updateConfig("position", value as "Au sol" | "Suspendu");
    }
  };

  const selectorOptions = ["Étagère entière", "Tablettes", "Panneaux"];

  // Only add "Pieds" option if not "sans_pieds"
  if (config.editFeet?.feetType !== "sans_pieds") {
    selectorOptions.push("Pieds");
  }

  if (config.facadePanels && Object.keys(config.facadePanels).length > 0) {
    selectorOptions.push("Façades");
  }

  // Check if there are any back panels that are not removed
  if (config.backPanels && Object.keys(config.backPanels).length > 0) {
    const hasVisibleBackPanels = Object.values(config.backPanels).some(
      (panel) => !panel.isRemoved
    );
    if (hasVisibleBackPanels) {
      selectorOptions.push("Fonds");
    }
  }

  const handleActiveViewChange = (value: string) => {
    const newActiveView = value as
      | "Étagère entière"
      | "Tablettes"
      | "Panneaux"
      | "Façades"
      | "Pieds"
      | "Fonds";

    // Cập nhật activeView
    updateConfig("activeView", newActiveView);

    // Xử lý logic cho isOpenEditTexture
    if (newActiveView === "Tablettes") {
      // Bật chế độ texture cho Tablettes
      updateConfig("editShelf", {
        ...config.editShelf,
        isOpenEditTexture: true,
        selectedShelves: [],
        // Tắt các chế độ khác
        isOpenEditStandard: false,
        isOpenEditReinforced: false,
        isOpenEditDelete: false,
        isOpenMenu: false,
      });
    } else {
      // Tắt chế độ texture cho các view khác
      if (config.editShelf?.isOpenEditTexture) {
        updateConfig("editShelf", {
          ...config.editShelf,
          isOpenEditTexture: false,
          selectedShelves: [],
          isOpenMenu: false,
        });
      }
    }

    if (newActiveView === "Panneaux") {
      // Bật chế độ texture cho Panneaux
      updateConfig("editVerticalPanels", {
        ...config.editVerticalPanels,
        isOpenEditTexture: true,
        selectedPanels: [],
      });
    } else {
      // Tắt chế độ texture cho các view khác
      if (config.editVerticalPanels?.isOpenEditTexture) {
        updateConfig("editVerticalPanels", {
          ...config.editVerticalPanels,
          isOpenEditTexture: false,
          selectedPanels: [],
        });
      }
    }

    if (newActiveView === "Façades") {
      // Bật chế độ texture cho Façades
      updateConfig("editFacade", {
        ...config.editFacade,
        isOpenEditTexture: true,
        selectedFacade: [],
        isOpenMenu: false,
      });
    } else {
      // Tắt chế độ texture cho các view khác
      if (config.editFacade?.isOpenEditTexture) {
        updateConfig("editFacade", {
          ...config.editFacade,
          isOpenEditTexture: false,
          selectedFacade: [],
          isOpenMenu: false,
        });
      }
    }

    // Xử lý logic cho Fonds
    if (newActiveView === "Fonds") {
      // Bật chế độ texture cho Fonds
      updateConfig("editBackboard", {
        ...config.editBackboard,
        isOpenEditTexture: true,
        selectedBackboard: [],
        isOpenMenu: false,
        isSurfaceTotal: false,
        isDeleteTotal: false,
        isSurfaceOption: false,
      });
    } else {
      // Tắt chế độ texture cho các view khác
      if (config.editBackboard?.isOpenEditTexture) {
        updateConfig("editBackboard", {
          ...config.editBackboard,
          isOpenEditTexture: false,
          selectedBackboard: [],
          isOpenMenu: false,
          isSurfaceTotal: false,
          isDeleteTotal: false,
          isSurfaceOption: false,
        });
      }
    }
  };

  return (
    <>
      {/* Hiển thị ColumnEditorPanel nếu editColumns.isOpenMenu = true */}
      {config.editColumns?.isOpenMenu && <ColumnEditorPanel />}

      {/* Hiển thị ShelfEditorPanel nếu editShelf.isOpenMenu = true */}
      {config.editShelf?.isOpenMenu && <ShelfEditorPanel />}

      {/* Hiển thị FeetEditorPanel nếu editFeet.isOpenMenu = true */}
      {config.editFeet?.isOpenMenu && <FeetEditorPanel />}

      {/* Hiển thị FacadeEditorPanel nếu editFacade.isOpenMenu = true */}
      {config.editFacade?.isOpenMenu && <FacadeEditorPanel />}

      {/* Hiển thị BackboardEditorPanel nếu editBackboard.isOpenMenu = true */}
      {config.editBackboard?.isOpenMenu && <BackboardEditorPanel />}

      {/* Hiển thị menu chính nếu không có menu phụ nào đang mở */}
      {isMainMenuOpen && (
        <div>
          {/* Largeur */}
          <DimensionControl
            label="Largeur"
            value={config.width}
            min={40}
            max={420}
            step={38}
            onChange={(value: number) => updateConfig("width", value)}
          />
          {/* Hauteur */}
          <DimensionControl
            label="Hauteur"
            value={config.height}
            min={40 + (config.editFeet?.heightFeet || 0)}
            max={420 + (config.editFeet?.heightFeet || 0)}
            step={38}
            onChange={(value: number) => handleChangeHeight(value)}
          />
          {/* Profondeur */}
          <div className="dimension-control">
            <label className="dimension-label">Profondeur</label>
            <OptionButtons
              options={["36 cm", "48 cm"]}
              activeOption={`${config.depth} cm`}
              onChange={(value: string) =>
                updateConfig("depth", parseInt(value))
              }
              showInfo={true}
            />
          </div>
          {/* Poses */}
          <OptionSection title="Poses">
            <OptionButtons
              options={["Au sol", "Suspendu"]}
              activeOption={config.position}
              onChange={handleChangePoses}
              showInfo={true}
            />
          </OptionSection>
          {/* Colonnes */}
          <OptionSection
            title="Colonnes"
            actionText="Éditer"
            onActionClick={handleEditColumns}
          />
          {/* Pieds - Only show if position is "Au sol" */}
          {config.position === "Au sol" && (
            <OptionSection
              title="Pieds"
              actionText="Ajouter/Supprimer"
              onActionClick={handleEditFeet}
            />
          )}
          {/* Façades */}
          <OptionSection
            title="Façades"
            actionText="Ajouter/Supprimer"
            onActionClick={handleEditFacade}
          />
          {/* Fonds */}
          <OptionSection
            title="Fonds"
            actionText="Ajouter/Supprimer"
            onActionClick={handleEditBackboard}
          />
          {/* Tablettes */}
          <OptionSection
            title="Tablettes"
            actionText="Ajouter/Supprimer"
            onActionClick={handleEditShelf}
          />
          {/* Sélecteurs */}
          <SelectorButtons
            options={selectorOptions}
            activeOption={config.activeView}
            onChange={handleActiveViewChange}
          />
          {/* Các TextureSelector tương ứng với từng view */}
          {config.activeView === "Étagère entière" && (
            <TextureSelector type="entier" />
          )}

          {config.activeView === "Pieds" &&
            config.editFeet?.feetType !== "sans_pieds" && (
              <TextureSelector type="feet" />
            )}

          {config.activeView === "Tablettes" && (
            <TextureSelector type="tablette" />
          )}

          {config.activeView === "Panneaux" && (
            <TextureSelector type="vertical" />
          )}

          {config.activeView === "Façades" && <TextureSelector type="facade" />}

          {config.activeView === "Fonds" && (
            <TextureSelector type="backboard" />
          )}
        </div>
      )}
    </>
  );
};

export default ConfigPanel;
