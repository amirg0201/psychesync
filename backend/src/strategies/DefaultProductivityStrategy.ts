import { IProductivityStrategy } from './IProductivityStrategy';

export class DefaultProductivityStrategy implements IProductivityStrategy {
  calculate(baseScore: number, realIntensity: number, expectedIntensity: number): number {
    // Fórmula: el delta negativo (sesión más intensa de lo esperado)
    // penaliza el puntaje; un delta positivo lo mejora.
    const intensityDelta = realIntensity - expectedIntensity;
    return baseScore - intensityDelta;
  }
}

export class WeightedProductivityStrategy implements IProductivityStrategy {
  private priorityMultiplier: number;

  constructor(priorityMultiplier = 1.5) {
    this.priorityMultiplier = priorityMultiplier;
  }

  calculate(baseScore: number, realIntensity: number, expectedIntensity: number): number {
    const intensityDelta = realIntensity - expectedIntensity;
    // Las citas de alta prioridad tienen mayor peso en el puntaje
    return (baseScore * this.priorityMultiplier) - intensityDelta;
  }
}
