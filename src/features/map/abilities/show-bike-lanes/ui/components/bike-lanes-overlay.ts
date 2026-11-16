import type { BikeLanesLayers, BikeLanesPalette } from './bike-lanes-style';

const loadBikeLanesLayers = async (palette: BikeLanesPalette): Promise<BikeLanesLayers> =>
  (await import('./bike-lanes-style')).bikeLanesLayers(palette);

export { loadBikeLanesLayers };
