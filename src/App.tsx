import ConfigPanel from "./components/ConfigPanel/ConfigPanel";
import PreviewPanel from "./components/PreviewPanel/PreviewPanel";
import "./css/App.css";

import ActionButtons from "./components/Button/ActionButtons";
import PriceSection from "./components/ConfigPanel/Section/PriceSection";

function App() {
  return (
    <div className="container-fluid d-flex flex-column vh-100">
      {/* Main content area */}
      <div className="row flex-grow-1 overflow-hidden">
        {/* Configuration panel */}
        <div className="col-lg-3 configuration-panel order-lg-1 order-2 h-100">
          <div className="h-100 d-flex flex-column">
            <h4 className="pb-3 border-bottom sticky-top bg-white">
              Système d'étagères
            </h4>
            <div className="flex-grow-1 overflow-auto">
              <ConfigPanel />
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className="col-lg-9 preview-panel order-lg-2 order-1 h-100">
          <div className="h-100">
            <PreviewPanel />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="row border-top bg-light" style={{ height: "70px" }}>
        <div className="col-lg-6 d-flex align-items-center px-3">
          <PriceSection />
        </div>
        <div className="col-lg-6 d-flex justify-content-end align-items-center px-3">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}

export default App;
