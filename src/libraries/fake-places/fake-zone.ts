import type { LocaleDefinition } from '@faker-js/faker';
import type { FakePlace } from './fake-place';

type FakeCoordinates = FakePlace['coordinates'];

type FakeDistrictOfZone = {
  readonly name: string;
  readonly postcode: string;
  readonly coordinates: FakeCoordinates;
};

type FakeZone = {
  readonly id: string;
  readonly city: string;
  readonly locale: readonly LocaleDefinition[];
  readonly bounds: {
    readonly west: number;
    readonly south: number;
    readonly east: number;
    readonly north: number;
  };
  readonly postcodes: readonly string[];
  readonly landmarks: readonly FakePlace[];
  readonly districts: readonly FakeDistrictOfZone[];
};

export type { FakeDistrictOfZone, FakeZone };
