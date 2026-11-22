import { combineLatest, defaultIfEmpty, EMPTY, map, type Observable } from 'rxjs';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type MapView = {
  readonly center: Coordinates;
  readonly zoom: number;
};

type MapScene<Basemap> = {
  readonly basemap: Basemap;
  readonly view: MapView;
};

type LoadBasemap<Basemap> = () => Observable<Basemap>;

type ShowMapPorts<Basemap> = {
  readonly loadBasemap: LoadBasemap<Basemap>;
};

const PARIS: MapView = { center: { longitude: 2.3522, latitude: 48.8566 }, zoom: 13 };

const showMap =
  <Basemap>({ loadBasemap }: ShowMapPorts<Basemap>) =>
  (requestedView$: Observable<MapView> = EMPTY): Observable<MapScene<Basemap>> =>
    combineLatest([loadBasemap(), requestedView$.pipe(defaultIfEmpty(PARIS))]).pipe(
      map(([basemap, view]) => ({ basemap, view }))
    );

export { type Coordinates, type LoadBasemap, type MapScene, type MapView, showMap };
