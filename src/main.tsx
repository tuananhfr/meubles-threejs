import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import ConfigProvider from "./components/context/ConfigProvider.tsx";

const rootMap = new Map<HTMLElement, Root>();

function initShelf3DBlock(container: HTMLElement): void {
  if (rootMap.has(container)) {
    return; // Already initialized
  }

  const root = createRoot(container);
  rootMap.set(container, root);

  root.render(
    <StrictMode>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </StrictMode>
  );
}

function initAllShelf3DBlocks(): void {
  // Tìm tất cả containers có id chứa "shelf-3d"
  const containers = document.querySelectorAll(
    '[id*="shelf-3d"]'
  ) as NodeListOf<HTMLElement>;

  containers.forEach((container) => {
    initShelf3DBlock(container);
  });

  // Fallback cho development
  if (containers.length === 0) {
    const devContainer = document.getElementById("root") as HTMLElement;
    if (devContainer) {
      initShelf3DBlock(devContainer);
    }
  }
}

// Expose globally
declare global {
  interface Window {
    Shelf3DBlock: {
      initAll: () => void;
      init: (containerId: string) => void;
    };
  }
}

window.Shelf3DBlock = {
  initAll: initAllShelf3DBlocks,
  init: (containerId: string) => {
    const container = document.getElementById(containerId) as HTMLElement;
    if (container) {
      initShelf3DBlock(container);
    }
  },
};

// Auto initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllShelf3DBlocks);
} else {
  initAllShelf3DBlocks();
}

export { initAllShelf3DBlocks };
