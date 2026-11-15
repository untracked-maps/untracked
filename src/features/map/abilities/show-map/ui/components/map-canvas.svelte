<script lang="ts">
  import { Map as MapLibreMap, type StyleSpecification, setWorkerUrl } from 'maplibre-gl';
  import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import type { Observable } from 'rxjs';
  import type { MapScene } from '../../domain/show-map';
  import { cameraOf } from './camera.presenter';

  type Props = {
    readonly scene: Observable<MapScene<StyleSpecification>>;
    readonly label: string;
    readonly onMap?: (map: MapLibreMap) => void;
  };

  const { scene, label, onMap }: Props = $props();

  const mountMap = (container: HTMLElement): (() => void) => {
    setWorkerUrl(workerUrl);
    const map = new MapLibreMap({ container, locale: { 'Map.Title': label } });
    onMap?.(map);
    const subscription = scene.subscribe(({ basemap, view }) => {
      const { center, zoom } = cameraOf(view);
      map.setStyle(basemap);
      map.jumpTo({ center: [...center], zoom });
    });
    return (): void => {
      subscription.unsubscribe();
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
