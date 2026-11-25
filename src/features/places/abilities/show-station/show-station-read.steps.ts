import assert from 'node:assert/strict';
import { Then, type World } from '@cucumber/cucumber';
import type { LineDepartures, Told } from './domain/next-departures';
import type { StationView } from './domain/show-station';
import type { StationExit } from './domain/station-exits';

type ReadWorld = World & {
  asked: number;
  view: StationView;
};

const CLOCK_START = 11;

const CLOCK_END = 19;

const exitText = ({ ref, name, access }: StationExit): string =>
  [[ref, name].filter((part) => part !== undefined).join(' '), access].filter((part) => part !== undefined).join(', ');

const linesOf = ({ view }: ReadWorld): readonly LineDepartures[] =>
  view.status === 'open' && view.departures.status === 'known' ? view.departures.lines : [];

const toldOf = (told: Told): string => {
  if (told.told === 'at platform') {
    return 'at platform';
  }
  return told.told === 'minutes' ? `${told.minutes} min` : `at ${told.at.slice(CLOCK_START, CLOCK_END)}`;
};

Then('the departures read {string}', function theDeparturesRead(this: ReadWorld, expected: string) {
  assert.equal(
    linesOf(this)
      .map(({ ref, destination, times }) => `${ref} ${destination}: ${times.map(toldOf).join(', ')}`)
      .join('; '),
    expected
  );
});

Then('no departure is planned', function noDepartureIsPlanned(this: ReadWorld) {
  assert.deepEqual(this.view, { ...this.view, departures: { status: 'known', lines: [] } });
});

Then('{int} lines of departures are shown', function linesOfDeparturesAreShown(this: ReadWorld, count: number) {
  assert.equal(linesOf(this).length, count);
});

Then('the lines in real time are {string}', function theLinesInRealTime(this: ReadWorld, expected: string) {
  assert.equal(
    linesOf(this)
      .filter(({ live }) => live)
      .map(({ ref, destination }) => `${ref} ${destination}`)
      .join('; '),
    expected
  );
});

Then(
  'the line {string} is shown in {word} on {word}',
  function theLineIsShownIn(this: ReadWorld, ref: string, text: string, colour: string) {
    const line = linesOf(this).find((shown) => shown.ref === ref);
    assert.equal(`${line?.textColour} on ${line?.colour}`, `${text.toLowerCase()} on ${colour}`);
  }
);

Then('the exits read {string}', function theExitsRead(this: ReadWorld, expected: string) {
  assert.equal(this.view.status === 'open' ? this.view.exits.map(exitText).join('; ') : '', expected);
});

Then(/^the departures were asked (?<count>\d+) times?$/u, function theDeparturesWereAsked(this: ReadWorld, count: string) {
  assert.equal(this.asked, Number(count));
});

Then('no station is shown', function noStationIsShown(this: ReadWorld) {
  assert.deepEqual(this.view, { status: 'none' });
});

Then('the departures are unavailable', function theDeparturesAreUnavailable(this: ReadWorld) {
  assert.equal(this.view.status === 'open' ? this.view.departures.status : 'none', 'unavailable');
});
