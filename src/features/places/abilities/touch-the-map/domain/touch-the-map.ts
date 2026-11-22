import { map, type Observable, startWith, withLatestFrom } from 'rxjs';

type Coordinates = {
  readonly longitude: number;
  readonly latitude: number;
};

type Press = 'touch' | 'long press';

type Touch = {
  readonly press: Press;
  readonly spot: Coordinates;
  readonly place?: string | undefined;
};

type TouchOutcome =
  | { readonly kind: 'open place'; readonly id: string }
  | { readonly kind: 'inspect spot'; readonly spot: Coordinates }
  | { readonly kind: 'close sheet' };

type TouchTheMapInputs = {
  readonly touched: Observable<Touch>;
  readonly sheetOpen: Observable<boolean>;
};

const outcomeOf = ([{ press, spot, place }, sheetOpen]: readonly [Touch, boolean]): TouchOutcome => {
  if (place !== undefined) {
    return { kind: 'open place', id: place };
  }
  return press === 'touch' && sheetOpen ? { kind: 'close sheet' } : { kind: 'inspect spot', spot };
};

const touchTheMap = ({ touched, sheetOpen }: TouchTheMapInputs): Observable<TouchOutcome> =>
  touched.pipe(withLatestFrom(sheetOpen.pipe(startWith(false))), map(outcomeOf));

export { type Coordinates, type Press, type Touch, type TouchOutcome, touchTheMap };
