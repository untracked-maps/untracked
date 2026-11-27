import { NEVER, type Observable } from 'rxjs';

type Closable = {
  readonly onToggle: (open: boolean) => void;
  readonly closings: Observable<unknown>;
};

const NEVER_ASKED: Closable = { onToggle: () => undefined, closings: NEVER };

const toggleTold =
  ({ onToggle }: Closable) =>
  ({ newState }: Pick<ToggleEvent, 'newState'>): void =>
    onToggle(newState === 'open');

const followed =
  <Element, Value>(values: Observable<Value>, act: (element: Element, value: Value) => void) =>
  (element: Element): (() => void) => {
    const subscription = values.subscribe((value) => act(element, value));
    return (): void => subscription.unsubscribe();
  };

const closedWhenAsked = <Element>(
  closings: Observable<unknown>,
  close: (element: Element) => void
): ((element: Element) => () => void) => followed(closings, (element: Element) => close(element));

export { type Closable, closedWhenAsked, followed, NEVER_ASKED, toggleTold };
