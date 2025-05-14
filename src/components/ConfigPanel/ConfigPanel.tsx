import React from "react";
import DimensionControl from "./Section/DimensionControl";
import OptionButtons from "./Section/OptionButtons";
import OptionSection from "./Section/OptionSection";
import SelectorButtons from "./Section/SelectorButtons";
import "../../css/components/ConfigPanel.css";
import ColumnEditorPanel from "./ColumnEditor/ColumnEditorPanel";
import ShelfEditorPanel from "./ShelfEditor/ShelfEditorPanel";
import FeetEditorPanel from "./FeetEditor/FeetEditorPanel";
import FacadeEditorPanel from "./FacadeEditor/FacadeEditorPanel";
import BackboardEditorPanel from "./BackboardEditor/BackboardEditorPanel";
import { useConfig } from "../context/ConfigContext";
import TextureSelector from "./Section/TextureSelector";

const ConfigPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  // Logic để hiển thị menu chính
  const isMainMenuOpen =
    !config.editColumns?.isOpenMenu &&
    !config.editShelf?.isOpenMenu &&
    !config.editFeet?.isOpenMenu &&
    !config.editFacade?.isOpenMenu &&
    !config.editBackboard?.isOpenMenu;

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
            min={40}
            max={420}
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
              onChange={(value: string) =>
                updateConfig("position", value as "Au sol" | "Suspendu")
              }
              showInfo={true}
            />
          </OptionSection>
          {/* Colonnes */}
          <OptionSection
            title="Colonnes"
            actionText="Éditer"
            onActionClick={handleEditColumns}
          />
          {/* Pieds */}
          <OptionSection
            title="Pieds"
            actionText="Ajouter/Supprimer"
            onActionClick={handleEditFeet}
          />
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
            options={["Étagère entière", "Tablettes", "Panneaux"]}
            activeOption={config.activeView}
            onChange={(value: string) =>
              updateConfig(
                "activeView",
                value as "Étagère entière" | "Tablettes" | "Panneaux"
              )
            }
          />
          {config.activeView === "Étagère entière" && <TextureSelector />}
        </div>
      )}
    </>
  );
};

export default ConfigPanel;
