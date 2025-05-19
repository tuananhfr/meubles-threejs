import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";
import SurfaceOptionComponent from "./SurfaceOptionComponent";

const BackboardEditorPanel: React.FC = () => {
  const { config, updateConfig, batchUpdate } = useConfig();

  const handleBackClick = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,
      isOpenMenu: false,
      isSurfaceOption: false,
    });
  };

  const handleSurfaceTotal = () => {
    if (config.editBackboard.isOpenMenu) {
      // Tạo một đối tượng backPanels mới hoàn toàn
      const updatedBackPanels = {} as Record<string, BackPanelsData>;

      // Sao chép và cập nhật từng panel, bỏ qua các panel đã xóa vĩnh viễn
      if (config.backPanels) {
        Object.keys(config.backPanels).forEach((key) => {
          const panel = config.backPanels[key];

          // Bỏ qua các panel đã xóa vĩnh viễn
          if (panel.permanentlyDeleted) {
            // Vẫn giữ lại panel trong state, nhưng không thay đổi trạng thái isRemoved
            updatedBackPanels[key] = { ...panel };
            return;
          }

          // Cập nhật các panel khác
          updatedBackPanels[key] = {
            ...panel,
            isRemoved: false,
          };
        });
      }

      // Cập nhật state trong một lần duy nhất
      batchUpdate({
        backPanels: updatedBackPanels,
        editBackboard: {
          ...config.editBackboard,
          isSurfaceTotal: true,
          isDeleteTotal: false,
          isSurfaceOption: false,
        },
      });
    }
  };

  const handleDeleteTotal = () => {
    if (config.editBackboard.isOpenMenu) {
      // Tạo một đối tượng backPanels mới hoàn toàn
      const updatedBackPanels = {} as Record<string, BackPanelsData>;

      // Sao chép và cập nhật từng panel
      if (config.backPanels) {
        Object.keys(config.backPanels).forEach((key) => {
          const panel = config.backPanels[key];

          // Không thay đổi trạng thái isRemoved của các panel đã xóa vĩnh viễn
          if (panel.permanentlyDeleted) {
            updatedBackPanels[key] = { ...panel };
            return;
          }

          // Đánh dấu các panel khác là đã xóa
          updatedBackPanels[key] = {
            ...panel,
            isRemoved: true,
          };
        });
      }

      // Cập nhật state trong một lần duy nhất
      batchUpdate({
        backPanels: updatedBackPanels,
        editBackboard: {
          ...config.editBackboard,
          isSurfaceTotal: false,
          isDeleteTotal: true,
          isSurfaceOption: false,
        },
      });
    }
  };

  const handleSurfaceOption = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,

      isSurfaceOption: true,
    });
  };

  const renderContent = () => {
    if (config.editBackboard?.isSurfaceOption) {
      return <SurfaceOptionComponent />;
    }

    return (
      <div>
        <div className="my-2 text-secondary">
          Les panneaux de fond évitent que des objets ne glissent derrière le
          meuble. Attention : les panneaux de fond réduisent la profondeur de
          2cm.
        </div>
        <div className="row row-cols-2 g-3 mb-3">
          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleSurfaceTotal}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 100 100"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="1.32"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <path d="M21 32.6 12.6 41m18.8-8L13.1 51.3m38.7-38.7L43 21.4m19.4-8.8L13.1 61.9m54.3-1.3-6.8 6.8m6.7-17.1L49.9 67.6m17.5-28L39.1 67.9m28.3-39.2L28.7 67.4m38.7-49.2L18.2 67.4M40 30V10h30v60H10V30h30zm0 0V10"></path>
                  </g>
                </svg>
              </div>
              <div>Surface totale</div>
            </button>
          </div>

          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleDeleteTotal}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 100 100"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="1.32"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <path d="M40 30V10h30v60H10V30h30zm0 0V10"></path>
                  </g>
                </svg>
              </div>
              <div>Retirer</div>
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleSurfaceOption}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 100 100"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <g
                    stroke="currentColor"
                    strokeWidth="1.32"
                    fill="none"
                    fillRule="evenodd"
                  >
                    <path d="m67.4 60.6-6.8 6.8m6.7-17.1L49.9 67.6m17.5-28L39.1 67.9m28.3-39.2L28.7 67.4M40 30V10h30v60H10V30h30zm0 0V10"></path>
                  </g>
                </svg>
              </div>
              <div>Placement ciblé</div>
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Hiển thị menu chính nếu không có component con nào được kích hoạt
  return (
    <div>
      <div className="mb-3">
        <BackButton onClick={handleBackClick} />
      </div>
      {renderContent()}
    </div>
  );
};

export default BackboardEditorPanel;
