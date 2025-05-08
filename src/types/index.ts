// global.d.ts
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
    position: string;
    activeView: string;
    columns: number;
    rows: number;

    editColumns: EditColumns;
    columnHeights: ColumnDimensions;
    columnWidths: ColumnDimensions;
    columnWidthsOption: string;

    cellWidth: number;
    cellHeight: number;
  }

  interface ColumnDimensions {
    [columnIndex: number]: number;
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

  export interface ColumnCalculations {
    getColumnHeight: (colIndex: number) => number;
    getColumnWidth: (colIndex: number) => number;
    getColumnStartX: (colIndex: number) => number;
  }
}

export {};
