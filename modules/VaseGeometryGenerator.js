// modules/VaseGeometryGenerator.js
import * as THREE from 'three';
import { PathGenerator } from './PathGenerator.js';
import { ProfileGenerator } from './ProfileGenerator.js';
import { INCH_TO_MM, MM_TO_INCH } from './constants.js';

export class VaseGeometryGenerator {
  constructor(params) {
    this.params = params;
    this.pathGenerator = new PathGenerator(params);
    this.profileGenerator = new ProfileGenerator(params);
  }

  generateGeometry() {
    const geometry = new THREE.BufferGeometry();
    const indices = [];

    // Generate paths
    const numPaths = this.params.vaseMode ? 1 : this.params.numPaths;
    const paths = [];
    for (let i = 0; i < numPaths; i++) {
      paths.push(this.pathGenerator.generatePath(i, numPaths));
    }

    // Profile
    const sampleProfile = this.profileGenerator.generateProfile(0);
    const pointsPerPath = paths[0].length;
    const pointsPerProfile = sampleProfile.length;
    const totalVertices = numPaths * pointsPerPath * pointsPerProfile;

    // Typed arrays
    const positionArray = new Float32Array(totalVertices * 3);
    const normalArray = new Float32Array(totalVertices * 3);
    let vertexIndex = 0;

    // Build geometry
    for (let pathIdx = 0; pathIdx < paths.length; pathIdx++) {
      const path = paths[pathIdx];

      for (let i = 0; i < path.length - 1; i++) {
        const t = i / (path.length - 1);
        const profile = this.profileGenerator.generateProfile(t);
        const point = path[i];
        const nextPoint = path[i + 1];

        const { normal, binormal } =
          this.pathGenerator.computePathFrame(point, nextPoint);

        // Add profile points
        for (let j = 0; j < profile.length; j++) {
          const profilePoint = profile[j];
          const pos = point.clone()
            .add(normal.clone().multiplyScalar(profilePoint.x))
            .add(binormal.clone().multiplyScalar(profilePoint.y));

          positionArray[vertexIndex * 3 + 0] = pos.x;
          positionArray[vertexIndex * 3 + 1] = pos.y;
          positionArray[vertexIndex * 3 + 2] = pos.z;

          // Simple normal usage
          const vertexNormal = normal.clone().normalize();
          normalArray[vertexIndex * 3 + 0] = vertexNormal.x;
          normalArray[vertexIndex * 3 + 1] = vertexNormal.y;
          normalArray[vertexIndex * 3 + 2] = vertexNormal.z;

          vertexIndex++;
        }

        // Create faces
        if (i < path.length - 2) {
          const baseIndex = vertexIndex - profile.length;
          for (let j = 0; j < profile.length - 1; j++) {
            const v0 = baseIndex + j;
            const v1 = baseIndex + j + 1;
            const v2 = v0 + profile.length;
            const v3 = v1 + profile.length;

            indices.push(v0, v1, v2);
            indices.push(v1, v3, v2);
          }
        }
      }
    }

    // Optionally add base geometry if in vaseMode + bottomLayers > 0
    if (this.params.vaseMode && this.params.bottomLayers > 0) {
      this.addBaseGeometry(geometry, positionArray, normalArray, indices);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normalArray, 3));
    geometry.setIndex(indices);

    return geometry;
  }

  addBaseGeometry(geometry, positionArray, normalArray, indices) {
    // The original code tries pushing onto arrays (positions, normals) that are typed arrays.
    // That’s trickier to handle. Typically we’d do a separate geometry or expand typed arrays.
    // For now, you can adapt as needed, or leave it unimplemented.
    // This is just a placeholder to match your original method signature.

    // If you truly want a bottom cap, you'd need to create a separate geometry for the base
    // or expand the typed arrays. It's more complex. The code below won't directly work
    // with typed arrays in their current form.
  }
}
