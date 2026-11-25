import { from, map, type Observable } from 'rxjs';
import type { FindCategory } from '../../domain/category-words';
import type { LoadCategoryFinder } from '../../domain/named-category';

const lazyCategoryWords: LoadCategoryFinder = (): Observable<FindCategory> =>
  from(import('../../domain/category-words')).pipe(map(({ categoryNamedIn }) => categoryNamedIn));

export { lazyCategoryWords };
