import { map, merge, type Observable, scan, startWith } from 'rxjs';
import type { Found } from '../../../../domain/found';
import type { SearchState } from '../../domain/search-places';

type Combobox = {
  readonly text: string;
  readonly open: boolean;
  readonly active: number;
  readonly state: SearchState;
};

type ComboboxEvent =
  | { readonly kind: 'opened' }
  | { readonly kind: 'typed'; readonly text: string }
  | { readonly kind: 'moved'; readonly step: 1 | -1 }
  | { readonly kind: 'chosen'; readonly text: string }
  | { readonly kind: 'closed' };

type SearchPanel = {
  readonly settle: (text: string) => void;
  readonly focusField: () => void;
};

type Searched = { readonly kind: 'searched'; readonly state: SearchState };

const NO_OPTION = -1;

const OPEN: ComboboxEvent = { kind: 'opened' };

const CLOSE: ComboboxEvent = { kind: 'closed' };

const CLOSED: Combobox = { text: '', open: false, active: NO_OPTION, state: { kind: 'idle' } };

const optionsOf = ({ state }: Combobox): readonly Found[] => (state.kind === 'found' ? state.places : []);

const offersSuggestions = ({ open, state }: Combobox): boolean => open && state.kind === 'idle';

const isExpanded = (combobox: Combobox): boolean => combobox.open && optionsOf(combobox).length > 0;

const activePlaceOf = (combobox: Combobox): Found | undefined =>
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
  if (event.kind === 'opened') {
    return { ...combobox, open: true };
  }
  const text = event.kind === 'chosen' ? event.text : combobox.text;
  return { ...combobox, text, open: false, active: NO_OPTION };
};

const searched = (state: SearchState): Searched => ({ kind: 'searched', state });

const comboboxOf = (state$: Observable<SearchState>, event$: Observable<ComboboxEvent>): Observable<Combobox> =>
  merge(state$.pipe(map(searched)), event$).pipe(scan(next, CLOSED), startWith(CLOSED));

export {
  activePlaceOf,
  CLOSE,
  type Combobox,
  type ComboboxEvent,
  comboboxOf,
  isExpanded,
  OPEN,
  offersSuggestions,
  optionsOf,
  type SearchPanel
};
