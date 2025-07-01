import React from "react";

import DimensionControl from "./section/DimensionControl";
import OptionButtons from "./section/OptionButtons";
import OptionSection from "./section/OptionSection";
import SelectorButtons from "./section/SelectorButtons";
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

  // Reset activeView to "" when any editor menu opens
  React.useEffect(() => {
    if (isAnyEditorMenuOpen && config.activeView !== "") {
      const updates: any = {
        activeView: "",
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
    if (value === "Suspendu") {
      const currentFeetHeight = config.editFeet?.heightFeet || 0;
      const newHeight = config.height - currentFeetHeight;

      batchUpdate({
        position: value as "Au sol" | "Suspendu",
        editFeet: {
          ...config.editFeet,
          feetType: "sans_pieds",
          heightFeet: 0,
          isOpenMenu: false,
        },
        height: newHeight,
      });
    } else {
      updateConfig("position", value as "Au sol" | "Suspendu");
    }
  };

  const selectorOptions = ["Étagère entière", "Tablettes", "Panneaux"];

  if (config.editFeet?.feetType !== "sans_pieds") {
    selectorOptions.push("Pieds");
  }

  if (config.facadePanels && Object.keys(config.facadePanels).length > 0) {
    selectorOptions.push("Façades");
  }

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

    updateConfig("activeView", newActiveView);

    if (newActiveView === "Tablettes") {
      updateConfig("editShelf", {
        ...config.editShelf,
        isOpenEditTexture: true,
        selectedShelves: [],
        isOpenEditStandard: false,
        isOpenEditReinforced: false,
        isOpenEditDelete: false,
        isOpenMenu: false,
      });
    } else {
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
      updateConfig("editVerticalPanels", {
        ...config.editVerticalPanels,
        isOpenEditTexture: true,
        selectedPanels: [],
      });
    } else {
      if (config.editVerticalPanels?.isOpenEditTexture) {
        updateConfig("editVerticalPanels", {
          ...config.editVerticalPanels,
          isOpenEditTexture: false,
          selectedPanels: [],
        });
      }
    }

    if (newActiveView === "Façades") {
      updateConfig("editFacade", {
        ...config.editFacade,
        isOpenEditTexture: true,
        selectedFacade: [],
        isOpenMenu: false,
      });
    } else {
      if (config.editFacade?.isOpenEditTexture) {
        updateConfig("editFacade", {
          ...config.editFacade,
          isOpenEditTexture: false,
          selectedFacade: [],
          isOpenMenu: false,
        });
      }
    }

    if (newActiveView === "Fonds") {
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
        <div className="accordion" id="configAccordion">
          {/* Dimensions Section */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingDimensions">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseDimensions"
                aria-expanded="true"
                aria-controls="collapseDimensions"
              >
                Dimensions
              </button>
            </h2>
            <div
              id="collapseDimensions"
              className="accordion-collapse collapse show"
              aria-labelledby="headingDimensions"
              data-bs-parent="#configAccordion"
            >
              <div className="accordion-body">
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
                  <label className="dimension-label mb-1">Profondeur</label>
                  <OptionButtons
                    options={["36 cm", "48 cm"]}
                    activeOption={`${config.depth} cm`}
                    onChange={(value: string) =>
                      updateConfig("depth", parseInt(value))
                    }
                    showInfo={true}
                    infoText="Une profondeur de 36cm est idéale pour les pièces étroites, tandis qu'une profondeur de 48cm offre davantage d'espace de rangement"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingConfiguration">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseConfiguration"
                aria-expanded="false"
                aria-controls="collapseConfiguration"
              >
                Configuration
              </button>
            </h2>
            <div
              id="collapseConfiguration"
              className="accordion-collapse collapse"
              aria-labelledby="headingConfiguration"
              data-bs-parent="#configAccordion"
            >
              <div className="accordion-body">
                {/* Poses */}
                <OptionSection title="Poses">
                  <OptionButtons
                    options={["Au sol", "Suspendu"]}
                    activeOption={config.position}
                    onChange={handleChangePoses}
                    showInfo={true}
                    infoText="Si vous optez pour une étagère murale, un mur en béton est le meilleur support de fixation"
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
              </div>
            </div>
          </div>

          {/* Selection & Textures Section */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTextures">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseTextures"
                aria-expanded="false"
                aria-controls="collapseTextures"
              >
                Sélection & Textures
              </button>
            </h2>
            <div
              id="collapseTextures"
              className="accordion-collapse collapse"
              aria-labelledby="headingTextures"
              data-bs-parent="#configAccordion"
            >
              <div className="accordion-body">
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

                {config.activeView === "Façades" && (
                  <TextureSelector type="facade" />
                )}

                {config.activeView === "Fonds" && (
                  <TextureSelector type="backboard" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigPanel;
