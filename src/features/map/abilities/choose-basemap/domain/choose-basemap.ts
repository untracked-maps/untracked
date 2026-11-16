import { distinctUntilChanged, type Observable, of, switchMap } from 'rxjs';

type Basemap = 'plan' | 'satellite';

type ChosenBasemap = () => Observable<Basemap>;

type LoadSatelliteImagery<Imagery> = () => Observable<Imagery>;

type ChooseBasemapPorts<Imagery> = {
  readonly chosenBasemap: ChosenBasemap;
  readonly loadSatelliteImagery: LoadSatelliteImagery<Imagery>;
};

const BASEMAPS: readonly [Basemap, ...Basemap[]] = ['plan', 'satellite'];

const chooseBasemap =
  <Imagery>({ chosenBasemap, loadSatelliteImagery }: ChooseBasemapPorts<Imagery>) =>
  (): Observable<Imagery | undefined> =>
    chosenBasemap().pipe(
      distinctUntilChanged(),
      switchMap((basemap) => (basemap === 'satellite' ? loadSatelliteImagery() : of(undefined)))
    );

export { BASEMAPS, type Basemap, chooseBasemap, type LoadSatelliteImagery };
