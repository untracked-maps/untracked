import { defer, map, type Observable } from 'rxjs';
import type { LoadSatelliteImagery } from '../../domain/choose-basemap';
import type { Orthophotos } from './orthophotos';

const ignOrthophotos: LoadSatelliteImagery<Orthophotos> = (): Observable<Orthophotos> =>
  defer(() => import('./orthophotos')).pipe(map((module) => module.orthophotos));

export { ignOrthophotos };
