import React from "react";
import { useConfig } from "../../context/ConfigContext";
import BackButton from "../../Button/BackButton";

const ShelfEditorPanel: React.FC = () => {
  const { config, updateConfig } = useConfig();

  const handleBackClick = () => {
    updateConfig("editFeet", {
      ...config.editFeet,
      isOpenMenu: false,
    });
  };

  const getFeetHeight = (feetType: string): number => {
    switch (feetType) {
      case "sans_pieds":
        return 0;
      case "design":
        return 6;
      case "classic":
        return 4;
      default:
        return 0;
    }
  };

  // Hàm tính sự chênh lệch chiều cao giữa hai loại chân
  const getHeightDifference = (fromType: string, toType: string): number => {
    const fromHeight = getFeetHeight(fromType);
    const toHeight = getFeetHeight(toType);
    return toHeight - fromHeight;
  };

  // Hàm hiển thị chuỗi cho UI
  const getHeightDifferenceText = (
    fromType: string,
    toType: string
  ): string => {
    const diff = getHeightDifference(fromType, toType);
    if (diff === 0) return "";
    return diff > 0 ? `+${diff} cm` : `${diff} cm`;
  };

  const handleFeetTypeChange = (feetType: string) => {
    const height = getFeetHeight(feetType);
    updateConfig("editFeet", {
      ...config.editFeet,
      feetType,
      heightFeet: height,
    });
  };

  const currentFeetType = config.editFeet?.feetType || "sans_pieds";

  const renderContent = () => {
    return (
      <div>
        <div className="my-2 text-secondary">
          Sélectionnez le type de pieds pour votre meuble.
        </div>
        <div className="row row-cols-2 g-3 mb-3">
          <div className="col">
            <button
              className={`btn ${
                currentFeetType === "sans_pieds"
                  ? "btn-primary"
                  : "btn-outline-primary"
              } rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center`}
              onClick={() => handleFeetTypeChange("sans_pieds")}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 80 80"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <g
                    fill="none"
                    fillRule="evenodd"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeMiterlimit="10"
                  >
                    <circle cx="39.7" cy="39.6" r="19.3"></circle>
                    <path d="m26 26.2 27 27.5"></path>
                  </g>
                </svg>
              </div>
              <div>Sans pieds</div>
              <div
                className="mt-1 small text-primary"
                style={{
                  visibility:
                    currentFeetType !== "sans_pieds" ? "visible" : "hidden",
                  height: "20px",
                }}
              >
                {getHeightDifferenceText(currentFeetType, "sans_pieds") ||
                  "placeholder"}
              </div>
            </button>
          </div>

          <div className="col">
            <button
              className={`btn ${
                currentFeetType === "design"
                  ? "btn-primary"
                  : "btn-outline-primary"
              } rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center`}
              onClick={() => handleFeetTypeChange("design")}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 80 80"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="square"
                    strokeLinejoin="bevel"
                    strokeMiterlimit="10"
                    d="M51 54 11.5 41.8V31.2L51 43.1V54zm0 0 17-5.8V38l-17 5.1V54zm17-5.8L51 54 11.5 41.8V31.2l17-5.4L68 38v10.2z"
                  ></path>
                </svg>
              </div>
              <div>DESIGN</div>
              <div
                className="mt-1 small text-primary"
                style={{
                  visibility:
                    currentFeetType !== "design" ? "visible" : "hidden",
                  height: "20px",
                }}
              >
                {getHeightDifferenceText(currentFeetType, "design") ||
                  "placeholder"}
              </div>
            </button>
          </div>
          <div className="col">
            <button
              className={`btn ${
                currentFeetType === "classic"
                  ? "btn-primary"
                  : "btn-outline-primary"
              } rounded p-2 text-center w-100 h-100 d-flex flex-column justify-content-center align-items-center`}
              onClick={() => handleFeetTypeChange("classic")}
            >
              <div className="mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 80 80"
                  className=""
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  role="img"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="bevel"
                    strokeMiterlimit="10"
                  >
                    <path d="m40 51-17.4-5.2v-11L40 40m0 11 17.1-5.2v-11L40 40v11z"></path>
                    <path d="M57.1 45.8 40 51l-17.4-5.2V34.7L40 29.2l17.1 5.5v11.1z"></path>
                  </g>
                </svg>
              </div>
              <div>CLASSIC</div>
              <div
                className="mt-1 small text-primary"
                style={{
                  visibility:
                    currentFeetType !== "classic" ? "visible" : "hidden",
                  height: "20px",
                }}
              >
                {getHeightDifferenceText(currentFeetType, "classic") ||
                  "placeholder"}
              </div>
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

export default ShelfEditorPanel;
