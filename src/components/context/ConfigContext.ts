// src/context/ConfigContext.ts
import { createContext, useContext } from "react";

// Tạo context với giá trị mặc định là undefined
export const ConfigContext = createContext<ConfigContextType | undefined>(
  undefined
);

// Hook để sử dụng context
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
