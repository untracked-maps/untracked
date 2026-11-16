import type { Observable } from 'rxjs';
import type { ColourScheme } from '#features/appearance/abilities/choose-theme/domain/choose-theme';
import { BASEMAPS, type Basemap, chooseBasemap } from '#features/map/abilities/choose-basemap/domain/choose-basemap';
import { ignOrthophotos } from '#features/map/abilities/choose-basemap/implementation/ign/ign-orthophotos';
import type { Located } from '#features/map/abilities/locate-me/domain/locate-me';
import { showBikeLanes } from '#features/map/abilities/show-bike-lanes/domain/show-bike-lanes';
import type { BasemapImagery } from '#features/map/abilities/show-map/implementation/openfreemap/basemap-style';
import { showTransitLines, type TransitLine } from '#features/map/abilities/show-transit-lines/domain/show-transit-lines';
import { idfmTransitLines } from '#features/map/abilities/show-transit-lines/implementation/idfm/idfm-transit-lines';
import { type KeptOnDevice, keptInMemory, keptOnDevice } from '#features/map/implementation/browser/kept-on-device';
import { browser } from '$app/env';
import type { PageLoad } from './$types';

type MapLayers = {
  readonly basemap: KeptOnDevice<Basemap>;
  readonly transitLines: KeptOnDevice<boolean>;
  readonly bikeLanes: KeptOnDevice<boolean>;
  readonly transitLinesShown: Observable<boolean>;
  readonly bikeLanesShown: Observable<boolean>;
  readonly satelliteImagery: Observable<BasemapImagery | undefined>;
  readonly transitLinesOnMap: Observable<readonly TransitLine[] | undefined>;
  readonly bikeLanesOnMap: Observable<ColourScheme | undefined>;
};

const SHOWN_OR_HIDDEN = [false, true] as const;

const keptChoice = <Value>(key: string, values: readonly [Value, ...Value[]]): KeptOnDevice<Value> =>
  browser ? keptOnDevice(localStorage, key, values) : keptInMemory(values);

export const load: PageLoad = async ({ data, parent }): Promise<{ readonly position: Located; readonly layers: MapLayers }> => {
  const { theme } = await parent();
  const basemap = keptChoice('untracked-maps.basemap', BASEMAPS);
  const transitLines = keptChoice('untracked-maps.transit-lines', SHOWN_OR_HIDDEN);
  const bikeLanes = keptChoice('untracked-maps.bike-lanes', SHOWN_OR_HIDDEN);
  return {
    ...data,
    layers: {
      basemap,
      transitLines,
      bikeLanes,
      transitLinesShown: transitLines.kept(),
      bikeLanesShown: bikeLanes.kept(),
      satelliteImagery: chooseBasemap({ chosenBasemap: basemap.kept, loadSatelliteImagery: ignOrthophotos })(),
      transitLinesOnMap: showTransitLines({
        shownTransitLines: transitLines.kept,
        loadTransitLines: idfmTransitLines((url) => fetch(url))
      })(),
      bikeLanesOnMap: showBikeLanes({ shownBikeLanes: bikeLanes.kept })(theme.colourScheme)
    }
  };
};
