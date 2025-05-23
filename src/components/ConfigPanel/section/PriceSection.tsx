import React from "react";
import { usePrice } from "../../../hooks/usePrice";

const PriceSection: React.FC = () => {
  const { price, originalPrice } = usePrice();

  return (
    <div className="d-flex align-items-center w-100">
      <div className="d-flex flex-row w-100">
        {/* Cột giá */}
        <div
          className="d-flex flex-column align-items-start me-3"
          style={{ minWidth: 70 }}
        >
          <div className="text-muted text-decoration-line-through fs-5">
            {originalPrice?.toFixed(2)} €
          </div>
          <div className="fs-4" style={{ fontWeight: "bold", color: "#222" }}>
            {price?.toFixed(2)} €
          </div>
        </div>

        {/* Cột thông tin */}
        <div className="d-flex flex-column justify-content-center">
          <div className="text-secondary" style={{ fontSize: 14 }}>
            incl. 20% TVA hors frais de livraison
          </div>
          <div className="text-secondary" style={{ fontSize: 16 }}>
            Livraison sous{" "}
            <span style={{ fontWeight: "bold" }}>6-7 semaines</span>
          </div>
          <div className="text-secondary" style={{ fontSize: 13 }}>
            Le prix le plus bas en 30 jours:{" "}
            <span style={{ color: "#888" }}>
              {((price || 0) * 0.9)?.toFixed(0)} €
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSection;
