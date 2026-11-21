import assert from 'node:assert/strict';
import { Given, Then, When, type World } from '@cucumber/cucumber';
import { EMPTY, type Observable, Subject } from 'rxjs';
import { type Closable, closeWhatIsOpen, type Report } from './domain/close-what-is-open';

type Press = { readonly press: 'Escape' | 'back' };

type Action = Report | Press;

type ClosingWorld = World & {
  actions?: readonly Action[];
};

type Visit = {
  readonly open: readonly Closable[];
  readonly entries: number;
  readonly left: boolean;
};

const ELEMENTS: Readonly<Record<string, Closable>> = {
  about: 'about',
  'map menu': 'map menu',
  spot: 'spot',
  'kind list': 'kind list',
  search: 'search'
};

const elementNamed = (name: string): Closable => {
  const element = ELEMENTS[name];
  assert.ok(element !== undefined, `"${name}" is not an element that closes`);
  return element;
};

const did = (world: ClosingWorld, action: Action): void => {
  world.actions = [...(world.actions ?? []), action];
};

type Browser = {
  readonly open: Set<Closable>;
  readonly entries: string[];
  readonly left: boolean[];
  readonly reports: Subject<Report>;
  readonly escapes: Subject<void>;
  readonly steps: Subject<void>;
};

const report =
  ({ open, reports }: Browser) =>
  (reported: Report): void => {
    open[reported.open ? 'add' : 'delete'](reported.element);
    reports.next(reported);
  };

const stepBack =
  ({ entries, steps }: Browser) =>
  (): Observable<never> => {
    entries.pop();
    steps.next();
    return EMPTY;
  };

const leave = ({ left }: Browser): void => {
  left.push(true);
};

const pressBack = (browser: Browser): void => {
  if (browser.entries.length > 0) {
    stepBack(browser)();
  } else {
    leave(browser);
  }
};

const act =
  (browser: Browser) =>
  (action: Action): void => {
    if ('element' in action) {
      report(browser)(action);
    } else if (action.press === 'Escape') {
      browser.escapes.next();
    } else {
      pressBack(browser);
    }
  };

const addEntry =
  ({ entries }: Browser) =>
  (): Observable<never> => {
    entries.push('added');
    return EMPTY;
  };

const visitOf = ({ actions = [] }: ClosingWorld): Visit => {
  const browser: Browser = {
    open: new Set(),
    entries: [],
    left: [],
    reports: new Subject(),
    escapes: new Subject(),
    steps: new Subject()
  };
  closeWhatIsOpen({ entry: { add: addEntry(browser), leave: stepBack(browser) } })(browser).subscribe((element) =>
    report(browser)({ element, open: false })
  );
  actions.map(act(browser));
  return { open: [...browser.open], entries: browser.entries.length, left: browser.left.length > 0 };
};

Given('the visitor has opened the {string}', function theVisitorHasOpened(this: ClosingWorld, name: string) {
  did(this, { element: elementNamed(name), open: true });
});

When('the visitor presses Escape', function theVisitorPressesEscape(this: ClosingWorld) {
  did(this, { press: 'Escape' });
});

When('the visitor presses the back button', function theVisitorPressesTheBackButton(this: ClosingWorld) {
  did(this, { press: 'back' });
});

When(
  'the visitor closes the {string} with its own button',
  function theVisitorClosesWithItsOwnButton(this: ClosingWorld, name: string) {
    did(this, { element: elementNamed(name), open: false });
  }
);

Then('the {string} is closed', function theElementIsClosed(this: ClosingWorld, name: string) {
  assert.equal(visitOf(this).open.includes(elementNamed(name)), false);
});

Then('the {string} is still open', function theElementIsStillOpen(this: ClosingWorld, name: string) {
  assert.equal(visitOf(this).open.includes(elementNamed(name)), true);
});

Then('the visitor is still in the app', function theVisitorIsStillInTheApp(this: ClosingWorld) {
  assert.equal(visitOf(this).left, false);
});

Then('the visitor has left the app', function theVisitorHasLeftTheApp(this: ClosingWorld) {
  assert.equal(visitOf(this).left, true);
});

Then('the app has added {int} entry to the history', function theAppHasAddedEntries(this: ClosingWorld, count: number) {
  assert.equal(visitOf(this).entries, count);
});
