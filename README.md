# Meubles ThreeJS - 3D Shelf Configuration System

A modern React-based 3D shelf configuration system built with Three.js, allowing users to design and visualize custom shelf systems in real-time.

## Features

- **3D Real-time Preview**: Interactive 3D visualization using Three.js and React Three Fiber
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **Shelf Configuration**: Comprehensive shelf customization options including:
  - Shelf dimensions and positioning
  - Column and backboard editing
  - Facade customization
  - Feet configuration
- **Price Calculation**: Real-time price updates based on configuration
- **Measurement Tools**: Built-in ruler and measurement display
- **Camera Controls**: Zoom, pan, and rotate functionality
- **Modern UI**: Clean interface built with Bootstrap 5

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber
- **UI Framework**: Bootstrap 5 with Bootstrap Icons
- **Build Tool**: Vite
- **Package Manager**: npm
- **Development Tools**: ESLint, TypeScript

## Installation

1. Clone the repository:

```bash
git clone https://github.com/tuananhfr/meubles-threejs
cd meubles-threejs
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── ConfigPanel/          # Shelf configuration interface
│   │   ├── section/          # Configuration sections
│   │   ├── ShelfEditor/      # Shelf editing components
│   │   ├── ColumnEditor/     # Column editing components
│   │   ├── BackboardEditor/  # Backboard editing components
│   │   ├── FacadeEditor/     # Facade editing components
│   │   └── FeetEditor/       # Feet editing components
│   ├── PreviewPanel/         # 3D preview components
│   │   ├── Shelf/           # Shelf 3D model
│   │   ├── CanvasControls/  # 3D view controls
│   │   └── CameraController/ # Camera manipulation
│   ├── Button/              # Action buttons
│   └── context/             # React context providers
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── assets/                  # Static assets
└── Plugin/                  # Plugin system
```

## Usage

### Desktop Layout

- **Left Panel**: Configuration options for shelf customization
- **Right Panel**: 3D preview with interactive controls
- **Bottom Bar**: Price display and action buttons

### Mobile Layout

- **Top Half**: 3D preview area
- **Bottom Half**: Configuration panel with scrollable options
- **Bottom Bar**: Price and action buttons

### 3D Controls

- **Mouse/Touch**: Rotate the view
- **Pan**: Move the camera around
- **Ruler Button**: Toggle measurement display
- **Zoom Controls**: Zoom in/out buttons

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Configuration

The application uses a context-based state management system for configuration data. All shelf parameters are managed through the `ConfigProvider` context.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.

---

**Note**: This is a private project for internal use. Please ensure you have proper authorization before using or modifying this codebase.
