import React from "react";
import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";

const FacadeEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editFacade", {
      ...config.editFacade,
      isOpenMenu: false,
    });
  };
  return (
    <div>
      <div className="mb-3">
        <BackButton onClick={handleBackClick} />
      </div>
    </div>
  );
};

export default FacadeEditorPanel;
