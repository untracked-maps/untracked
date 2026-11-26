import { from, type Observable } from 'rxjs';
import type { HoursReader, LoadHoursReader } from '../../domain/show-opening-hours';

const lazyOpeningHours: LoadHoursReader = (): Observable<HoursReader> => from(import('../../domain/opening-hours'));

export { lazyOpeningHours };
