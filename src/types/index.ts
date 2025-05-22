import { JSX } from "react";
import * as THREE from "three";
declare global {
  // Định nghĩa kiểu cho context
  interface ConfigContextType {
    config: ConfigState;
    updateConfig: <K extends keyof ConfigState>(
      key: K,
      value: ConfigState[K]
    ) => void;
    batchUpdate: (updates: Partial<ConfigState>) => void; // Thêm kiểu cho batchUpdate
  }

  interface ConfigState {
    width: number;
    height: number;
    depth: number;
    thickness: number;
    price: number;
    originalPrice: number;
    position: string;
    activeView: string;
    columns: number;
    rows: number;
    texture: Texture;
    listTextures: Texture[];
    backPanels: Record<string, BackPanelsData>;
    shelves: Record<string, ShelfData>;
    facadePanels: Record<string, FacadeData>;
    verticalPanels: Record<string, VerticalPanelData>;
    editColumns: EditColumns;
    editShelf: EditShelf;
    editFeet: EditFeet;
    editFacade: EditFacade;
    editBackboard: EditBackboard;
    editVerticalPanels: EditVerticalPanels;
    columnHeights: ColumnDimensions;
    columnWidths: ColumnDimensions;
    columnWidthsOption: string;

    cellWidth: number;
    cellHeight: number;
  }

  interface VerticalPanelData {
    key: string;
    texture?: Texture;
    position: [number, number, number]; // [x, y, z]
    dimensions: [number, number, number]; // [width, height, depth]
  }
  interface ShelfData {
    key: string; // Định danh duy nhất, dạng "row-column" hoặc "row-column-virtual"
    row: number; // Vị trí hàng
    column: number; // Vị trí cột
    isVirtual: boolean; // Là kệ ảo hay không
    isStandard: boolean; // Là kệ tiêu chuẩn hay không
    isReinforced: boolean; // Là kệ tăng cường hay không
    isRemoved: boolean; // Đã bị xóa hay chưa
    texture?: Texture;
  }

  interface BackPanelsData {
    key: string; // Định danh duy nhất, dạng "row-column"
    row: number; // Vị trí hàng
    column: number; // Vị trí cột
    position: [number, number, number]; // Vị trí [x, y, z]

    // Thêm các thuộc tính kích thước
    dimensions: [number, number, number]; // Kích thước [width, height, depth]

    texture?: Texture;
    isRemoved: boolean; // Đã bị xóa hay chưa
    permanentlyDeleted: boolean;
  }

  interface FacadeData {
    key: string; // Định danh duy nhất, dạng "row-column"
    row: number; // Vị trí hàng
    column: number; // Vị trí cột
    position: [number, number, number]; // Vị trí [x, y, z]
    texture?: Texture;
    // Thêm các thuộc tính kích thước
    dimensions: [number, number, number]; // Kích thước [width, height, depth]
    material: string;
  }
  interface Texture {
    name: string;
    src: string;
  }

  interface ColumnDimensions {
    [columnIndex: number]: number;
  }

  interface EditVerticalPanels {
    isOpenEditTexture: boolean;
    selectedPanels: string[];
  }

  interface EditColumns {
    isOpenMenu: boolean;
    isOpenOption: boolean;
    isOpenEditHeight: boolean;
    isOpenEditWidth: boolean;
    isOpenEditDuplicate: boolean;
    isOpenEditDelete: boolean;
    selectedColumnInfo: ColumnInfo | null;
  }

  interface EditShelf {
    isOpenMenu: boolean;
    isOpenOption: boolean;
    isOpenEditStandard: boolean;
    isOpenEditReinforced: boolean;
    isOpenEditDelete: boolean;
    isOpenEditTexture: boolean;

    selectedShelves: ShelfInfo[];
  }
  interface EditFeet {
    isOpenMenu: boolean;
    feetType: string;
    heightFeet: number;
    texture?: Texture;
    metalness?: number;
    roughness?: number;
  }
  interface EditFacade {
    isOpenMenu: boolean;
    isOpenEditTexture: boolean;
    facadeType: string;

    heightFacade: number;

    selectedFacade: FacadeData[][];
  }
  interface EditBackboard {
    isOpenMenu: boolean;
    isOpenEditTexture: boolean;
    isSurfaceTotal: boolean;
    isDeleteTotal: boolean;
    isSurfaceOption: boolean;
    selectedBackboard: BackPanelsData[];
  }

  interface ColumnInfo {
    index: number;
    width: number;
    height: number;
    depth: number;
    position: {
      x: number;
      y: number;
      z: number;
    };
  }

  export interface ShelfPosition {
    x: number;
    y: number;
    z: number;
  }

  export interface ShelfInfo {
    index: number;
    row: number;
    column: number;
    width: number;
    height: number;
    depth: number;
    position: ShelfPosition;
    isVirtual: boolean;
    isReinforced: boolean;
    isStandard?: boolean;
    isRemoved?: boolean;
    totalShelves?: number;
  }

  interface DimensionControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }

  interface OptionButtonsProps {
    options: string[];
    activeOption: string;
    onChange: (option: string) => void;
    showInfo?: boolean;
  }

  interface OptionSectionProps {
    title: string;
    children?: React.ReactNode;
    actionText?: string;
    onActionClick?: () => void;
  }

  interface SelectorButtonsProps {
    options: string[];
    activeOption: string;
    onChange: (option: string) => void;
  }

  interface ShelfModelProps {
    showMeasurements?: boolean;
    showAddIcons?: boolean;
  }

  interface CanvasControlsProps {
    onRulerClick: () => void;
    onZoomInClick: () => void;
    onZoomOutClick: () => void;
  }

  interface LineWithLabelProps {
    start: [number, number, number];
    end: [number, number, number];
    label: string;
    color?: string;
  }

  interface BackButtonProps {
    onClick?: () => void;
    className?: string;
  }

  interface CameraControllerProps {
    zoomInTriggered: boolean;
    zoomOutTriggered: boolean;
    resetZoomTriggers: () => void;
  }

  interface ColumnHighlightsProps {
    width: number;
    height: number;
    depth: number;
    thickness: number;
    columns: number;
    rows: number;
  }

  interface ColumnCalculations {
    getColumnHeight: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    getColumnStartX: (colIndex: number) => number;
  }
  interface ShelfHighlightsProps {
    width: number;
    height: number;
    depth: number;
    thickness: number;
    columns: number;
    rows: number;
  }

  interface OuterFrameProps {
    columns: number;
    depth: number;
    cellHeight: number;
    thickness: number;
    totalWidth: number;
    shelfBottomY: number;

    texture: THREE.Texture;
    getColumnHeight: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    getColumnXPosition: (colIndex: number) => number;
  }
  // Định nghĩa cấu hình hiển thị cho từng trạng thái
  interface PanelStateConfig {
    highlightColor: string;
    highlightOpacity: number;
    iconBackgroundColor: string; // Màu background cho icon
    iconColor: string;
    iconText: string;
  }

  interface HorizontalShelvesProps {
    columns: number;
    rows: number; // Thêm tham số rows để biết tổng số hàng
    depth: number;
    thickness: number;
    cellHeight: number;
    shelfBottomY: number;
    texture: THREE.Texture;
    reinforcedTexture?: THREE.Texture; // Texture cho kệ tăng cường
    standardTexture?: THREE.Texture; // Texture cho kệ tiêu chuẩn
    getColumnHeight: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    getColumnXPosition: (colIndex: number) => number;
  }

  interface VerticalDividersProps {
    columns: number;
    depth: number;
    thickness: number;
    shelfBottomY: number;
    texture: THREE.Texture;
    getColumnHeight: (colIndex: number) => number;
    getColumnXPosition: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    totalWidth: number;
  }

  interface DeleteModeComponentProps {
    shelfPositions: any[];
    selectedShelves: string[];
    hoveredShelf: string | null;
    depth: number;
    handleShelfClick: (shelfInfo: any) => void;
    isStandardOrReinforcedShelf: (shelfId: string) => boolean;
    hasResetRef: React.RefObject<boolean>;
  }

  interface TextureModeComponentProps {
    shelfPositions: any[];
    selectedShelves: string[];
    hoveredShelf: string | null;
    depth: number;
    handleShelfClick: (shelfInfo: any) => void;
    isStandardOrReinforcedShelf: (shelfId: string) => boolean;
    hasResetRef: React.RefObject<boolean>;
  }

  interface StandardReinforceComponentProps {
    shelfPositions: any[];
    selectedShelves: string[];
    hoveredShelf: string | null;
    depth: number;
    handleShelfClick: (shelfInfo: any) => void;
    isStandardMode: boolean;
    isReinforcedMode: boolean;
    hasResetRef: React.RefObject<boolean>;
  }

  interface FacadeType {
    id: string;
    name: string;
    height: number; // Hệ số chiều cao (tỷ lệ của chiều cao kệ)
    icon: JSX.Element;
  }

  interface FacadeRegion {
    id: string;
    name: string;
    height: number;
    shelfKeys: string[];
  }

  interface BackPanelsProps {
    columns: number;
    depth: number;
    cellHeight: number;
    thickness: number;
    totalWidth: number;
    shelfBottomY: number;
    getColumnHeight: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    getColumnXPosition: (colIndex: number) => number;
  }

  interface DrawerAnimationData {
    drawerKey: string;
    startPosition: number;
    targetPosition: number;
    startTime: number;
    duration: number;
  }

  interface DoorAnimationData {
    doorKey: string;
    startRotation: number;
    targetRotation: number;
    startTime: number;
    duration: number;
    hingePosition: [number, number, number];
    isLeftHinged: boolean;
  }

  interface FacadePanelsProps {
    depth: number;
    thickness: number;
    texture: Texture;
  }
}

export {};
