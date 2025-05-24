import React, { useState } from "react";

interface OptionButtonsProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
  showInfo?: boolean;
  infoText?: string;
}

const OptionButtons: React.FC<OptionButtonsProps> = ({
  options,
  activeOption,
  onChange,
  showInfo = false,
  infoText = "Information about this option",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="d-flex align-items-center">
      {options.map((option) => (
        <button
          key={option}
          className={`btn ${
            activeOption === option
              ? "btn-outline-primary"
              : "btn-outline-secondary"
          } rounded-pill me-2 small`}
          onClick={() => onChange(option)}
          style={{ padding: "6px 15px" }}
        >
          {option}
        </button>
      ))}
      {showInfo && (
        <div className="position-relative">
          <span
            className="text-muted ms-2"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="bi bi-info-circle"></i>
          </span>
          {showTooltip && (
            <div
              className="position-absolute bg-dark text-white px-2 py-1 rounded small"
              style={{
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginBottom: "5px",
                whiteSpace: "normal",
                zIndex: 1000,
                width: "300px",
              }}
            >
              {infoText}
              <div
                className="position-absolute"
                style={{
                  top: "100%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "5px solid #000",
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptionButtons;
