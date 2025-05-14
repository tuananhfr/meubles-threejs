import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";
import ReinforcedShelfComponent from "./ReinforcedShelfComponent";
import RemoveShelfComponent from "./RemoveShelfComponent";
import StandardShelfComponent from "./StandardShelfComponent";

const ShelfEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenMenu: false,
      isOpenOption: false,
      isOpenEditStandard: false,
      isOpenEditReinforced: false,
      isOpenEditDelete: false,
    });
  };

  const handleStandardClick = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditStandard: true,
      isOpenEditReinforced: false,
      isOpenEditDelete: false,
    });
  };

  const handleReinforcedClick = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditStandard: false,
      isOpenEditReinforced: true,
      isOpenEditDelete: false,
    });
  };

  const handleRemoveClick = () => {
    updateConfig("editShelf", {
      ...config.editShelf,
      isOpenEditStandard: false,
      isOpenEditReinforced: false,
      isOpenEditDelete: true,
    });
  };

  const renderContent = () => {
    // Hiển thị components con nếu các trạng thái tương ứng được kích hoạt
    if (config.editShelf?.isOpenEditStandard) {
      return <StandardShelfComponent />;
    }

    if (config.editShelf?.isOpenEditReinforced) {
      return <ReinforcedShelfComponent />;
    }

    if (config.editShelf?.isOpenEditDelete) {
      return <RemoveShelfComponent />;
    }
    return (
      <div>
        <div className="my-2 text-secondary">
          Remplacez les plateaux standard par des plateaux renforcés pour une
          plus grande capacité de charge.
        </div>
        <div className="row row-cols-2 g-3 mb-3">
          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleStandardClick}
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
                    <path d="m97.943 73.18-18.396 5.987H1" />
                    <path d="m79.547 86.17 18.396-5.986V73.18H19.396L1 79.167v7.004zm0-7.003v7.004" />
                  </g>
                </svg>
              </div>
              <div>Tablettes standards</div>
            </button>
          </div>

          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleReinforcedClick}
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
                    <g strokeWidth="1.32">
                      <path d="m97.943 73.18-18.396 5.987H1"></path>
                      <path d="m79.547 86.17 18.396-5.986V73.18H19.396L1 79.167v7.004zm0-7.003v7.004"></path>
                    </g>
                    <g transform="translate(31 4)">
                      <circle
                        strokeWidth="3.168"
                        fill="currentColor"
                        cx="18.216"
                        cy="30.888"
                        r="16.632"
                      ></circle>
                      <path
                        d="M18.216 2.376c3.896 0 7.426.601 9.897 1.902.92.484 1.682 1.06 2.184 1.773.382.542.591 1.165.591 1.869 0 2.412-1.842 5.692-4.488 8.2-2.197 2.08-5.039 3.68-8.184 3.68-3.145 0-5.987-1.6-8.184-3.68-2.646-2.508-4.488-5.788-4.488-8.2 0-.704.21-1.327.591-1.87.502-.712 1.263-1.288 2.184-1.772 2.47-1.3 6.001-1.902 9.897-1.902Z"
                        strokeWidth="4.752"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>
              <div>Tablettes renforcées</div>
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center"
              onClick={handleRemoveClick}
            >
              <div className="mb-2">
                <i className="bi bi-trash fs-2"></i>
              </div>
              <div>Retirer</div>
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

export default ShelfEditorPanel;
