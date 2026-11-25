import { map, merge, type Observable, switchMap } from 'rxjs';
import type { Coordinates } from './show-map';

type FramedDistrict = {
  readonly at: Coordinates;
  readonly outline: readonly Coordinates[];
};

type Framed =
  | { readonly kind: 'place'; readonly at: Coordinates }
  | { readonly kind: 'district'; readonly at: Coordinates }
  | { readonly kind: 'places'; readonly at: readonly [Coordinates, ...Coordinates[]] }
  | { readonly kind: 'outline'; readonly at: readonly [Coordinates, ...Coordinates[]] };

type FramingInputs = {
  readonly placesOpened: Observable<Coordinates>;
  readonly districtsOpened: Observable<FramedDistrict>;
  readonly placesListed: Observable<readonly [Coordinates, ...Coordinates[]]>;
};

type SheetCover =
  | { readonly layout: 'bottom'; readonly height: number }
  | { readonly layout: 'side'; readonly width: number; readonly end: number };

type MapMeasures = {
  readonly width: number;
  readonly height: number;
  readonly zoom: number;
  readonly topBarBottom: number;
  readonly sheet: SheetCover;
};

type Bounds = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

type Padding = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

type CameraMove =
  | {
      readonly kind: 'flight';
      readonly center: Coordinates;
      readonly zoom: number;
      readonly offset: { readonly right: number; readonly down: number };
      readonly duration: number;
      readonly essential: false;
    }
  | {
      readonly kind: 'fit';
      readonly bounds: Bounds;
      readonly padding: Padding;
      readonly maxZoom: number;
      readonly duration: number;
      readonly essential: false;
    };

type FrameMapPorts = {
  readonly measure: () => Observable<MapMeasures>;
};

const PLACE_ZOOM = 16.5;

const DISTRICT_ZOOM = 14.3;

const FLIGHT_DURATION = 800;

const DISTRICT_DURATION = 900;

const DISTRICT_MARGIN = 40;

const FIT_DURATION = 700;

const FIT_MOST_ZOOM = 17;

const PHONE_MARGIN = { block: 24, inline: 36 };

const LARGE_SCREEN_MARGIN = 60;

const SHEET_MOST_SHARE = 0.6;

const HALF = 2;

const leftCovered = ({ sheet }: MapMeasures): number => (sheet.layout === 'side' ? sheet.end : 0);

const bottomCovered = ({ sheet }: MapMeasures): number => (sheet.layout === 'bottom' ? sheet.height : 0);

const offsetOf = (measures: MapMeasures): { readonly right: number; readonly down: number } => ({
  right: Math.round((leftCovered(measures) + measures.width) / HALF - measures.width / HALF),
  down: Math.round((measures.topBarBottom + measures.height - bottomCovered(measures)) / HALF - measures.height / HALF)
});

const pointBounds = ({ longitude, latitude }: Coordinates): Bounds => ({
  west: longitude,
  south: latitude,
  east: longitude,
  north: latitude
});

const widened = (bounds: Bounds, { longitude, latitude }: Coordinates): Bounds => ({
  west: Math.min(bounds.west, longitude),
  south: Math.min(bounds.south, latitude),
  east: Math.max(bounds.east, longitude),
  north: Math.max(bounds.north, latitude)
});

const boundsOf = ([first, ...others]: readonly [Coordinates, ...Coordinates[]]): Bounds =>
  others.reduce(widened, pointBounds(first));

type Margins = {
  readonly phone: { readonly block: number; readonly inline: number };
  readonly large: number;
};

const PLACES_MARGINS: Margins = { phone: PHONE_MARGIN, large: LARGE_SCREEN_MARGIN };

const DISTRICT_MARGINS: Margins = { phone: { block: DISTRICT_MARGIN, inline: DISTRICT_MARGIN }, large: DISTRICT_MARGIN };

const besideThePanel = (width: number, margin: number): Padding => ({
  top: margin,
  right: margin,
  bottom: margin,
  left: width + margin
});

const aboveTheSheet = (
  { height, topBarBottom }: MapMeasures,
  sheetHeight: number,
  margin: { readonly block: number; readonly inline: number }
): Padding => ({
  top: topBarBottom + margin.block,
  right: margin.inline,
  bottom: Math.min(sheetHeight, Math.round(height * SHEET_MOST_SHARE)) + margin.block,
  left: margin.inline
});

const paddingOf = (measures: MapMeasures, margins: Margins): Padding =>
  measures.sheet.layout === 'side'
    ? besideThePanel(measures.sheet.width, margins.large)
    : aboveTheSheet(measures, measures.sheet.height, margins.phone);

const fitOf = (at: readonly [Coordinates, ...Coordinates[]], padding: Padding, framing: 'places' | 'outline'): CameraMove => ({
  kind: 'fit',
  bounds: boundsOf(at),
  padding,
  maxZoom: framing === 'places' ? FIT_MOST_ZOOM : DISTRICT_ZOOM,
  duration: framing === 'places' ? FIT_DURATION : DISTRICT_DURATION,
  essential: false
});

const moveOf = (framed: Framed, measures: MapMeasures): CameraMove => {
  if (framed.kind === 'places' || framed.kind === 'outline') {
    return fitOf(framed.at, paddingOf(measures, framed.kind === 'places' ? PLACES_MARGINS : DISTRICT_MARGINS), framed.kind);
  }
  return {
    kind: 'flight',
    center: framed.at,
    zoom: framed.kind === 'district' ? DISTRICT_ZOOM : Math.max(measures.zoom, PLACE_ZOOM),
    offset: offsetOf(measures),
    duration: framed.kind === 'district' ? DISTRICT_DURATION : FLIGHT_DURATION,
    essential: false
  };
};

const districtFramed = ({ at, outline: [first, ...others] }: FramedDistrict): Framed =>
  first === undefined ? { kind: 'district', at } : { kind: 'outline', at: [first, ...others] };

const frameMap =
  ({ measure }: FrameMapPorts) =>
  ({ placesOpened, districtsOpened, placesListed }: FramingInputs): Observable<CameraMove> =>
    merge(
      placesOpened.pipe(map((at): Framed => ({ kind: 'place', at }))),
      districtsOpened.pipe(map(districtFramed)),
      placesListed.pipe(map((at): Framed => ({ kind: 'places', at })))
    ).pipe(switchMap((framed) => measure().pipe(map((measures) => moveOf(framed, measures)))));

export { type CameraMove, type FramingInputs, frameMap, type MapMeasures };
