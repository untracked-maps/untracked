import type { TransitLine } from '../../domain/show-transit-lines';
import type { TransitLinesLayers } from './transit-lines-layers';

const loadTransitLinesLayers = async (lines: readonly TransitLine[]): Promise<TransitLinesLayers> =>
  (await import('./transit-lines-layers')).transitLinesLayers(lines);

export { loadTransitLinesLayers };
