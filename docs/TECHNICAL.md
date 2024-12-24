# Vasemaker Technical Documentation

## Architecture Overview

Vasemaker uses standard Web APIs for pure browser-native 3D modeling and visualization with WebGL. The architecture consists of three generator classes and a viewer class.

### Core Components

#### 1. PathGenerator
Core spiral path generation engine.

```javascript
class PathGenerator {
   constructor(params) 
   generateControlPoint(t, pathIndex, totalPaths)
   generatePath(pathIndex, totalPaths)
   computePathFrame(point, nextPoint)
}
```

Features:
- Browser-native geometry calculation
- Parameterized path generation
- Optimized for 3D printing
- Smooth spiral interpolation

#### 2. ProfileGenerator 
Cross-sectional profile handler.

```javascript
class ProfileGenerator {
   constructor(params)
   generateProfile(t)
}
```

Features:
- Dynamic wall profiles
- Nozzle-width optimization
- Adaptive cross-sections

#### 3. VaseGeometryGenerator
Complete 3D mesh generation.

```javascript
class VaseGeometryGenerator {
   constructor(params)
   generateGeometry()
}
```

Features:
- WebGL buffer optimization
- Efficient triangle generation
- Real-time mesh updates

#### 4. VaseViewer
WebGL rendering and UI.

```javascript
class VaseViewer {
   constructor()
   init()
   setupGUI()
   updateVase()
   saveSTL()
   animate()
}
```

Features:
- Native WebGL rendering
- Browser-based controls
- Real-time preview
- Direct STL export

## Technical Specifications

### Parameters

1. **Basic Dimensions**
  - Height: 1-10 inches
  - Base Radius: 0.5-5 inches
  - Top Radius: 0.5-5 inches

2. **Pattern Controls**
  - Twist Rate: 0-5
  - Flow Frequency: 0-10
  - Flow Amplitude: 0-1
  - Height Frequency: 0-5

3. **Print Settings**
  - Wall: 0.4mm nozzle width
  - Layers: 0-5 base layers
  - XY Smoothing: 100-500%

### Implementation Notes

#### WebGL Integration
```javascript
// Scene setup uses native WebGL
this.scene = new THREE.Scene();
this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
this.renderer = new THREE.WebGLRenderer({antialias: true});
```

#### Unit Handling
```javascript
const INCH_TO_MM = 25.4;
const MM_TO_INCH = 1/25.4;
const BAMBU_NOZZLE = 0.4; // mm
```

## Performance

1. **Geometry Pipeline**
  - Optimized vertex generation
  - Efficient buffer updates
  - Smart normal calculation

2. **Rendering**
  - Native WebGL acceleration
  - Efficient buffer management
  - Frame rate optimization

## Browser Support

- WebGL 1.0 compatible browsers
- Modern JavaScript support (ES6+)
- File System Access API for export
