import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { Observable, switchMap } from 'rxjs';
import { type ShownPlace, viewOfChosenPlace } from '../../domain/chosen-place';
import './chosen-place-overlay.css';

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
      const { center, zoom } = viewOfChosenPlace(place, map.getZoom());
      const marker = new Marker({ element: placeMarkOf(place), anchor: 'bottom' })
        .setLngLat([center.longitude, center.latitude])
        .addTo(map);
      map.flyTo({ center: [center.longitude, center.latitude], zoom });
      return (): void => {
        marker.remove();
      };
    });

const chosenPlaceOverlay =
  (chosen$: Observable<ShownPlace>) =>
  (map: MapLibreMap): Observable<never> =>
    chosen$.pipe(switchMap(showPlace(map)));

export { chosenPlaceOverlay };
