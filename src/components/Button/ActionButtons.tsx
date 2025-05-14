import React from "react";

const ActionButtons: React.FC = () => {
  return (
    <div className="d-flex align-items-center h-100">
      <button className="btn btn-primary me-2">
        <i className="bi bi-heart pe-2"></i>
        ENREGISTRER DESIGN
      </button>
    </div>
  );
};

export default ActionButtons;
