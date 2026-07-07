export interface IProductivityStrategy {

  calculate(baseScore: number, realIntensity: number, expectedIntensity: number): number;
}
