// PathGenerator class for generating a simple helical path
class SimplePathGenerator {
  constructor(radius, height, turns, steps) {
    this.radius = radius; // Radius of the helix
    this.height = height; // Total height of the helix
    this.turns = turns;   // Number of turns in the helix
    this.steps = steps;   // Number of steps to divide the path into
  }

  // Method to generate the path points
  generatePath() {
    const points = [];

    for (let i = 0; i <= this.steps; i++) {
      const t = i / this.steps; // Fraction from 0 to 1
      const angle = 2 * Math.PI * this.turns * t; // Angle θ
      const r = this.radius; // Fixed radius
      const z = this.height * t; // Linearly increasing height

      // Convert cylindrical coordinates (r, θ, z) to Cartesian coordinates (x, y, z)
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      // Add the point to the path
      points.push({ x, y, z });
    }

    return points;
  }
}

// Example usage:
const radius = 10; // Radius of the helix
const height = 50; // Total height of the helix
const turns = 5;   // Number of turns in the helix
const steps = 100; // Number of steps for the path

const pathGenerator = new SimplePathGenerator(radius, height, turns, steps);
const path = pathGenerator.generatePath();

console.log(path);
