import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";

const ShelfEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editBackboard", {
      ...config.editShelf,
      isOpenMenu: false,
    });
  };

  const handleStandardClick = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,
      // isOpenEditStandard: true,
      // isOpenEditReinforced: false,
      // isOpenEditDelete: false,
    });
  };

  const handleReinforcedClick = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,
      // isOpenEditStandard: false,
      // isOpenEditReinforced: true,
      // isOpenEditDelete: false,
    });
  };

  const handleRemoveClick = () => {
    updateConfig("editBackboard", {
      ...config.editBackboard,
      // isOpenEditStandard: false,
      // isOpenEditReinforced: false,
      // isOpenEditDelete: true,
    });
  };

  const renderContent = () => {
    // Hiển thị components con nếu các trạng thái tương ứng được kích hoạt
    if (config.editShelf?.isOpenEditStandard) {
      return "StandardShelfComponent";
    }

    if (config.editShelf?.isOpenEditReinforced) {
      return "ReinforcedShelfComponent";
    }

    if (config.editShelf?.isOpenEditDelete) {
      return "RemoveShelfComponent";
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
                    <path d="M21 32.6 12.6 41m18.8-8L13.1 51.3m38.7-38.7L43 21.4m19.4-8.8L13.1 61.9m54.3-1.3-6.8 6.8m6.7-17.1L49.9 67.6m17.5-28L39.1 67.9m28.3-39.2L28.7 67.4m38.7-49.2L18.2 67.4M40 30V10h30v60H10V30h30zm0 0V10"></path>
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
                    <path d="M40 30V10h30v60H10V30h30zm0 0V10"></path>
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
