// VaseGeometryGenerator.js
import { PathGenerator } from './PathGenerator.js';
import { SimplePathGenerator } from './SimplePathGenerator.js';

// VaseGeometryGenerator.js
import { PathGenerator } from './PathGenerator.js';
import { SimplePathGenerator } from './SimplePathGenerator.js';

export class VaseGeometryGenerator {
  constructor(params, useSimpleGenerator = false) {
    this.params = params;
    this.useSimpleGenerator = useSimpleGenerator;
    this.pathGenerator = useSimpleGenerator
      ? new SimplePathGenerator(params.baseRadius, params.height, params.twistRate, params.numPaths)
      : new PathGenerator(params);
  }

  generateGeometry() {
    const path = this.pathGenerator.generatePath(0, 1);
    // Convert path points to 3D geometry here
    const geometry = new THREE.BufferGeometry().setFromPoints(path.map(p => new THREE.Vector3(p.x, p.y, p.z)));
    return geometry;
  }
}

// Example usage:
const params = {
  radius: 10,
  height: 50,
  turns: 5,
  steps: 100,
  baseRadius: 5,
  topRadius: 10,
  twistRate: 1,
  flowFreq: 0.5,
  flowAmplitude: 1,
  heightFreq: 1,
  vaseMode: true,
  smoothSpiral: true,
  xySmoothing: 10,
};

const useSimpleGenerator = true; // Toggle between PathGenerator and SimplePathGenerator

const vaseGen = new VaseGeometryGenerator(params, useSimpleGenerator);
vaseGen.generateVaseGeometry();
