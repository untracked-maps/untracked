<script lang="ts">
  import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import '#libraries/design/tokens.css';
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
    font: var(--font-size-small) / var(--line-height-body) var(--font-ui);
    pointer-events: auto;
  }

  div :global(.maplibregl-ctrl-bottom-right > .maplibregl-ctrl) {
    margin: 0 var(--edge) var(--edge) 0;
  }

  div :global(.maplibregl-ctrl-attrib) {
    color: var(--text);
    background-color: var(--surface-translucent);
    border-radius: var(--radius-full);
  }

  div :global(.maplibregl-ctrl-attrib:not(.maplibregl-compact)) {
    padding: var(--space-1) var(--space-3);
  }

  div :global(.maplibregl-ctrl-attrib a) {
    color: inherit;
  }

  div :global(.maplibregl-ctrl-attrib-button) {
    color: var(--text);
    background-color: transparent;
    background-image: none;
  }

  div :global(.maplibregl-ctrl-attrib-button)::after {
    position: absolute;
    inset: 0;
    content: "";
    background-color: currentcolor;
    mask:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill-rule='evenodd' d='M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0'/%3E%3C/svg%3E")
      center / 100% no-repeat;
  }
</style>
