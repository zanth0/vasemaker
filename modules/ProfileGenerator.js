// modules/ProfileGenerator.js
import * as THREE from 'three';
import { MM_TO_INCH, BAMBU_NOZZLE } from './constants.js';

export class ProfileGenerator {
  constructor(params) {
    this.params = params;
  }

  generateProfile(t) {
    const points = [];
    const segments = this.params.vaseMode ? 16 : 8;

    for (let i = 0; i <= segments; i++) {
      const angle = (2 * Math.PI * i) / segments;

      if (this.params.vaseMode) {
        // Use exact nozzle diameter (in mm, then convert to inches)
        const x = (BAMBU_NOZZLE * 0.5 * Math.cos(angle)) * MM_TO_INCH;
        const y = (BAMBU_NOZZLE * Math.sin(angle)) * MM_TO_INCH;
        points.push(new THREE.Vector2(x, y));
      } else {
        // Artistic mode (already in inches)
        const x = this.params.profileWidth * 0.5 * Math.cos(angle);
        const y = this.params.profileHeight * Math.sin(angle);
        points.push(new THREE.Vector2(x, y));
      }
    }
    return points;
  }
}
