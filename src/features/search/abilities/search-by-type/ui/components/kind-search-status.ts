import { m } from '#i18n/messages';
import type { KindSearch } from '../../domain/search-by-type';

const statusOf = (search: KindSearch): string => {
  if (search.status === 'searching') {
    return m.search_by_type_searching();
  }
  if (search.status === 'found') {
    return search.places.length === 1
      ? m.search_by_type_found_one()
      : m.search_by_type_found_many({ count: search.places.length });
  }
  if (search.status === 'none-near') {
    return m.search_by_type_none_near();
  }
  return search.status === 'unavailable' ? m.search_by_type_unavailable() : '';
};

export { statusOf };
