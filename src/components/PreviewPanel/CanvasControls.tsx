import React from "react";
import "../../css/components/CanvasControls.css";

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onRulerClick,
  onZoomInClick,
  onZoomOutClick,
}) => {
  return (
    <div className="canvas-controls">
      <div className="control-button" onClick={onRulerClick}>
        <div className="icon ruler-icon">
          <div className="ruler-content">
            <i className="bi bi-rulers"></i>
          </div>
        </div>
      </div>
      <div className="control-button" onClick={onZoomInClick}>
        <div className="icon zoom-icon">
          <i className="bi bi-zoom-in"></i>
        </div>
      </div>
      <div className="control-button" onClick={onZoomOutClick}>
        <div className="icon icon zoom-icon">
          <i className="bi bi-zoom-out"></i>
        </div>
      </div>
    </div>
  );
};

export default CanvasControls;
