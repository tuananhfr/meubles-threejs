// hooks/usePrice.ts
import { useEffect } from "react";
import { useConfig } from "../components/context/ConfigContext";

// Định nghĩa giá cho từng loại facade
const facadePrices: Record<string, number> = {
  tiroir_17: 80,
  tiroir_36: 100,
  porte_basse_36: 30,
  porte_basse_55: 50,
  porte_haut_74: 70,
  porte_haut_112: 90,
  porte_haut_150: 110,
  porte_haut_188: 130,
  porte_haut_226: 150,
  retire: 0,
};

const WOOD_PANEL_PRICE_PER_M2 = 100;

// Hàm helper để lấy giá facade từ key
const getFacadePrice = (facadeKey: string): number => {
  // Extract facade type from key (e.g., "tiroir_36-1640995200000-0-1" -> "tiroir_36")
  const facadeType = facadeKey.split("-")[0];
  return facadePrices[facadeType] || 0;
};

export const usePrice = () => {
  const { config, updateConfig, batchUpdate } = useConfig();

  // Hàm tính số shelf dọc từ verticalPanels
  const calculateVerticalShelves = () => {
    const { verticalPanels, depth } = config;
    let totalPrice = 0;

    if (verticalPanels) {
      Object.values(verticalPanels).forEach((panel) => {
        const panelHeight = panel.dimensions[1];
        const panelPrice =
          ((panelHeight * depth) / 100) * WOOD_PANEL_PRICE_PER_M2; // Số lượng shelf dọc trong panel

        totalPrice += panelPrice;
      });
    }

    return totalPrice;
  };

  // Hàm tính số shelf ngang từ shelves
  const calculateHorizontalShelves = () => {
    const { shelves, depth } = config;
    if (!shelves) return 0;

    let totalPrice = 0;
    Object.values(shelves).forEach((shelf) => {
      if (!shelf.isRemoved && !shelf.isVirtual) {
        const columnIndex = shelf.column || 0;
        const cellWidth = config.columnWidths?.[columnIndex] / 100 || 0;
        const shelfPrice = (depth / 100) * cellWidth * WOOD_PANEL_PRICE_PER_M2;
        totalPrice += shelfPrice;
      }
    });

    return totalPrice;
  };

  // Hàm tính số back panels
  const calculateBackPanels = () => {
    const { backPanels } = config;
    if (!backPanels) return 0;

    let totalPrice = 0;

    Object.values(backPanels).forEach((panel) => {
      if (!panel.isRemoved && !panel.permanentlyDeleted) {
        // 1. Lấy column của panel
        const columnIndex = panel.column || 0;

        // 2. Lấy width từ columnWidths[columnIndex]
        const columnWidth = config.columnWidths?.[columnIndex] / 100;

        // 3. Lấy height của panel
        const panelHeight = panel.dimensions[1];

        // 4. Tính diện tích: width × height
        const panelArea = columnWidth * panelHeight;

        // 5. Tính giá: area × 100/m²
        const panelPrice = panelArea * WOOD_PANEL_PRICE_PER_M2;

        totalPrice += panelPrice;
      }
    });

    return totalPrice;
  };

  // Hàm tính giá facade panels với giá khác nhau cho từng loại
  const calculateFacadePanels = () => {
    const { facadePanels } = config;
    if (!facadePanels) return 0;

    let totalPrice = 0;

    Object.keys(facadePanels).forEach((facadeKey) => {
      const facade = facadePanels[facadeKey];
      if (facade) {
        const facadePrice = getFacadePrice(facadeKey);
        totalPrice += facadePrice;
      }
    });

    return totalPrice;
  };

  // Hàm tính giá chân kệ (feet)
  const calculateFeetPrice = () => {
    const { editFeet } = config;
    if (!editFeet) return 0;

    const feetType = editFeet.feetType || "sans_pieds";

    const designFeetPrice =
      (config.width / 100 - 0.08) *
      (config.depth / 100 - 0.1) *
      2 *
      WOOD_PANEL_PRICE_PER_M2;

    // Giá theo loại chân
    const feetPrices = {
      sans_pieds: 0,
      design: designFeetPrice,
      classic: 20,
    };

    return feetPrices[feetType as keyof typeof feetPrices] || 0;
  };

  // Hàm cập nhật componentPrice dựa trên số lượng thành phần
  const updateComponentPrices = () => {
    const verticalShelvesPrice = calculateVerticalShelves();
    const horizontalShelvesPrice = calculateHorizontalShelves();
    const backPanelsPrice = calculateBackPanels();
    const facadePanelsPrice = calculateFacadePanels();
    const feetPrice = calculateFeetPrice();

    // Tính giá cho từng thành phần
    const newComponentPrice = {
      priceVerticalShelves: verticalShelvesPrice,
      priceHorizontalShelves: horizontalShelvesPrice,
      priceBackPanels: backPanelsPrice,
      priceFacadePanels: facadePanelsPrice,
      priceFeet: feetPrice,
    };

    // Kiểm tra xem có thay đổi không
    const currentComponentPrice = config.componentPrice;
    const hasChanged =
      !currentComponentPrice ||
      currentComponentPrice.priceVerticalShelves !==
        newComponentPrice.priceVerticalShelves ||
      currentComponentPrice.priceHorizontalShelves !==
        newComponentPrice.priceHorizontalShelves ||
      currentComponentPrice.priceBackPanels !==
        newComponentPrice.priceBackPanels ||
      currentComponentPrice.priceFacadePanels !==
        newComponentPrice.priceFacadePanels ||
      currentComponentPrice.priceFeet !== newComponentPrice.priceFeet;

    if (hasChanged) {
      updateConfig("componentPrice", newComponentPrice);
    }
  };

  // Hàm tính tổng giá từ componentPrice
  const updateTotalPrice = () => {
    const { componentPrice } = config;
    if (!componentPrice) return;

    const totalPrice =
      (componentPrice.priceVerticalShelves || 0) +
      (componentPrice.priceHorizontalShelves || 0) +
      (componentPrice.priceBackPanels || 0) +
      (componentPrice.priceFacadePanels || 0) +
      (componentPrice.priceFeet || 0);

    const finalPrice = Math.round(totalPrice * 100) / 100;

    // Chỉ cập nhật nếu giá thay đổi
    if (Math.abs(finalPrice - config.price) > 0.01) {
      const newOriginalPrice = finalPrice / 0.6; // 40% discount

      batchUpdate({
        price: finalPrice,
        originalPrice: newOriginalPrice,
      });
    }
  };

  // Hàm để lấy số lượng facade panels (cho việc hiển thị)
  const getFacadePanelsCount = () => {
    const { facadePanels } = config;
    if (!facadePanels) return 0;
    return Object.keys(facadePanels).length;
  };

  // Hàm để lấy chi tiết giá từng loại facade (cho việc debug hoặc hiển thị chi tiết)
  const getFacadeBreakdown = () => {
    const { facadePanels } = config;
    if (!facadePanels) return {};

    const breakdown: Record<string, { count: number; totalPrice: number }> = {};

    Object.keys(facadePanels).forEach((facadeKey) => {
      const facade = facadePanels[facadeKey];
      if (facade) {
        const facadeType = facadeKey.split("-")[0];
        const facadePrice = getFacadePrice(facadeKey);

        if (!breakdown[facadeType]) {
          breakdown[facadeType] = { count: 0, totalPrice: 0 };
        }

        breakdown[facadeType].count += 1;
        breakdown[facadeType].totalPrice += facadePrice;
      }
    });

    return breakdown;
  };

  // Effect để cập nhật componentPrice khi có thay đổi về số lượng thành phần
  useEffect(() => {
    updateComponentPrices();
  }, [
    config.verticalPanels,
    config.shelves,
    config.backPanels,
    config.facadePanels,
    config.editFeet,
    config.cellHeight,
    config.thickness,
    config.columnWidths,
  ]);

  // Effect để cập nhật tổng giá khi componentPrice thay đổi
  useEffect(() => {
    updateTotalPrice();
  }, [config.componentPrice]);

  // Return các hàm và dữ liệu hữu ích
  return {
    // Số lượng từng loại thành phần
    verticalShelvesCount: calculateVerticalShelves(),
    horizontalShelvesCount: calculateHorizontalShelves(),
    backPanelsPrice: calculateBackPanels(),
    facadePanelsCount: getFacadePanelsCount(), // Số lượng facade panels
    facadePanelsPrice: calculateFacadePanels(), // Tổng giá facade panels
    feetPrice: calculateFeetPrice(),

    // Chi tiết facade breakdown
    facadeBreakdown: getFacadeBreakdown(),

    // Component prices
    componentPrice: config.componentPrice,

    // Total prices
    price: config.price,
    originalPrice: config.originalPrice,

    // Hàm thủ công để force update (nếu cần)
    forceUpdatePrices: () => {
      updateComponentPrices();
      updateTotalPrice();
    },

    // Discount percentage
    discountPercentage: config.originalPrice
      ? Math.round((1 - (config.price || 0) / config.originalPrice) * 100)
      : 0,

    // Hàm helper để lấy giá của một facade type cụ thể
    getFacadePrice,
  };
};
