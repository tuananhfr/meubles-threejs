// hooks/usePrice.ts
import { useEffect } from "react";
import { useConfig } from "../components/context/ConfigContext";

// Định nghĩa giá cho từng loại facade
const facadePrices: Record<string, number> = {
  tiroir_17: 25,
  tiroir_36: 35,
  porte_basse_36: 30,
  porte_basse_55: 40,
  porte_haut_74: 50,
  porte_haut_112: 65,
  porte_haut_150: 80,
  porte_haut_188: 95,
  porte_haut_226: 110,
  retire: 0,
};

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
    const { verticalPanels, cellHeight = 36, thickness = 2 } = config;
    let totalVerticalShelves = 0;

    if (verticalPanels) {
      Object.values(verticalPanels).forEach((panel) => {
        const panelHeight = panel.dimensions[1];
        const shelfSpacing = cellHeight + thickness;
        const shelvesInPanel = Math.max(
          1,
          Math.floor((panelHeight - 2 * thickness) / shelfSpacing) + 1
        );
        totalVerticalShelves += shelvesInPanel;
      });
    }

    return totalVerticalShelves;
  };

  // Hàm tính số shelf ngang từ shelves
  const calculateHorizontalShelves = () => {
    const { shelves } = config;
    if (!shelves) return 0;

    return Object.values(shelves).filter(
      (shelf) => !shelf.isRemoved && !shelf.isVirtual
    ).length;
  };

  // Hàm tính số back panels
  const calculateBackPanels = () => {
    const { backPanels } = config;
    if (!backPanels) return 0;

    let totalPrice = 0;

    Object.values(backPanels).forEach((panel) => {
      if (!panel.isRemoved && !panel.permanentlyDeleted) {
        const panelHeight = panel.dimensions[1];
        const panelPrice = (20 / config.cellHeight) * 100 * panelHeight;
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

    // Giá theo loại chân
    const feetPrices = {
      sans_pieds: 0,
      design: 30,
      classic: 40,
    };

    return feetPrices[feetType as keyof typeof feetPrices] || 0;
  };

  // Hàm cập nhật componentPrice dựa trên số lượng thành phần
  const updateComponentPrices = () => {
    const verticalShelvesCount = calculateVerticalShelves();
    const horizontalShelvesCount = calculateHorizontalShelves();
    const backPanelsPrice = calculateBackPanels();
    const facadePanelsPrice = calculateFacadePanels(); // Đây giờ là tổng giá, không phải số lượng
    const feetPrice = calculateFeetPrice();

    // Tính giá cho từng thành phần
    const newComponentPrice = {
      priceVerticalShelves: verticalShelvesCount * 20,
      priceHorizontalShelves: horizontalShelvesCount * 20,
      priceBackPanels: backPanelsPrice,
      priceFacadePanels: facadePanelsPrice, // Đã là tổng giá
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
