import { map, type Observable } from 'rxjs';
import { type Area, coveredOnly } from '#features/places/domain/coverage';

type CoveredPlaces = {
  readonly fetchPlaces: () => Promise<Response>;
  readonly areas: readonly Area[];
};

const coveredLoad =
  <Place extends { readonly coordinates: { readonly longitude: number; readonly latitude: number } }>(
    areas: readonly Area[],
    loadPlaces: () => Observable<readonly Place[]>
  ) =>
  (): Observable<readonly Place[]> =>
    loadPlaces().pipe(map(coveredOnly(areas)));

export { type CoveredPlaces, coveredLoad };
