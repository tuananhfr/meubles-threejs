import React from "react";
import BackButton from "../Button/BackButton";
import { useConfig } from "../context/ConfigContext";
import HeightAdjustmentComponent from "./HeightAdjustmentComponent";
import WidthAdjustmentComponent from "./WidthAdjustmentComponent";

const ColumnEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenMenu: false,
      isOpenOption: false,
      isOpenEditHeight: false,
      isOpenEditWidth: false,
      isOpenEditDuplicate: false,
      isOpenEditDelete: false,
    });
  };

  const handleHeightAdjustClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: false,
      isOpenEditHeight: true,
    });
  };

  const handleWidthAdjustClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: false,
      isOpenEditWidth: true,
    });
  };

  const handleDuplicateClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: false,
      isOpenEditDuplicate: true,
    });
  };

  const handleDeleteClick = () => {
    updateConfig("editColumns", {
      ...config.editColumns,
      isOpenOption: false,
      isOpenEditDelete: true,
    });
  };

  // Render different content based on which option is selected
  const renderContent = () => {
    if (config.editColumns.isOpenEditHeight) {
      return <HeightAdjustmentComponent />;
    }

    if (config.editColumns.isOpenEditWidth) {
      return <WidthAdjustmentComponent />;
    }

    if (config.editColumns.isOpenEditDuplicate) {
      return <div>Duplicate column component</div>;
    }

    if (config.editColumns.isOpenEditDelete) {
      return <div>Delete column component</div>;
    }

    // Default: show the option buttons or instruction
    return config.editColumns.isOpenOption ? (
      <div className="row row-cols-2 g-3 mb-3">
        {/* Nút điều chỉnh chiều cao */}
        <div className="col">
          <button
            className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            onClick={handleHeightAdjustClick}
          >
            <div>
              <i className="bi bi-arrows-vertical fs-2"></i>
            </div>
            <div>
              H:{" "}
              {Math.round(
                config.columnHeights[
                  config.editColumns.selectedColumnInfo!.index
                ]
              )}
              cm
            </div>
          </button>
        </div>

        {/* Nút điều chỉnh chiều rộng */}
        <div className="col">
          <button
            className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            onClick={handleWidthAdjustClick}
          >
            <div>
              <i className="bi bi-arrows fs-2"></i>
            </div>
            <div>
              B: {Math.round(config.editColumns.selectedColumnInfo!.width)} cm
            </div>
          </button>
        </div>

        {/* Nút sao chép */}
        <div className="col">
          <button
            className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            onClick={handleDuplicateClick}
          >
            <div className="mb-2">
              <i className="bi bi-copy fs-2"></i>
            </div>
            <div>Dupliquer</div>
          </button>
        </div>

        {/* Nút xóa */}
        <div className="col">
          <button
            className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
            onClick={handleDeleteClick}
          >
            <div className="mb-2">
              <i className="bi bi-trash fs-2"></i>
            </div>
            <div>Retirer</div>
          </button>
        </div>
      </div>
    ) : (
      <div className="instruction my-2 text-secondary">
        Commencez par sélectionner la colonne à modifier
      </div>
    );
  };

  return (
    <div>
      <div className="mb-3">
        <BackButton onClick={handleBackClick} />
      </div>
      {renderContent()}
    </div>
  );
};

export default ColumnEditorPanel;
