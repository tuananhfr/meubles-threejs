import React from "react";

const ActionButtons: React.FC = () => {
  return (
    <div className="d-flex align-items-center h-100">
      <button className="btn btn-primary">
        <i className="bi bi-heart pe-2"></i>
        <span className="">ENREGISTRER DESIGN</span>
      </button>
    </div>
  );
};

export default ActionButtons;
