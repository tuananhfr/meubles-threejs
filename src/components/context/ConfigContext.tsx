import React, { createContext, useContext, useState } from "react";

interface Config {
  width: number;
  height: number;
  depth: number;
  position: "Au sol" | "Suspendu";
  activeView: "Étagère entière" | "Tablettes" | "Panneaux";
  editColumns?: {
    isOpenMenu: boolean;
  };
  editShelf?: {
    isOpenMenu: boolean;
  };
  editFeet?: {
    isOpenMenu: boolean;
  };
  editFacade?: {
    isOpenMenu: boolean;
  };
  editBackboard?: {
    isOpenMenu: boolean;
  };
}

interface ConfigContextType {
  config: Config;
  updateConfig: (key: keyof Config, value: any) => void;
}

const defaultConfig: Config = {
  width: 40,
  height: 40,
  depth: 36,
  position: "Au sol",
  activeView: "Étagère entière",
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<Config>(defaultConfig);

  const updateConfig = (key: keyof Config, value: any) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [key]: value,
    }));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
