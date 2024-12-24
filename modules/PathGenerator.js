// modules/PathGenerator.js
import { INCH_TO_MM, MM_TO_INCH, BAMBU_NOZZLE } from './constants.js';
import * as THREE from 'three';

export class PathGenerator {
  constructor(params) {
    this.params = params;
  }

  generateControlPoint(t, pathIndex, totalPaths) {
    const height = this.params.height * INCH_TO_MM;
    const baseRadius = this.params.baseRadius * INCH_TO_MM;
    const topRadius = this.params.topRadius * INCH_TO_MM;

    let angle, radius, variation;

    if (this.params.vaseMode) {
      // Continuous spiral for vase mode
      angle = t * (2 * Math.PI * this.params.twistRate) + (height * t * 2 * Math.PI);
      radius = baseRadius + (topRadius - baseRadius) * t;

      // Minimal variation for printability
      const wave = Math.sin(angle * this.params.flowFreq + t * Math.PI * 2);
      variation = this.params.flowAmplitude * wave * BAMBU_NOZZLE;
    } else {
      // Artistic mode
      angle = 2 * Math.PI * (t * this.params.twistRate + pathIndex / totalPaths);
      radius = baseRadius + (topRadius - baseRadius) * t;

      const wave1 = Math.sin(angle * this.params.flowFreq + t * Math.PI * 2);
      const wave2 = Math.sin(2 * angle * this.params.flowFreq + t * Math.PI * 3);
      const heightVar = Math.sin(t * Math.PI * this.params.heightFreq);

      variation = (this.params.flowAmplitude * INCH_TO_MM) * (
        wave1 * (0.5 + 0.5 * heightVar) +
        wave2 * 0.3 * (4 * t * (1 - t))
      );
    }

    // Position in mm
    let x = (radius + variation) * Math.cos(angle);
    let y = (radius + variation) * Math.sin(angle);
    let z = height * t;

    // Smooth spiral if vase mode
    if (this.params.vaseMode && this.params.smoothSpiral) {
      const smoothingRadius = (this.params.xySmoothing / 100) * BAMBU_NOZZLE;
      const offset = this.calculateSmoothSpiral(t, angle, smoothingRadius);
      x += offset.x;
      y += offset.y;
    }

    // Convert back to inches
    return new THREE.Vector3(x * MM_TO_INCH, y * MM_TO_INCH, z * MM_TO_INCH);
  }

  generatePath(pathIndex, totalPaths) {
    const points = [];
    const steps = this.params.vaseMode ? 200 : 50;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      points.push(this.generateControlPoint(t, pathIndex, totalPaths));
    }
    return points;
  }

  calculateSmoothSpiral(t, angle, radius) {
    const stepAngle = 2 * Math.PI / (this.params.height * INCH_TO_MM);
    const prevAngle = angle - stepAngle;
    const nextAngle = angle + stepAngle;

    const x1 = Math.cos(prevAngle);
    const y1 = Math.sin(prevAngle);
    const x2 = Math.cos(angle);
    const y2 = Math.sin(angle);
    const x3 = Math.cos(nextAngle);
    const y3 = Math.sin(nextAngle);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);

    return {
      x: (x3 - x1) * radius / dist,
      y: (y3 - y1) * radius / dist
    };
  }

  computePathFrame(point, nextPoint) {
    const tangent = nextPoint.clone().sub(point).normalize();
    const up = new THREE.Vector3(0, 0, 1);
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();

    return { normal, binormal };
  }
}
