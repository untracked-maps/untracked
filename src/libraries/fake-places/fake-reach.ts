import type { Faker } from '@faker-js/faker';
import type { FakePlace } from './fake-place';

type FakeReach = Pick<FakePlace, 'phone' | 'website' | 'menu' | 'instagram' | 'facebook'>;

const SHARES = { phone: 0.6, website: 0.35, menu: 0.4, instagram: 0.2, facebook: 0.15 };

const EATING: ReadonlySet<FakePlace['kind']> = new Set(['restaurant', 'cafe', 'bar']);

const PAIR = 99;

const MARKS = /\p{M}/gu;

const WORD = /[a-z0-9]+/gu;

const twoDigits = (faker: Faker): string => String(faker.number.int({ max: PAIR })).padStart(2, '0');

const wordsOf = (name: string): readonly string[] =>
  Array.from(name.normalize('NFD').replaceAll(MARKS, '').toLowerCase().matchAll(WORD), ([word]) => word);

const capitalised = (word: string): string => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

const given = <Value>(faker: Faker, share: number, value: () => Value): Value | undefined =>
  faker.datatype.boolean({ probability: share }) ? value() : undefined;

const siteOf = (faker: Faker, words: readonly string[]): string =>
  `https://${faker.datatype.boolean() ? 'www.' : ''}${words.join('-')}.example`;

const fakeReach = (faker: Faker, { name, kind }: Pick<FakePlace, 'name' | 'kind'>): FakeReach => {
  const words = wordsOf(name);
  const phone = given(faker, SHARES.phone, () => `+33 1 99 00 ${twoDigits(faker)} ${twoDigits(faker)}`);
  const website = given(faker, SHARES.website, () => siteOf(faker, words));
  const menu = EATING.has(kind) ? given(faker, SHARES.menu, () => `${siteOf(faker, words)}/menu`) : undefined;
  const instagram = given(faker, SHARES.instagram, () => `https://instagram.example/${words.join('')}`);
  const facebook = given(faker, SHARES.facebook, () => `https://facebook.example/${words.map(capitalised).join('')}`);
  return Object.fromEntries(
    Object.entries({ phone, website, menu, instagram, facebook }).filter(([, value]) => value !== undefined)
  );
};

export { fakeReach };
