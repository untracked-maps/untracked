import { m } from '#i18n/messages';
import type { SearchState } from '../../domain/search-places';
import type { Combobox } from './combobox.presenter';

const foundMessageOf = (count: number): string =>
  count === 1 ? m.search_places_found_one() : m.search_places_found_many({ count });

const messageOf = (state: SearchState): string => {
  if (state.kind === 'searching') {
    return m.search_places_searching();
  }
  if (state.kind === 'found') {
    return foundMessageOf(state.places.length);
  }
  if (state.kind === 'not-found') {
    return m.search_places_not_found({ query: state.query });
  }
  return state.kind === 'unavailable' ? m.search_places_unavailable() : '';
};

const statusOf = ({ open, state }: Combobox): string => (open ? messageOf(state) : '');

export { statusOf };
