import { from, map, type Observable } from 'rxjs';
import type { Place } from '../../../../domain/place';
import type { FindPlaces, IndexPlaces } from '../../domain/search-places';

const miniSearchIndex: IndexPlaces = (places: readonly Place[]): Observable<FindPlaces> =>
  from(import('./searchable-index')).pipe(map(({ searchableIndexOf }) => searchableIndexOf(places)));

export { miniSearchIndex };
