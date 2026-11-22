import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { Observable, switchMap } from 'rxjs';
import { type Found, isAddress } from '../../../../domain/found';
import './chosen-place-overlay.css';

type ShownPlace = Pick<Found, 'name' | 'kind' | 'coordinates'>;

const placeMarkOf = (place: ShownPlace): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'search-places-chosen';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', place.name);
  return element;
};

const showPlace =
  (map: MapLibreMap) =>
  (place: ShownPlace): Observable<never> =>
    new Observable<never>(() => {
      const markers = [place]
        .filter(isAddress)
        .map((address) =>
          new Marker({ element: placeMarkOf(address), anchor: 'bottom' })
            .setLngLat([address.coordinates.longitude, address.coordinates.latitude])
            .addTo(map)
        );
      return (): void => {
        markers.map((marker) => marker.remove());
      };
    });

const chosenPlaceOverlay =
  (chosen$: Observable<ShownPlace>) =>
  (map: MapLibreMap): Observable<never> =>
    chosen$.pipe(switchMap(showPlace(map)));

export { chosenPlaceOverlay };
