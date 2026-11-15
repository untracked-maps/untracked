<script lang="ts">
  import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { merge, type Observable, tap } from 'rxjs';
  import type { MapScene, MapView } from '../../domain/show-map';
  import { camerasOf, viewOf } from './camera.presenter';

  type MapOverlay = (map: MapLibreMap) => Observable<unknown>;

  type Props = {
    readonly scene: Observable<MapScene<StyleSpecification>>;
    readonly label: string;
    readonly onMap?: (map: MapLibreMap) => void;
    readonly onViewChange?: (view: MapView) => void;
    readonly overlays?: readonly MapOverlay[];
  };

  const { scene, label, onMap, onViewChange, overlays = [] }: Props = $props();

  const mountMap = (container: HTMLElement): (() => void) => {
    setWorkerUrl(workerUrl);
    const map = new MapLibreMap({ container, locale: { 'Map.Title': label } });
    onMap?.(map);
    map.on('moveend', () => onViewChange?.(viewOf(map.getCenter().wrap(), map.getZoom())));
    const subscription = scene
      .pipe(
        tap(({ basemap }) => map.setStyle(basemap)),
        camerasOf
      )
      .subscribe(({ center, zoom }) => map.jumpTo({ center: [...center], zoom }));
    const overlaid = merge(...overlays.map((overlay) => overlay(map))).subscribe();
    return (): void => {
      subscription.unsubscribe();
      overlaid.unsubscribe();
      map.remove();
    };
  };
</script>

<div {@attach mountMap}></div>

<style>
  div {
    position: absolute;
    inset: 0;
  }
</style>
