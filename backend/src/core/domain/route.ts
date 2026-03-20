//This is the pure domain layer. It defines the main business shapes.
export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

export interface RouteComparison {
  baseline: Pick<Route, 'routeId' | 'ghgIntensity'>;
  comparison: Pick<Route, 'routeId' | 'ghgIntensity'>;
  percentDiff: number;
  compliant: boolean;
}
