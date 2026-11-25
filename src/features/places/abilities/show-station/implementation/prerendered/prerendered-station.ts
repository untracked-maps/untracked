import { defer, type Observable } from 'rxjs';
import type { LoadStation, Station } from '../../domain/show-station';
import { type FetchFile, stationFile } from './station-file';

const prerenderedStation =
  (fetchFile: FetchFile, urlOf: (id: string) => string): LoadStation =>
  (id: string): Observable<Station> =>
    defer(() => stationFile(fetchFile, urlOf(id), id));

export { prerenderedStation };
