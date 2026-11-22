import { filter, map, type Observable } from 'rxjs';
import { type Found, isAddress } from '../../../domain/found';
import type { Coordinates } from '../../../domain/place';

type Chosen = Pick<Found, 'kind' | 'coordinates'>;

const isDistrict = ({ kind }: Chosen): boolean => kind === 'district';

const addressesChosenAt = (chosen$: Observable<Chosen>): Observable<Coordinates> =>
  chosen$.pipe(
    filter((chosen) => isAddress(chosen) && !isDistrict(chosen)),
    map(({ coordinates }) => coordinates)
  );

const districtsChosenAt = (chosen$: Observable<Chosen>): Observable<Coordinates> =>
  chosen$.pipe(
    filter(isDistrict),
    map(({ coordinates }) => coordinates)
  );

export { addressesChosenAt, districtsChosenAt };
