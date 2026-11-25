import { catchError, map, merge, type Observable, of, shareReplay, startWith, switchMap, take } from 'rxjs';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type SpotAddress = { readonly kind: 'address'; readonly address: PostalAddress } | { readonly kind: 'no-address' };

type ReverseGeocode = (spot: Coordinates) => Observable<SpotAddress>;

type InspectPointPorts = {
  readonly reverseGeocode: ReverseGeocode;
};

type InspectPointInputs = {
  readonly inspected: Observable<Coordinates>;
  readonly dismissed: Observable<void>;
};

type PostalAddress = {
  readonly houseNumber?: string;
  readonly street?: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
};

type InspectedSpot =
  | { readonly kind: 'none' }
  | { readonly kind: 'looking'; readonly spot: Coordinates }
  | { readonly kind: 'address'; readonly spot: Coordinates; readonly address: PostalAddress }
  | { readonly kind: 'no-address'; readonly spot: Coordinates }
  | { readonly kind: 'unavailable'; readonly spot: Coordinates };

const NONE: InspectedSpot = { kind: 'none' };

const inspectionOf =
  (spot: Coordinates) =>
  (found: SpotAddress): InspectedSpot =>
    found.kind === 'address' ? { kind: 'address', spot, address: found.address } : { kind: 'no-address', spot };

const inspect =
  ({ reverseGeocode }: InspectPointPorts) =>
  (spot: Coordinates): Observable<InspectedSpot> =>
    reverseGeocode(spot).pipe(
      take(1),
      map(inspectionOf(spot)),
      catchError(() => of<InspectedSpot>({ kind: 'unavailable', spot })),
      startWith<InspectedSpot>({ kind: 'looking', spot })
    );

const inspectPoint =
  (ports: InspectPointPorts) =>
  ({ inspected, dismissed }: InspectPointInputs): Observable<InspectedSpot> =>
    merge(inspected.pipe(map(inspect(ports))), dismissed.pipe(map(() => of(NONE)))).pipe(
      switchMap((inspection) => inspection),
      startWith(NONE),
      shareReplay({ bufferSize: 1, refCount: true })
    );

export { type Coordinates, type InspectedSpot, inspectPoint, type PostalAddress, type ReverseGeocode, type SpotAddress };
