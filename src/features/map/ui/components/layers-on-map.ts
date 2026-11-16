import type { LayerSpecification, Map as MapLibreMap, SourceSpecification, StyleSpecification } from 'maplibre-gl';
import { defer, EMPTY, Observable, switchMap } from 'rxjs';

type MapLayers = {
  readonly sources: Readonly<Record<string, SourceSpecification>>;
  readonly layers: readonly LayerSpecification[];
};

const loadedStyle = (map: MapLibreMap): StyleSpecification | undefined => {
  const style: StyleSpecification | undefined = map.getStyle();
  return style;
};

const firstLabelOf = ({ layers }: StyleSpecification): string | undefined => layers.find(({ type }) => type === 'symbol')?.id;

const addMissing = (map: MapLibreMap, { sources, layers }: MapLayers, style: StyleSpecification): MapLibreMap => {
  const firstLabel = firstLabelOf(style);
  return layers.reduce(
    (drawn, layer) => drawn.addLayer(layer, firstLabel),
    Object.entries(sources).reduce((drawn, [id, source]) => drawn.addSource(id, source), map)
  );
};

const removeAll = (map: MapLibreMap, { sources, layers }: MapLayers): MapLibreMap =>
  Object.keys(sources)
    .filter((id) => map.getSource(id) !== undefined)
    .reduce(
      (cleared, id) => cleared.removeSource(id),
      layers.filter(({ id }) => map.getLayer(id) !== undefined).reduce((cleared, { id }) => cleared.removeLayer(id), map)
    );

const layersOnMap = (map: MapLibreMap, drawn: MapLayers): Observable<never> =>
  new Observable<never>(() => {
    const draw = (): void => {
      const style = loadedStyle(map);
      if (style !== undefined) {
        addMissing(map, drawn, style);
      }
    };
    draw();
    map.on('style.load', draw);
    return (): void => {
      map.off('style.load', draw);
      removeAll(map, drawn);
    };
  });

const layersOverlay =
  <Drawn>(drawn$: Observable<Drawn | undefined>, layersOf: (drawn: Drawn) => Promise<MapLayers>) =>
  (map: MapLibreMap): Observable<never> =>
    drawn$.pipe(
      switchMap((drawn) =>
        drawn === undefined ? EMPTY : defer(() => layersOf(drawn)).pipe(switchMap((layers) => layersOnMap(map, layers)))
      )
    );

export { layersOverlay };
