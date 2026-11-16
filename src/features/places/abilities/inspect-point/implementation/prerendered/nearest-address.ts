import { map, type Observable, shareReplay } from 'rxjs';
import type { Coordinates, ReverseGeocode, SpotAddress } from '../../domain/inspect-point';
import type { KnownAddress, LoadAddresses } from './prerendered-addresses';

type Nearest = {
  readonly address: string;
  readonly metres: number;
};

const FARTHEST_ADDRESS_METRES = 200;

const METRES_PER_DEGREE = 111_320;

const DEGREES_PER_HALF_TURN = 180;

const RADIANS_PER_DEGREE = Math.PI / DEGREES_PER_HALF_TURN;

const NO_ADDRESS: SpotAddress = { kind: 'no-address' };

const metresBetween = (from: Coordinates, to: Coordinates): number =>
  METRES_PER_DEGREE *
  Math.hypot((to.longitude - from.longitude) * Math.cos(from.latitude * RADIANS_PER_DEGREE), to.latitude - from.latitude);

const nearerOf =
  (spot: Coordinates) =>
  (nearest: Nearest | undefined, { address, coordinates }: KnownAddress): Nearest => {
    const metres = metresBetween(spot, coordinates);
    return nearest === undefined || metres < nearest.metres ? { address, metres } : nearest;
  };

const addressNear =
  (spot: Coordinates) =>
  (addresses: readonly KnownAddress[]): SpotAddress => {
    const nearest = addresses.reduce<Nearest | undefined>(nearerOf(spot), undefined);
    return nearest !== undefined && nearest.metres <= FARTHEST_ADDRESS_METRES
      ? { kind: 'address', address: nearest.address }
      : NO_ADDRESS;
  };

const nearestAddress = (loadAddresses: LoadAddresses): ReverseGeocode => {
  const addresses$: Observable<readonly KnownAddress[]> = loadAddresses().pipe(shareReplay(1));
  return (spot: Coordinates): Observable<SpotAddress> => addresses$.pipe(map(addressNear(spot)));
};

export { nearestAddress };
