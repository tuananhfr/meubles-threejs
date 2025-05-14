import React from "react";
import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";

const BackboardEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,
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

export default BackboardEditorPanel;
