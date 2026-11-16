import { combineLatest, distinctUntilChanged, map, type Observable } from 'rxjs';

type ShownBikeLanes = () => Observable<boolean>;

type ShowBikeLanesPorts = {
  readonly shownBikeLanes: ShownBikeLanes;
};

const showBikeLanes =
  ({ shownBikeLanes }: ShowBikeLanesPorts) =>
  <Palette>(palette$: Observable<Palette>): Observable<Palette | undefined> =>
    combineLatest([shownBikeLanes(), palette$]).pipe(
      map(([shown, palette]) => (shown ? palette : undefined)),
      distinctUntilChanged()
    );

export { showBikeLanes };
