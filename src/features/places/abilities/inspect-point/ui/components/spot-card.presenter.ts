import { m } from '#i18n/messages';
import type { AddressLine } from '#libraries/postal-address/address-line.presenter';
import type { Coordinates, InspectedSpot } from '../../domain/inspect-point';

type ShownSpot = Exclude<InspectedSpot, { readonly kind: 'none' }>;

type SpotCard = {
  readonly title: string;
  readonly subtitle: string;
  readonly address: string | undefined;
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

const addressesOf = (spot: ShownSpot, line: AddressLine | undefined): readonly string[] =>
  spot.kind === 'address' && line !== undefined ? [line(spot.address)] : [];

const unaddressed = (spot: ShownSpot): Pick<SpotCard, 'title' | 'subtitle'> => ({
  title: m.inspect_point_spot(),
  subtitle: spot.kind === 'address' ? m.inspect_point_address() : UNADDRESSED_SUBTITLES[spot.kind]()
});

const addressed = (spot: ShownSpot, address: string): Pick<SpotCard, 'title' | 'subtitle'> => {
  const { street, locality } = linesOf(address);
  return { title: street, subtitle: locality || coordinatesOf(spot.spot) };
};

const spotCardOf = (spot: ShownSpot, line: AddressLine | undefined): SpotCard => {
  const address = addressesOf(spot, line).at(0);
  return {
    ...(address === undefined ? unaddressed(spot) : addressed(spot, address)),
    address,
    reportHref: noteHrefOf(spot.spot)
  };
};

export { spotCardOf };
