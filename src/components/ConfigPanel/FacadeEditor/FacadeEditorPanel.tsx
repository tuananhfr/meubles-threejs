import React from "react";
import BackButton from "../../Button/BackButton";
import { useConfig } from "../../context/ConfigContext";

const FacadeEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editFacade", {
      ...config.editFacade,
      isOpenMenu: false,
    });
  };

  const renderContent = () => {
    return (
      <div>
        <div className="my-2 text-secondary">
          Sélectionnez le type de portes pour votre étagère.
        </div>
        <div className="row row-cols-2 g-3 mb-3">
          <div className="col">
            <button className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="15 25 50 30"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <path
                    stroke="currentColor"
                    fill="none"
                    fillRule="evenodd"
                    d="M19.53 28.16v23.68h40.94V28.16zm24.67 7.66h-8.4"
                  ></path>
                </svg>
              </div>
              <div>Surface totale</div>
            </button>
          </div>

          <div className="col">
            <button className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="15 25 50 30"
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
                    <path d="M24.93 24.93v30.14h30.14V24.93zm18.16 4.86h-6.18"></path>
                  </g>
                </svg>
              </div>
              <div>Retirer</div>
            </button>
          </div>
          <div className="col">
            <button className="btn btn-outline-primary rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center">
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="15 25 50 30"
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
                    <path d="M22.88 57.47h34.24V22.53H22.88zm3.95-30.91h7"></path>{" "}
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
  return (
    <div>
      <div className="mb-3">
        <BackButton onClick={handleBackClick} />
      </div>
      {renderContent()}
    </div>
  );
};

export default FacadeEditorPanel;
