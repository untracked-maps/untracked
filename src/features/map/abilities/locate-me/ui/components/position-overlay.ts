import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { defer, filter, finalize, type Observable, tap } from 'rxjs';
import { m } from '#i18n/messages';
import type { LocateMeStatus } from '../../domain/locate-me';
import './position-overlay.css';

type Centred = Extract<LocateMeStatus, { readonly kind: 'located' }>;

const isCentred = (status: LocateMeStatus): status is Centred => status.kind === 'located';

const positionMark = (): HTMLElement => {
  const element = document.createElement('span');
  element.className = 'locate-me-position';
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', m.locate_me_position());
  return element;
};

const positionOverlay =
  (status$: Observable<LocateMeStatus>) =>
  (map: MapLibreMap): Observable<LocateMeStatus> =>
    defer(() => {
      const marker = new Marker({ element: positionMark() });
      return status$.pipe(
        filter(isCentred),
        tap(({ view: { center, zoom } }) => {
          marker.setLngLat([center.longitude, center.latitude]).addTo(map);
          map.flyTo({ center: [center.longitude, center.latitude], zoom });
        }),
        finalize(() => marker.remove())
      );
    });

export { positionOverlay };
