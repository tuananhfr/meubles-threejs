// hooks/useBackPanelManager.ts
import { useCallback } from "react";
import { useShelfCalculations } from "./useShelfCalculations";
import { useConfig } from "../components/context/ConfigContext";
import { calculateShelfYPosition } from "./backPanel/utils";
import { syncBackPanelsWithShelves } from "./backPanel/syncBackPanels";

/**
 * Hook để quản lý các back panel
 */
export const useBackPanelManager = () => {
  const { config } = useConfig();
  const {
    thickness,
    depth,
    cellHeight,
    shelfBottomY,
    getColumnWidth,
    getColumnXPosition,
  } = useShelfCalculations();

  // Tính vị trí Y của kệ dựa trên row
  const getShelfYPosition = useCallback(
    (row: number) => {
      return calculateShelfYPosition(row, shelfBottomY, cellHeight, thickness);
    },
    [shelfBottomY, cellHeight, thickness]
  );

  /**
   * Đồng bộ toàn bộ backpanels dựa trên shelves hiện tại
   */
  const syncBackPanels = useCallback(
    (
      backPanels: Record<string, BackPanelsData>
    ): Record<string, BackPanelsData> => {
      return syncBackPanelsWithShelves(
        config.shelves,
        backPanels,
        getShelfYPosition,
        getColumnWidth,
        getColumnXPosition,

        thickness,
        depth
      );
    },
    [
      config.shelves,
      getShelfYPosition,
      getColumnWidth,
      getColumnXPosition,
      shelfBottomY,
      cellHeight,
      thickness,
      depth,
    ]
  );

  /* Xử lý backpanel khi xóa kệ - chỉ cần đồng bộ lại
   */
  const handleBackPanelOnShelfRemove = useCallback(
    (
      backPanels: Record<string, BackPanelsData>
    ): Record<string, BackPanelsData> => {
      // Khi xóa kệ, chỉ cần đồng bộ lại backpanels theo shelves
      return syncBackPanels(backPanels);
    },
    [syncBackPanels]
  );

  /**
   * Xử lý backpanel khi thêm kệ - chỉ cần đồng bộ lại
   */
  const handleBackPanelOnShelfAdd = useCallback(
    (
      backPanels: Record<string, BackPanelsData>
    ): Record<string, BackPanelsData> => {
      // Khi thêm kệ, chỉ cần đồng bộ lại backpanels theo shelves
      return syncBackPanels(backPanels);
    },
    [syncBackPanels]
  );

  return {
    handleBackPanelOnShelfRemove,
    handleBackPanelOnShelfAdd,
    syncBackPanels,
  };
};
