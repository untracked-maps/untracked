import { type Map as MapLibreMap, Marker } from 'maplibre-gl';
import { combineLatest, distinctUntilChanged, map, NEVER, Observable, switchMap } from 'rxjs';
import { m } from '#i18n/messages';
import DRAWINGS from '../../../../ui/components/place-dot-drawings.json' with { type: 'json' };
import COLOURS from '../../../../ui/components/place-name-colours.json' with { type: 'json' };
import { openedPlaceOf, type PlaceSheet, type SheetPlace } from '../../domain/open-place';
import MARKS from './open-place-marks.json' with { type: 'json' };
import './open-place-overlay.css';

type Palette = 'light' | 'dark';

type Drawing = {
  readonly colour: string;
  readonly pictogram: string;
};

const SVG = 'http://www.w3.org/2000/svg';

const WITHOUT_FAMILY = 'none';

const HALOS: Readonly<Record<Palette, string>> = { light: '#FFFFFF', dark: 'rgba(22,24,28,0.95)' };

const DRAWN: ReadonlyMap<string, Drawing> = new Map(Object.entries(DRAWINGS));

const NAME_COLOURS: Readonly<Record<Palette, ReadonlyMap<string, string>>> = {
  light: new Map(Object.entries(COLOURS.light.names)),
  dark: new Map(Object.entries(COLOURS.dark.names))
};

type MarkedPlace = Pick<SheetPlace, 'name' | 'family' | 'coordinates'>;

const familyOf = ({ family }: MarkedPlace): string => family ?? WITHOUT_FAMILY;

const imageOf = (name: string, width: number, height: number, drawing: string): SVGSVGElement => {
  const image = document.createElementNS(SVG, 'svg');
  image.setAttribute('role', 'img');
  image.setAttribute('aria-label', name);
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
  image.setAttribute('viewBox', `0 0 ${width} ${height}`);
  image.innerHTML = drawing;
  return image;
};

const { dot: DOT, pin: PIN } = MARKS;

const dotOf = (name: string, { colour, pictogram }: Drawing): SVGSVGElement =>
  imageOf(
    name,
    DOT.width,
    DOT.height,
    `${DOT.rim}${DOT.disc.replace('{colour}', colour)}${DOT.pictogram.replace('{pictogram}', pictogram)}`
  );

const nameOf = (place: MarkedPlace, palette: Palette): HTMLElement => {
  const label = document.createElement('span');
  label.className = 'open-place-name';
  label.setAttribute('aria-hidden', 'true');
  label.textContent = place.name;
  label.style.cssText = `--name-colour: ${NAME_COLOURS[palette].get(familyOf(place))}; --name-halo: ${HALOS[palette]}`;
  return label;
};

type Marked = {
  readonly place: MarkedPlace;
  readonly drawing?: Drawing;
};

const markOf = ({ place, drawing }: Marked, palette: Palette): HTMLElement => {
  const mark = document.createElement('div');
  mark.className = drawing === undefined ? 'open-place-mark open-place-pin' : 'open-place-mark';
  mark.append(
    ...(drawing === undefined
      ? [imageOf(place.name, PIN.width, PIN.height, PIN.drawing)]
      : [dotOf(place.name, drawing), nameOf(place, palette)])
  );
  return mark;
};

const marked =
  (mapLibre: MapLibreMap) =>
  ([shown, palette]: readonly [Marked | undefined, Palette]): Observable<never> =>
    shown === undefined
      ? NEVER
      : new Observable<never>(() => {
          const marker = new Marker({
            element: markOf(shown, palette),
            anchor: shown.drawing === undefined ? 'bottom' : 'center'
          })
            .setLngLat([shown.place.coordinates.longitude, shown.place.coordinates.latitude])
            .addTo(mapLibre);
          return (): void => {
            marker.remove();
          };
        });

const markWith = (place: MarkedPlace, drawing: Drawing | undefined): Marked =>
  drawing === undefined ? { place } : { place, drawing };

const openedMarkOf = (place: SheetPlace | undefined): Marked | undefined =>
  place === undefined ? undefined : markWith(place, DRAWN.get(familyOf(place)));

const markedOf = (sheet: PlaceSheet): Marked | undefined =>
  sheet.status === 'missing' && sheet.at !== undefined
    ? { place: { name: m.place_missing(), coordinates: sheet.at } }
    : openedMarkOf(openedPlaceOf(sheet));

const isSameMark = (before: Marked | undefined, after: Marked | undefined): boolean =>
  before?.place.coordinates === after?.place.coordinates;

const openPlaceOverlay =
  (sheet$: Observable<PlaceSheet>, palette$: Observable<Palette>) =>
  (mapLibre: MapLibreMap): Observable<never> =>
    combineLatest([sheet$.pipe(map(markedOf), distinctUntilChanged(isSameMark)), palette$]).pipe(switchMap(marked(mapLibre)));

export { openPlaceOverlay };
