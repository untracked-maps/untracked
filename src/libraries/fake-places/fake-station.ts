import type { FakePlace } from './fake-place';

type FakeTags = Readonly<Record<string, string>>;

type FakeLine = {
  readonly id: string;
  readonly tags: FakeTags;
  readonly directions: readonly string[];
};

type FakeExit = {
  readonly coordinates: FakePlace['coordinates'];
  readonly tags: FakeTags;
};

type FakeStation = {
  readonly id: string;
  readonly lines: readonly FakeLine[];
  readonly exits: readonly FakeExit[];
};

export type { FakeLine, FakeStation };
