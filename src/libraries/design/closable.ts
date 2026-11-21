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

const closedWhenAsked =
  <Element>(closings: Observable<unknown>, close: (element: Element) => void) =>
  (element: Element): (() => void) => {
    const subscription = closings.subscribe(() => close(element));
    return (): void => subscription.unsubscribe();
  };

export { type Closable, closedWhenAsked, NEVER_ASKED, toggleTold };
