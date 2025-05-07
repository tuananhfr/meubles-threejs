import DimensionControl from "./section/DimensionControl";
import OptionButtons from "./section/OptionButtons";
import OptionSection from "./section/OptionSection";
import SelectorButtons from "./section/SelectorButtons";

import "../../css/components/ConfigPanel.css";

import ColumnEditorPanel from "./ColumnEditorPanel";
import { useConfig } from "../context/ConfigContext";

const ConfigPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleActionClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenMenu: true,
    });
  };
  return (
    <>
      {config.editColumns.isOpenMenu ? (
        <ColumnEditorPanel />
      ) : (
        <div>
          {/* Largeur */}
          <DimensionControl
            label="Largeur"
            value={config.width}
            min={40}
            max={420}
            step={38}
            onChange={(value) => updateConfig("width", value)}
          />

          {/* Hauteur */}
          <DimensionControl
            label="Hauteur"
            value={config.height}
            min={40}
            max={420}
            step={38}
            onChange={(value) => updateConfig("height", value)}
          />

          {/* Profondeur */}
          <div className="dimension-control">
            <label className="dimension-label">Profondeur</label>
            <OptionButtons
              options={["35 cm", "47 cm"]}
              activeOption={`${config.depth} cm`}
              onChange={(value) => updateConfig("depth", parseInt(value))}
              showInfo={true}
            />
          </div>

          {/* Poses */}
          <OptionSection title="Poses">
            <OptionButtons
              options={["Au sol", "Suspendu"]}
              activeOption={config.position}
              onChange={(value) =>
                updateConfig("position", value as "Au sol" | "Suspendu")
              }
              showInfo={true}
            />
          </OptionSection>

          {/* Colonnes */}

          <OptionSection
            title="Colonnes"
            actionText="Éditer"
            onActionClick={handleActionClick}
          />

          {/* Pieds */}
          <OptionSection
            title="Pieds"
            actionText="Ajouter/Supprimer"
            onActionClick={() => alert("Modifier pieds")}
          />

          {/* Façades */}
          <OptionSection
            title="Façades"
            actionText="Ajouter/Supprimer"
            onActionClick={() => alert("Modifier façades")}
          />

          {/* Fonds */}
          <OptionSection
            title="Fonds"
            actionText="Ajouter/Supprimer"
            onActionClick={() => alert("Modifier fonds")}
          />

          {/* Tablettes */}
          <OptionSection
            title="Tablettes"
            actionText="Ajouter/Supprimer"
            onActionClick={() => alert("Modifier tablettes")}
          />

          {/* Sélecteurs */}
          <SelectorButtons
            options={["Étagère entière", "Tablettes", "Panneaux"]}
            activeOption={config.activeView}
            onChange={(value) =>
              updateConfig(
                "activeView",
                value as "Étagère entière" | "Tablettes" | "Panneaux"
              )
            }
          />
        </div>
      )}
    </>
  );
};

export default ConfigPanel;
