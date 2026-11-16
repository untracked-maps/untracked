import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { merge, Observable } from 'rxjs';
import type { Place } from '../../../../domain/place';
import { boundsOf } from '../../domain/bounds';
import { fitPaddingFor } from './fit-padding.presenter';
import './kind-colours.css';
import './kind-places-pins.css';

const FIT_MOST_ZOOM = 16;

const pinOf = (place: Place): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'search-by-type-pin';
  element.dataset['kind'] = place.kind;
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', place.name);
  return element;
};

const pinned =
  (map: MapLibreMap) =>
  (place: Place): Observable<never> =>
    new Observable<never>(() => {
      const marker = new Marker({ element: pinOf(place) })
        .setLngLat([place.coordinates.longitude, place.coordinates.latitude])
        .addTo(map);
      return (): void => {
        marker.remove();
      };
    });

const fitted = (map: MapLibreMap, places: readonly [Place, ...Place[]]): Observable<never> =>
  new Observable<never>(() => {
    const { west, south, east, north } = boundsOf(places);
    map.fitBounds(
      [
        [west, south],
        [east, north]
      ],
      {
        padding: fitPaddingFor({ width: map.getContainer().clientWidth, height: map.getContainer().clientHeight }),
        maxZoom: FIT_MOST_ZOOM
      }
    );
  });

const showPlaces =
  (map: MapLibreMap) =>
  (places: readonly [Place, ...Place[]]): Observable<never> =>
    merge(...places.map(pinned(map)), fitted(map, places));

export { showPlaces };
