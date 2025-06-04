// ActionButtons.tsx
import React from "react";

const ActionButtons: React.FC = () => {
  const handleExportPNG = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) {
      alert("Không tìm thấy canvas!");
      return;
    }

    const camera = (window as Window).__THREE_CAMERA__;
    const controls = (window as Window).__THREE_CONTROLS__;

    if (camera && controls) {
      // Đặt lại vị trí camera mặc định
      camera.position.set(0, 0, 2.5);
      camera.lookAt(0, 0, 0);
      controls.update();
    }

    requestAnimationFrame(() => {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "shelf_export.png";
      link.click();
    });
  };

  const handleExportGLB = () => {
    const scene = (window as Window).__THREE_SCENE__;
    if (!scene) {
      return;
    }

    import("three-stdlib")
      .then(({ GLTFExporter }) => {
        const exporter = new GLTFExporter();

        exporter.parse(
          scene,
          (result) => {
            if (result instanceof ArrayBuffer) {
              const blob = new Blob([result], { type: "model/gltf-binary" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "shelf_model.glb";
              link.click();
            } else {
              console.warn("Expected binary GLB format, got JSON (GLTF).");
            }
          },
          (error) => {
            console.error("Error exporting GLB:", error);
          },
          { binary: true }
        );
      })
      .catch(() => {
        console.error(
          "Could not load GLTFExporter. Please ensure you have the necessary dependencies installed."
        );
      });
  };

  const handleSaveDesign = () => {
    handleExportGLB();
    handleExportPNG();
  };

  return (
    <div className="d-flex align-items-center h-100">
      <button onClick={handleSaveDesign} className="btn btn-primary">
        <i className="bi bi-heart pe-2"></i>
        ENREGISTRER DESIGN
      </button>
    </div>
  );
};

export default ActionButtons;
