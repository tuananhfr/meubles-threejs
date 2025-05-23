import React, { useMemo } from "react";
import { useConfig } from "../../context/ConfigContext";
import { shelfToKey } from "../../../utils/shelfUtils";

// Type cho thông tin đếm components sử dụng texture
interface EntierInfo {
  count: number;
  details: string[];
}

// Sửa đổi props để component có thể sử dụng cho texture chân kệ, toàn bộ kệ, tablette, vertical panels, facade, và backboard
interface TextureSelectorProps {
  type: "feet" | "entier" | "tablette" | "vertical" | "facade" | "backboard";
}

const TextureSelector: React.FC<TextureSelectorProps> = ({ type }) => {
  const { config, updateConfig } = useConfig();

  // Hàm để lấy tất cả các texture đang được sử dụng trong toàn bộ kệ
  const getAllUsedTextures = useMemo(() => {
    if (type !== "entier") {
      return new Set();
    }

    const textures = new Set<string>();

    // Lấy texture mặc định
    textures.add(config.texture.src);

    // Lấy texture từ các shelves
    if (config.shelves) {
      Object.values(config.shelves).forEach((shelf: any) => {
        if (shelf?.texture?.src) {
          textures.add(shelf.texture.src);
        }
      });
    }

    // Lấy texture từ các vertical panels
    if (config.verticalPanels) {
      Object.values(config.verticalPanels).forEach((panel: any) => {
        if (panel?.texture?.src) {
          textures.add(panel.texture.src);
        }
      });
    }

    // Lấy texture từ các facade panels
    if (config.facadePanels) {
      Object.values(config.facadePanels).forEach((facadePanel: any) => {
        if (facadePanel?.texture?.src) {
          textures.add(facadePanel.texture.src);
        }
      });
    }

    // Lấy texture từ các backboard panels
    if (config.backPanels) {
      Object.values(config.backPanels).forEach((backPanel: any) => {
        if (backPanel?.texture?.src) {
          textures.add(backPanel.texture.src);
        }
      });
    }

    // Lấy texture từ feet nếu có
    if (config.editFeet?.texture?.src) {
      textures.add(config.editFeet.texture.src);
    }

    return textures;
  }, [
    config.texture.src,
    config.shelves,
    config.verticalPanels,
    config.facadePanels,
    config.backPanels,
    config.editFeet?.texture,
    type,
  ]);

  // Hàm để đếm số lượng thành phần sử dụng texture cho "entier"
  const countComponentsUsingTextureForEntier = (
    textureSrc: string
  ): EntierInfo => {
    if (type !== "entier") {
      return { count: 0, details: [] };
    }

    let count = 0;
    let details: string[] = [];

    // Kiểm tra texture mặc định
    if (config.texture.src === textureSrc) {
      details.push("défaut");
    }

    // Đếm shelves
    if (config.shelves) {
      const shelfCount = Object.values(config.shelves).filter(
        (shelf: any) => shelf?.texture?.src === textureSrc
      ).length;
      if (shelfCount > 0) {
        count += shelfCount;
        details.push(`${shelfCount} étagère${shelfCount > 1 ? "s" : ""}`);
      }
    }

    // Đếm vertical panels
    if (config.verticalPanels) {
      const panelCount = Object.values(config.verticalPanels).filter(
        (panel: any) => panel?.texture?.src === textureSrc
      ).length;
      if (panelCount > 0) {
        count += panelCount;
        details.push(`${panelCount} panneau${panelCount > 1 ? "x" : ""}`);
      }
    }

    // Đếm facade panels
    if (config.facadePanels) {
      const facadeCount = Object.values(config.facadePanels).filter(
        (facade: any) => facade?.texture?.src === textureSrc
      ).length;
      if (facadeCount > 0) {
        count += facadeCount;
        details.push(`${facadeCount} façade${facadeCount > 1 ? "s" : ""}`);
      }
    }

    // Đếm backboard panels
    if (config.backPanels) {
      const backCount = Object.values(config.backPanels).filter(
        (back: any) => back?.texture?.src === textureSrc
      ).length;
      if (backCount > 0) {
        count += backCount;
        details.push(`${backCount} fond${backCount > 1 ? "s" : ""}`);
      }
    }

    // Kiểm tra feet
    if (config.editFeet?.texture?.src === textureSrc) {
      count += 1;
      details.push("pieds");
    }

    return { count, details };
  };

  // Hàm để lấy các texture đang được sử dụng bởi các shelves đã chọn
  const getSelectedShelvesTextures = useMemo(() => {
    if (type !== "tablette" || !config.editShelf?.selectedShelves?.length) {
      return new Set();
    }

    const textures = new Set<string>();

    config.editShelf.selectedShelves.forEach((shelfInfo: ShelfInfo) => {
      const key = shelfToKey(shelfInfo);
      const shelf = config.shelves?.[key];

      //  Nếu shelf có texture riêng, sử dụng texture đó, nếu không thì sử dụng texture mặc định
      const textureToUse = shelf?.texture?.src || config.texture.src;
      textures.add(textureToUse);
    });

    return textures;
  }, [
    config.editShelf?.selectedShelves,
    config.shelves,
    config.texture.src,
    type,
  ]);

  // Hàm để lấy các texture đang được sử dụng bởi các vertical panels đã chọn
  const getSelectedVerticalPanelsTextures = useMemo(() => {
    if (
      type !== "vertical" ||
      !config.editVerticalPanels?.selectedPanels?.length
    ) {
      return new Set();
    }

    const textures = new Set<string>();

    config.editVerticalPanels.selectedPanels.forEach((panelKey: string) => {
      const panel = config.verticalPanels?.[panelKey];

      //  Nếu panel có texture riêng, sử dụng texture đó, nếu không thì sử dụng texture mặc định
      const textureToUse = panel?.texture?.src || config.texture.src;
      textures.add(textureToUse);
    });

    return textures;
  }, [
    config.editVerticalPanels?.selectedPanels,
    config.verticalPanels,
    config.texture.src,
    type,
  ]);

  // Hàm để lấy các texture đang được sử dụng bởi các facade panels đã chọn
  const getSelectedFacadePanelsTextures = useMemo(() => {
    if (type !== "facade" || !config.editFacade?.selectedFacade?.length) {
      return new Set();
    }

    const textures = new Set<string>();

    // Flatten array of arrays và lấy texture từ mỗi facade panel
    config.editFacade.selectedFacade
      .flat()
      .forEach((facadeData: FacadeData) => {
        //  Nếu facade có texture riêng, sử dụng texture đó, nếu không thì sử dụng texture mặc định
        const textureToUse = facadeData?.texture?.src || config.texture.src;
        textures.add(textureToUse);
      });

    return textures;
  }, [config.editFacade?.selectedFacade, config.texture.src, type]);

  // Hàm để lấy các texture đang được sử dụng bởi các backboard panels đã chọn
  const getSelectedBackboardPanelsTextures = useMemo(() => {
    if (
      type !== "backboard" ||
      !config.editBackboard?.selectedBackboard?.length
    ) {
      return new Set();
    }

    const textures = new Set<string>();

    config.editBackboard.selectedBackboard.forEach(
      (backPanelData: BackPanelsData) => {
        //  Nếu backboard có texture riêng, sử dụng texture đó, nếu không thì sử dụng texture mặc định
        const textureToUse = backPanelData?.texture?.src || config.texture.src;
        textures.add(textureToUse);
      }
    );

    return textures;
  }, [config.editBackboard?.selectedBackboard, config.texture.src, type]);

  // Xác định danh sách texture, texture hiện tại, và hàm cập nhật dựa theo loại
  const getTextureConfig = () => {
    switch (type) {
      case "entier":
        return {
          list: config.listTextures,
          current: config.texture,
          updateFn: (textureName: string, textureSrc: string) => {
            // Cập nhật texture cho toàn bộ kệ
            updateConfig("texture", {
              name: textureName,
              src: textureSrc,
            });
          },
        };
      case "tablette":
        return {
          list: config.listTextures,
          current: null, // Không sử dụng current cho tablette
          // Auto reset sau khi chọn texture
          updateFn: (textureName: string, textureSrc: string) => {
            if (
              config.editShelf?.selectedShelves &&
              config.editShelf.selectedShelves.length > 0
            ) {
              const updatedShelves = { ...config.shelves };

              config.editShelf.selectedShelves.forEach(
                (shelfInfo: ShelfInfo) => {
                  const key = shelfToKey(shelfInfo);

                  updatedShelves[key] = {
                    ...updatedShelves[key],
                    texture: {
                      name: textureName,
                      src: textureSrc,
                    },
                  };
                }
              );

              // Cập nhật shelves với texture mới
              updateConfig("shelves", updatedShelves);

              // Auto reset selections và chuyển về tab "entier"
              setTimeout(() => {
                updateConfig("editShelf", {
                  ...config.editShelf,
                  isOpenEditTexture: false,
                  selectedShelves: [],
                  isOpenOption: false,
                  isOpenMenu: false, // Đóng cả menu nếu cần
                });

                // Chuyển về tab "entier"
                updateConfig("activeView", "Étagère entière");
              }, 100); // Delay nhỏ để texture được apply trước
            }
          },
        };
      case "vertical":
        return {
          list: config.listTextures,
          current: null, // Không sử dụng current cho vertical panels
          // Auto reset sau khi chọn texture cho vertical panels
          updateFn: (textureName: string, textureSrc: string) => {
            if (
              config.editVerticalPanels?.selectedPanels &&
              config.editVerticalPanels.selectedPanels.length > 0
            ) {
              const updatedPanels = { ...config.verticalPanels };

              // Apply texture cho các panels đã chọn
              config.editVerticalPanels.selectedPanels.forEach(
                (panelKey: string) => {
                  updatedPanels[panelKey] = {
                    ...updatedPanels[panelKey],
                    texture: {
                      name: textureName,
                      src: textureSrc,
                    },
                  };
                }
              );

              updateConfig("verticalPanels", updatedPanels);

              // Auto reset selections và chuyển về tab "entier"
              setTimeout(() => {
                updateConfig("editVerticalPanels", {
                  ...config.editVerticalPanels,
                  isOpenEditTexture: false,
                  selectedPanels: [],
                });

                // Chuyển về tab "entier"
                updateConfig("activeView", "Étagère entière");
              }, 100); // Delay nhỏ để texture được apply trước
            }
          },
        };
      case "facade":
        return {
          list: config.listTextures,
          current: null, // Không sử dụng current cho facade panels
          // Auto reset sau khi chọn texture cho facade panels
          updateFn: (textureName: string, textureSrc: string) => {
            if (
              config.editFacade?.selectedFacade &&
              config.editFacade.selectedFacade.length > 0
            ) {
              const updatedFacadePanels = { ...config.facadePanels };

              // Apply texture cho các facade panels đã chọn
              config.editFacade.selectedFacade
                .flat()
                .forEach((facadeData: FacadeData) => {
                  if (facadeData?.key) {
                    updatedFacadePanels[facadeData.key] = {
                      ...updatedFacadePanels[facadeData.key],
                      texture: {
                        name: textureName,
                        src: textureSrc,
                      },
                    };
                  }
                });

              updateConfig("facadePanels", updatedFacadePanels);

              // Auto reset selections và chuyển về tab "entier"
              setTimeout(() => {
                updateConfig("editFacade", {
                  ...config.editFacade,
                  isOpenEditTexture: false,
                  selectedFacade: [],
                  isOpenMenu: false,
                });

                // Chuyển về tab "entier"
                updateConfig("activeView", "Étagère entière");
              }, 100); // Delay nhỏ để texture được apply trước
            }
          },
        };
      case "backboard":
        return {
          list: config.listTextures,
          current: null, // Không sử dụng current cho backboard panels
          // Auto reset sau khi chọn texture cho backboard panels
          updateFn: (textureName: string, textureSrc: string) => {
            if (
              config.editBackboard?.selectedBackboard &&
              config.editBackboard.selectedBackboard.length > 0
            ) {
              const updatedBackPanels = { ...config.backPanels };

              // Apply texture cho các backboard panels đã chọn
              config.editBackboard.selectedBackboard.forEach(
                (backPanelData: BackPanelsData) => {
                  if (backPanelData?.key) {
                    updatedBackPanels[backPanelData.key] = {
                      ...updatedBackPanels[backPanelData.key],
                      texture: {
                        name: textureName,
                        src: textureSrc,
                      },
                    };
                  }
                }
              );

              updateConfig("backPanels", updatedBackPanels);

              // Auto reset selections và chuyển về tab "entier"
              setTimeout(() => {
                updateConfig("editBackboard", {
                  ...config.editBackboard,
                  isOpenEditTexture: false,
                  selectedBackboard: [],
                  isOpenMenu: false,
                  isSurfaceTotal: false,
                  isDeleteTotal: false,
                  isSurfaceOption: false,
                });

                // Chuyển về tab "entier"
                updateConfig("activeView", "Étagère entière");
              }, 100); // Delay nhỏ để texture được apply trước
            }
          },
        };
      case "feet":
      default:
        return {
          list: config.listTextures,
          current: config.editFeet?.texture || config.texture,
          updateFn: (textureName: string, textureSrc: string) => {
            // Cập nhật texture cho chân kệ
            updateConfig("editFeet", {
              ...config.editFeet,
              texture: {
                name: textureName,
                src: textureSrc,
              },
            });
          },
        };
    }
  };

  const { list, current, updateFn } = getTextureConfig();

  // Chuyển đổi giá trị current thành đối tượng hoặc chuỗi tùy theo từng trường hợp
  const getCurrentTextureSrc = () => {
    if (typeof current === "string") {
      return current;
    } else if (current && typeof current === "object" && current.src) {
      return current.src;
    }
    return "";
  };

  const currentTextureSrc = getCurrentTextureSrc();

  // Kiểm tra trạng thái cho tablette
  const isTabletteEditMode =
    type === "tablette" && config.editShelf?.isOpenEditTexture;
  const hasSelectedShelves =
    config.editShelf?.selectedShelves &&
    config.editShelf.selectedShelves.length > 0;

  // Kiểm tra trạng thái cho vertical panels
  const isVerticalEditMode =
    type === "vertical" && config.editVerticalPanels?.isOpenEditTexture;
  const hasSelectedPanels =
    config.editVerticalPanels?.selectedPanels &&
    config.editVerticalPanels.selectedPanels.length > 0;

  // Kiểm tra trạng thái cho facade panels
  const isFacadeEditMode =
    type === "facade" && config.editFacade?.isOpenEditTexture;
  const hasSelectedFacades =
    config.editFacade?.selectedFacade &&
    config.editFacade.selectedFacade.length > 0;

  // Kiểm tra trạng thái cho backboard panels
  const isBackboardEditMode =
    type === "backboard" && config.editBackboard?.isOpenEditTexture;
  const hasSelectedBackboards =
    config.editBackboard?.selectedBackboard &&
    config.editBackboard.selectedBackboard.length > 0;

  // Hàm để kiểm tra xem texture có đang được sử dụng không
  const isTextureActiveForSelected = (textureSrc: string) => {
    switch (type) {
      case "entier":
        return getAllUsedTextures.has(textureSrc);
      case "tablette":
        return getSelectedShelvesTextures.has(textureSrc);
      case "vertical":
        return getSelectedVerticalPanelsTextures.has(textureSrc);
      case "facade":
        return getSelectedFacadePanelsTextures.has(textureSrc);
      case "backboard":
        return getSelectedBackboardPanelsTextures.has(textureSrc);
      default:
        return currentTextureSrc === textureSrc;
    }
  };

  // Hàm để đếm số shelves đang sử dụng texture này
  const countShelvesUsingTexture = (textureSrc: string) => {
    if (type !== "tablette" || !config.editShelf?.selectedShelves?.length) {
      return 0;
    }

    let count = 0;
    config.editShelf.selectedShelves.forEach((shelfInfo: ShelfInfo) => {
      const key = shelfToKey(shelfInfo);
      const shelf = config.shelves?.[key];

      //  Kiểm tra cả texture riêng và texture mặc định
      const shelfTextureToUse = shelf?.texture?.src || config.texture.src;
      if (shelfTextureToUse === textureSrc) {
        count++;
      }
    });

    return count;
  };

  // Hàm để đếm số vertical panels đang sử dụng texture này
  const countPanelsUsingTexture = (textureSrc: string) => {
    if (
      type !== "vertical" ||
      !config.editVerticalPanels?.selectedPanels?.length
    ) {
      return 0;
    }

    let count = 0;
    config.editVerticalPanels.selectedPanels.forEach((panelKey: string) => {
      const panel = config.verticalPanels?.[panelKey];

      //  Kiểm tra cả texture riêng và texture mặc định
      const panelTextureToUse = panel?.texture?.src || config.texture.src;
      if (panelTextureToUse === textureSrc) {
        count++;
      }
    });

    return count;
  };

  // Hàm để đếm số facade panels đang sử dụng texture này
  const countFacadesUsingTexture = (textureSrc: string) => {
    if (type !== "facade" || !config.editFacade?.selectedFacade?.length) {
      return 0;
    }

    let count = 0;
    config.editFacade.selectedFacade
      .flat()
      .forEach((facadeData: FacadeData) => {
        //  Kiểm tra cả texture riêng và texture mặc định
        const facadeTextureToUse =
          facadeData?.texture?.src || config.texture.src;
        if (facadeTextureToUse === textureSrc) {
          count++;
        }
      });

    return count;
  };

  // Hàm để đếm số backboard panels đang sử dụng texture này
  const countBackboardsUsingTexture = (textureSrc: string) => {
    if (
      type !== "backboard" ||
      !config.editBackboard?.selectedBackboard?.length
    ) {
      return 0;
    }

    let count = 0;
    config.editBackboard.selectedBackboard.forEach(
      (backPanelData: BackPanelsData) => {
        //  Kiểm tra cả texture riêng và texture mặc định
        const backboardTextureToUse =
          backPanelData?.texture?.src || config.texture.src;
        if (backboardTextureToUse === textureSrc) {
          count++;
        }
      }
    );

    return count;
  };

  return (
    <div className="texture-selector mt-3">
      {/* Hiển thị thông báo về tình trạng texture cho tab "entier" */}
      {type === "entier" && getAllUsedTextures.size > 1 && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              {getAllUsedTextures.size} textures différentes sont utilisées dans
              cette étagère
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi là tablette nhưng chưa chọn shelf nào */}
      {type === "tablette" && !hasSelectedShelves && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              Appuyez sur <i className="bi bi-plus-lg"></i> pour sélectionner la
              partie à colorer
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi là vertical nhưng chưa chọn panel nào */}
      {type === "vertical" && !hasSelectedPanels && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              Appuyez sur <i className="bi bi-plus-lg"></i> pour sélectionner le
              panneau à colorer
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi là facade nhưng chưa chọn facade nào */}
      {type === "facade" && !hasSelectedFacades && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              Appuyez sur <i className="bi bi-plus-lg"></i> pour sélectionner la
              façade à colorer
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi là backboard nhưng chưa chọn backboard nào */}
      {type === "backboard" && !hasSelectedBackboards && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-info-circle me-2"></i>
            <span>
              Appuyez sur <i className="bi bi-plus-lg"></i> pour sélectionner le
              fond à colorer
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi đã chọn shelves với info về auto-reset */}
      {type === "tablette" && hasSelectedShelves && (
        <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>
              {config.editShelf.selectedShelves.length} étagère(s)
              sélectionnée(s). Choisissez une texture à appliquer.
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi đã chọn vertical panels với info về auto-reset */}
      {type === "vertical" && hasSelectedPanels && (
        <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>
              {config.editVerticalPanels.selectedPanels.length} panneau(x)
              sélectionné(s). Choisissez une texture à appliquer.
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi đã chọn facade panels với info về auto-reset */}
      {type === "facade" && hasSelectedFacades && (
        <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>
              {config.editFacade.selectedFacade.flat().length} façade(s)
              sélectionnée(s). Choisissez une texture à appliquer.
            </span>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi đã chọn backboard panels với info về auto-reset */}
      {type === "backboard" && hasSelectedBackboards && (
        <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>
              {config.editBackboard.selectedBackboard.length} fond(s)
              sélectionné(s). Choisissez une texture à appliquer.
            </span>
          </div>
        </div>
      )}

      {/* Thông báo nhỏ về auto-reset và chuyển tab cho tablette */}
      {type === "tablette" && hasSelectedShelves && (
        <div className="mb-3">
          <small className="text-muted d-flex align-items-center">
            <i className="fas fa-info-circle me-1"></i>
            La sélection sera automatiquement réinitialisée et retournera à
            l'onglet "Étagère entière" après application
          </small>
        </div>
      )}

      {/* Thông báo nhỏ về auto-reset và chuyển tab cho vertical */}
      {type === "vertical" && hasSelectedPanels && (
        <div className="mb-3">
          <small className="text-muted d-flex align-items-center">
            <i className="fas fa-info-circle me-1"></i>
            La sélection sera automatiquement réinitialisée et retournera à
            l'onglet "Étagère entière" après application
          </small>
        </div>
      )}

      {/* Thông báo nhỏ về auto-reset và chuyển tab cho facade */}
      {type === "facade" && hasSelectedFacades && (
        <div className="mb-3">
          <small className="text-muted d-flex align-items-center">
            <i className="fas fa-info-circle me-1"></i>
            La sélection sera automatiquement réinitialisée et retournera à
            l'onglet "Étagère entière" après application
          </small>
        </div>
      )}

      {/* Thông báo nhỏ về auto-reset và chuyển tab cho backboard */}
      {type === "backboard" && hasSelectedBackboards && (
        <div className="mb-3">
          <small className="text-muted d-flex align-items-center">
            <i className="fas fa-info-circle me-1"></i>
            La sélection sera automatiquement réinitialisée et retournera à
            l'onglet "Étagère entière" après application
          </small>
        </div>
      )}

      {/* Hiển thị thông tin về textures hiện tại của các shelves đã chọn */}
      {type === "tablette" &&
        hasSelectedShelves &&
        getSelectedShelvesTextures.size > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Textures actuelles: {getSelectedShelvesTextures.size}{" "}
              différente(s) utilisée(s)
            </small>
          </div>
        )}

      {/* Hiển thị thông tin về textures hiện tại của các vertical panels đã chọn */}
      {type === "vertical" &&
        hasSelectedPanels &&
        getSelectedVerticalPanelsTextures.size > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Textures actuelles: {getSelectedVerticalPanelsTextures.size}{" "}
              différente(s) utilisée(s)
            </small>
          </div>
        )}

      {/* Hiển thị thông tin về textures hiện tại của các facade panels đã chọn */}
      {type === "facade" &&
        hasSelectedFacades &&
        getSelectedFacadePanelsTextures.size > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Textures actuelles: {getSelectedFacadePanelsTextures.size}{" "}
              différente(s) utilisée(s)
            </small>
          </div>
        )}

      {/* Hiển thị thông tin về textures hiện tại của các backboard panels đã chọn */}
      {type === "backboard" &&
        hasSelectedBackboards &&
        getSelectedBackboardPanelsTextures.size > 0 && (
          <div className="mb-3">
            <small className="text-muted">
              Textures actuelles: {getSelectedBackboardPanelsTextures.size}{" "}
              différente(s) utilisée(s)
            </small>
          </div>
        )}

      {/* Danh sách texture - hiển thị dựa theo điều kiện của từng type */}
      {((type === "tablette" && isTabletteEditMode && hasSelectedShelves) ||
        (type === "vertical" && isVerticalEditMode && hasSelectedPanels) ||
        (type === "facade" && isFacadeEditMode && hasSelectedFacades) ||
        (type === "backboard" &&
          isBackboardEditMode &&
          hasSelectedBackboards) ||
        (type !== "tablette" &&
          type !== "vertical" &&
          type !== "facade" &&
          type !== "backboard")) && (
        <div className="d-flex flex-wrap">
          {list.map((texture, index) => {
            const isActive = isTextureActiveForSelected(texture.src);
            const shelfCount =
              type === "tablette" ? countShelvesUsingTexture(texture.src) : 0;
            const panelCount =
              type === "vertical" ? countPanelsUsingTexture(texture.src) : 0;
            const facadeCount =
              type === "facade" ? countFacadesUsingTexture(texture.src) : 0;
            const backboardCount =
              type === "backboard"
                ? countBackboardsUsingTexture(texture.src)
                : 0;

            // Lấy thông tin về components sử dụng texture cho "entier"
            const entierInfo: EntierInfo =
              type === "entier"
                ? countComponentsUsingTextureForEntier(texture.src)
                : { count: 0, details: [] };

            return (
              <div key={index} className="position-relative">
                <button
                  onClick={() => updateFn(texture.name, texture.src)}
                  className={`btn p-0 m-1 border rounded-2 position-relative ${
                    isActive
                      ? "border-primary border-3"
                      : "border-secondary border-1"
                  }`}
                  style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    boxShadow: isActive
                      ? "0 0 8px rgba(0,123,255,0.3)"
                      : "none",
                  }}
                  title={`${texture.name}${
                    type === "entier" && entierInfo.count > 0
                      ? ` (${entierInfo.details.join(", ")})`
                      : type === "tablette" && shelfCount > 0
                      ? ` (utilisée par ${shelfCount} étagère${
                          shelfCount > 1 ? "s" : ""
                        })`
                      : type === "vertical" && panelCount > 0
                      ? ` (utilisée par ${panelCount} panneau${
                          panelCount > 1 ? "x" : ""
                        })`
                      : type === "facade" && facadeCount > 0
                      ? ` (utilisée par ${facadeCount} façade${
                          facadeCount > 1 ? "s" : ""
                        })`
                      : type === "backboard" && backboardCount > 0
                      ? ` (utilisée par ${backboardCount} fond${
                          backboardCount > 1 ? "s" : ""
                        })`
                      : ""
                  }`}
                >
                  <img
                    src={texture.src}
                    alt={texture.name}
                    className="rounded-1"
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: "cover",
                      opacity: isActive ? 1 : 0.8,
                    }}
                  />

                  {/* Hiển thị indicator khi texture đang được sử dụng */}
                  {isActive && (
                    <div
                      className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: 16,
                        height: 16,
                        fontSize: 10,
                        transform: "translate(25%, -25%)",
                      }}
                    >
                      {type === "entier" && entierInfo.count > 0
                        ? entierInfo.count > 9
                          ? "9+"
                          : entierInfo.count
                        : type === "tablette" && shelfCount > 0
                        ? shelfCount > 9
                          ? "9+"
                          : shelfCount
                        : type === "vertical" && panelCount > 0
                        ? panelCount > 9
                          ? "9+"
                          : panelCount
                        : type === "facade" && facadeCount > 0
                        ? facadeCount > 9
                          ? "9+"
                          : facadeCount
                        : type === "backboard" && backboardCount > 0
                        ? backboardCount > 9
                          ? "9+"
                          : backboardCount
                        : "✓"}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TextureSelector;
