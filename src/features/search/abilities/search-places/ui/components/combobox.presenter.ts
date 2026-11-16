import { map, merge, type Observable, scan, startWith } from 'rxjs';
import type { Place } from '../../domain/place';
import type { SearchState } from '../../domain/search-places';

type Combobox = {
  readonly text: string;
  readonly open: boolean;
  readonly active: number;
  readonly state: SearchState;
};

type ComboboxEvent =
  | { readonly kind: 'typed'; readonly text: string }
  | { readonly kind: 'moved'; readonly step: 1 | -1 }
  | { readonly kind: 'chosen'; readonly place: Place }
  | { readonly kind: 'closed' };

type Searched = { readonly kind: 'searched'; readonly state: SearchState };

const NO_OPTION = -1;

const CLOSE: ComboboxEvent = { kind: 'closed' };

const CLOSED: Combobox = { text: '', open: false, active: NO_OPTION, state: { kind: 'idle' } };

const optionsOf = ({ state }: Combobox): readonly Place[] => (state.kind === 'found' ? state.places : []);

const isExpanded = (combobox: Combobox): boolean => combobox.open && optionsOf(combobox).length > 0;

const activePlaceOf = (combobox: Combobox): Place | undefined =>
  isExpanded(combobox) ? optionsOf(combobox)[combobox.active] : undefined;

const firstFor = (step: 1 | -1, count: number): number => (step === 1 ? 0 : count - 1);

const moved = (combobox: Combobox, step: 1 | -1): Combobox => {
  const count = optionsOf(combobox).length;
  if (count === 0) {
    return combobox;
  }
  const active =
    isExpanded(combobox) && combobox.active !== NO_OPTION ? (combobox.active + step + count) % count : firstFor(step, count);
  return { ...combobox, open: true, active };
};

const next = (combobox: Combobox, event: ComboboxEvent | Searched): Combobox => {
  if (event.kind === 'searched') {
    return { ...combobox, state: event.state, active: NO_OPTION };
  }
  if (event.kind === 'typed') {
    return { ...combobox, text: event.text, open: true, active: NO_OPTION };
  }
  if (event.kind === 'moved') {
    return moved(combobox, event.step);
  }
  const text = event.kind === 'chosen' ? event.place.name : combobox.text;
  return { ...combobox, text, open: false, active: NO_OPTION };
};

const searched = (state: SearchState): Searched => ({ kind: 'searched', state });

const comboboxOf = (state$: Observable<SearchState>, event$: Observable<ComboboxEvent>): Observable<Combobox> =>
  merge(state$.pipe(map(searched)), event$).pipe(scan(next, CLOSED), startWith(CLOSED));

export { activePlaceOf, CLOSE, type Combobox, type ComboboxEvent, comboboxOf, isExpanded, optionsOf };
