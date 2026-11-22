import { m } from '#i18n/messages';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';

type ShownSpot = Exclude<InspectedSpot, { readonly kind: 'none' }>;

type SpotCard = {
  readonly title: string;
  readonly subtitle: string;
  readonly reportHref: string;
};

const DECIMALS = 5;

const NOTE_ZOOM = 19;

const coordinatesOf = ({ longitude, latitude }: Coordinates): string =>
  `${latitude.toFixed(DECIMALS)}, ${longitude.toFixed(DECIMALS)}`;

const noteHrefOf = ({ longitude, latitude }: Coordinates): string =>
  `https://www.openstreetmap.org/note/new#map=${NOTE_ZOOM}/${latitude.toFixed(DECIMALS)}/${longitude.toFixed(DECIMALS)}`;

const SEPARATOR = ', ';

type AddressLines = {
  readonly street: string;
  readonly locality: string;
};

const linesOf = (address: string): AddressLines => {
  const at = address.indexOf(SEPARATOR);
  return at < 0
    ? { street: address, locality: '' }
    : { street: address.slice(0, at), locality: address.slice(at + SEPARATOR.length) };
};

const UNADDRESSED_SUBTITLES: Readonly<Record<Exclude<ShownSpot['kind'], 'address'>, () => string>> = {
  looking: m.inspect_point_address,
  'no-address': m.inspect_point_address_not_found,
  unavailable: m.inspect_point_unavailable
};

const titleOf = (spot: ShownSpot): string => (spot.kind === 'address' ? linesOf(spot.address).street : m.inspect_point_spot());

const subtitleOf = (spot: ShownSpot): string =>
  spot.kind === 'address' ? linesOf(spot.address).locality || coordinatesOf(spot.spot) : UNADDRESSED_SUBTITLES[spot.kind]();

const spotCardOf = (spot: ShownSpot): SpotCard => ({
  title: titleOf(spot),
  subtitle: subtitleOf(spot),
  reportHref: noteHrefOf(spot.spot)
});

export { spotCardOf };
