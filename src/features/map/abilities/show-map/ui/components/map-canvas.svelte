<script lang="ts">
  import { type AddProtocolAction, addProtocol, Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import '#libraries/design/tokens.css';
  import { merge, type Observable, tap } from 'rxjs';
  import type { MapScene, MapView } from '../../domain/show-map';
  import { camerasOf, viewOf } from './camera.presenter';

  type MapOverlay = (map: MapLibreMap) => Observable<unknown>;

  type MapProtocol = {
    readonly name: string;
    readonly load: AddProtocolAction;
  };

  type Props = {
    readonly scene: Observable<MapScene<StyleSpecification>>;
    readonly label: string;
    readonly onMap?: (map: MapLibreMap) => void;
    readonly onViewChange?: (view: MapView) => void;
    readonly overlays?: readonly MapOverlay[];
    readonly protocol?: MapProtocol;
  };

  const { scene, label, onMap, onViewChange, overlays = [], protocol }: Props = $props();

  const mountMap = (container: HTMLElement): (() => void) => {
    setWorkerUrl(workerUrl);
    if (protocol !== undefined) {
      addProtocol(protocol.name, protocol.load);
    }
    const map = new MapLibreMap({ container, attributionControl: false, locale: { 'Map.Title': label } });
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
</style>
