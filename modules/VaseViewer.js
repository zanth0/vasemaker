import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import GUI from 'lil-gui';

import {
  INCH_TO_MM,
  MM_TO_INCH,
  BAMBU_NOZZLE,
  DEFAULT_HEIGHT_INCHES,
  DEFAULT_RADIUS_INCHES
} from './constants.js';

import { VaseGeometryGenerator } from './VaseGeometryGenerator.js';
import { SimplePathGenerator } from './SimplePathGenerator.js';

export class VaseViewer {
  constructor() {
    this.params = {
      // Basic dimensions (in inches)
      height: DEFAULT_HEIGHT_INCHES,
      baseRadius: DEFAULT_RADIUS_INCHES,
      topRadius: DEFAULT_RADIUS_INCHES,

      // Pattern parameters
      twistRate: 2.5,
      flowFreq: 3,
      flowAmplitude: 0.3,
      heightFreq: 2,
      numPaths: 24,
      profileWidth: 0.2,
      profileHeight: 0.1,

      // Vase mode parameters
      vaseMode: false,
      smoothSpiral: false,
      xySmoothing: 200,
      bottomLayers: 3,

      // Path generator toggle
      useSimpleGenerator: false, // Add a toggle for SimplePathGenerator

      // Export function
      saveSTL: () => this.saveSTL(),
    };

    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x222222);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Start at some position so we can see the vase
    this.camera.position.set(0, -DEFAULT_HEIGHT_INCHES * 2, DEFAULT_HEIGHT_INCHES * 2);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('viewer').appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 10, 10);
    this.scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambLight);

    // Grid helper (in inches)
    const gridSize = 10;
    const gridDivisions = 10;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions);
    gridHelper.rotation.x = Math.PI / 2;
    this.scene.add(gridHelper);

    // GUI
    this.setupGUI();
    this.updateVase();

    // Resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Animate
    this.animate();
  }

  setupGUI() {
    const gui = new GUI();

    // Shape (inches)
    const shapeFolder = gui.addFolder('Shape (inches)');
    shapeFolder
      .add(this.params, 'height', 1, 10, 0.1)
      .name('Height')
      .onChange(() => this.updateVase());
    shapeFolder
      .add(this.params, 'baseRadius', 0.5, 5, 0.1)
      .name('Base Radius')
      .onChange(() => this.updateVase());
    shapeFolder
      .add(this.params, 'topRadius', 0.5, 5, 0.1)
      .name('Top Radius')
      .onChange(() => this.updateVase());

    // Vase mode folder
    const vaseFolder = gui.addFolder('Bambu Vase Mode');
    vaseFolder
      .add(this.params, 'vaseMode')
      .name('Spiral Vase Mode')
      .onChange(() => {
        if (this.params.vaseMode) {
          // Force Bambu settings
          this.params.numPaths = 1;
          this.params.profileWidth = BAMBU_NOZZLE * MM_TO_INCH;
          this.params.profileHeight = BAMBU_NOZZLE * MM_TO_INCH;
        }
        this.updateVase();
      });
    vaseFolder
      .add(this.params, 'smoothSpiral')
      .name('Smooth Spiral')
      .onChange(() => this.updateVase());
    vaseFolder
      .add(this.params, 'xySmoothing', 100, 500)
      .name('XY Smoothing (%)')
      .onChange(() => this.updateVase());
    vaseFolder
      .add(this.params, 'bottomLayers', 0, 5, 1)
      .name('Bottom Layers')
      .onChange(() => this.updateVase());

    // Pattern
    const patternFolder = gui.addFolder('Pattern');
    patternFolder
      .add(this.params, 'twistRate', 0, 5, 0.1)
      .onChange(() => this.updateVase());
    patternFolder
      .add(this.params, 'flowFreq', 0, 10, 0.1)
      .onChange(() => this.updateVase());
    patternFolder
      .add(this.params, 'flowAmplitude', 0, 1, 0.01)
      .onChange(() => this.updateVase());
    patternFolder
      .add(this.params, 'heightFreq', 0, 5, 0.1)
      .onChange(() => this.updateVase());

    // Details
    const detailFolder = gui.addFolder('Details');
    detailFolder
      .add(this.params, 'numPaths', 4, 48, 1)
      .onChange(() => this.updateVase());
    detailFolder
      .add(this.params, 'profileWidth', 0.1, 1, 0.05)
      .onChange(() => this.updateVase());
    detailFolder
      .add(this.params, 'profileHeight', 0.1, 1, 0.05)
      .onChange(() => this.updateVase());

    // Add toggle for path generator
    gui.add(this.params, 'useSimpleGenerator')
      .name('Use Simple Path Generator')
      .onChange(() => this.updateVase());

    // Export
    gui.add(this.params, 'saveSTL').name('Export STL');
  }

  updateVase() {
    // Remove old mesh
    if (this.vaseMesh) {
      this.scene.remove(this.vaseMesh);
      this.vaseMesh.geometry.dispose();
      this.vaseMesh.material.dispose();
    }

    // Generate geometry
    const generator = new VaseGeometryGenerator(this.params, this.params.useSimpleGenerator);
    const geometry = generator.generateGeometry();

    const material = new THREE.MeshPhongMaterial({
      color: 0x8fa4ff,
      side: THREE.DoubleSide,
      flatShading: false,
      shininess: 100
    });

    this.vaseMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.vaseMesh);
  }

  saveSTL() {
    if (!this.vaseMesh) return;

    const exporter = new STLExporter();

    // Scale up to mm for STL export
    this.vaseMesh.scale.set(INCH_TO_MM, INCH_TO_MM, INCH_TO_MM);
    const stlString = exporter.parse(this.vaseMesh);
    this.vaseMesh.scale.set(1, 1, 1); // reset scale

    const blob = new Blob([stlString], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.params.vaseMode ? 'spiral_vase.stl' : 'artistic_vase.stl';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
