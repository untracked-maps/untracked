import { combineLatest, map, type Observable, Subject } from 'rxjs';
import {
  type Coordinates,
  type InspectedSpot,
  inspectPoint,
  type LocatedSpot
} from '#features/places/abilities/inspect-point/domain/inspect-point';
import { nearestAddress } from '#features/places/abilities/inspect-point/implementation/prerendered/nearest-address';
import { prerenderedAddresses } from '#features/places/abilities/inspect-point/implementation/prerendered/prerendered-addresses';
import type { PlaceSheet } from '#features/places/abilities/open-place/domain/open-place';
import type { RecentPlace } from '#features/search/abilities/recent-searches/domain/recent-searches';
import type { Districts } from './districts';

type FetchFile = (url: string) => Promise<Response>;

type Places = {
  readonly sheet: Observable<PlaceSheet>;
  readonly close: () => void;
};

type Spots = {
  readonly spot: Observable<InspectedSpot>;
  readonly sheetOpen: Observable<boolean>;
  readonly inspect: (spot: Coordinates) => void;
  readonly locate: (located: LocatedSpot) => void;
  readonly dismiss: () => void;
  readonly closeSheets: () => void;
};

type Sheets = {
  readonly places: Places;
  readonly districts: Pick<Districts, 'sheet' | 'close'>;
  readonly dismissed: Subject<void>;
};

const anySheetOpen = ({ places, districts }: Sheets, spot: Observable<InspectedSpot>): Observable<boolean> =>
  combineLatest([places.sheet, spot, districts.sheet]).pipe(
    map(([place, { kind }, district]) => place.status !== 'closed' || kind !== 'none' || district.status !== 'closed')
  );

const afterClosing =
  <Value>(closeOthers: () => void, opened: Subject<Value>) =>
  (value: Value): void => {
    closeOthers();
    opened.next(value);
  };

const spotsInspected = (sheets: Sheets, fetchFile: FetchFile, addressesUrl: string): Spots => {
  const { places, districts, dismissed } = sheets;
  const inspected = new Subject<Coordinates>();
  const located = new Subject<LocatedSpot>();
  const reverseGeocode = nearestAddress(prerenderedAddresses(fetchFile, addressesUrl));
  const spot = inspectPoint({ reverseGeocode })({ inspected, located, dismissed });
  const closeOthers = (): void => {
    places.close();
    districts.close();
  };
  return {
    spot,
    sheetOpen: anySheetOpen(sheets, spot),
    inspect: afterClosing(closeOthers, inspected),
    locate: afterClosing(closeOthers, located),
    dismiss: () => dismissed.next(),
    closeSheets: (): void => {
      closeOthers();
      dismissed.next();
    }
  };
};

type Chosen = (place: RecentPlace, from: 'search' | 'kind list') => void;

const STREET_KINDS: ReadonlySet<string> = new Set(['address', 'street']);

type Openings = {
  readonly places: Places & {
    readonly open: (opening: { readonly id: string; readonly from: 'search' | 'kind list' }) => void;
  };
  readonly districts: Pick<Districts, 'open'>;
  readonly spots: Spots;
};

const districtOpened = ({ places, districts, spots }: Openings, { name, address, coordinates }: RecentPlace): void => {
  places.close();
  spots.dismiss();
  districts.open({ name, postalCode: address.postalCode, addressLocality: address.addressLocality, coordinates });
};

const chosenOpened =
  (openings: Openings): Chosen =>
  (place, from): void => {
    if (STREET_KINDS.has(place.kind)) {
      openings.spots.locate({ spot: place.coordinates, address: place.address });
    } else if (place.kind === 'district') {
      districtOpened(openings, place);
    } else {
      openings.places.open({ id: place.id, from });
    }
  };

export { type Chosen, chosenOpened, type Spots, spotsInspected };
