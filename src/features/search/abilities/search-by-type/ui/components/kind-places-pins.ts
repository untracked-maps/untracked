import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { merge, Observable } from 'rxjs';
import type { Place } from '../../../../domain/place';
import './kind-colours.css';
import './kind-places-pins.css';

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

const showPlaces =
  (map: MapLibreMap) =>
  (places: readonly [Place, ...Place[]]): Observable<never> =>
    merge(...places.map(pinned(map)));

export { showPlaces };
