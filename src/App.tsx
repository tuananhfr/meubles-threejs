import { useEffect, useState } from "react";
import ConfigPanel from "./components/ConfigPanel/ConfigPanel";
import PreviewPanel from "./components/PreviewPanel/PreviewPanel";
import "./css/App.css";

import PriceSection from "./components/ConfigPanel/section/PriceSection";
import ActionButtons from "./components/Button/ActionButtons";

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Panel cấu hình */}
        <div className="col-lg-3 configuration-panel order-lg-1 order-2">
          <h4 className="pb-3 border-bottom">Système d'étagères</h4>

          <ConfigPanel />
        </div>

        {/* Panel xem trước */}
        <div className="col-lg-9 preview-panel order-lg-2 order-1">
          <PreviewPanel />
        </div>
      </div>
      <div className="row border-top">
        {/* Prix */}
        <div className="col-lg-6">
          <PriceSection />
        </div>
        <div className="col-lg-6 d-flex justify-content-end">
          {/* Boutons d'action */}
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}

export default App;
