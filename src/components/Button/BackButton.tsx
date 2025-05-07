import React from "react";

const BackButton: React.FC<BackButtonProps> = ({ onClick, className = "" }) => {
  return (
    <button
      style={{ textDecoration: "none" }}
      className={`btn btn-link text-secondary p-0 d-flex align-items-center ${className}`}
      onClick={onClick}
    >
      <span className="fs-4 me-2 text-primary">
        <i className="bi bi-chevron-left"></i>
      </span>
      Menu principal
    </button>
  );
};
export default BackButton;
