import { photosByHand } from '../../fake-photos';
import { type FakePlace, isFakePlaceKind } from '../../fake-place';
import { streetViewByHand } from '../../fake-street-views';
import PHOTO_COUNTS from './landmark-photos.json' with { type: 'json' };
import STREET_VIEWS from './landmark-street-views.json' with { type: 'json' };
import TEXTS_IN_ENGLISH from './landmark-texts/en.json' with { type: 'json' };
import TEXTS_IN_FRENCH from './landmark-texts/fr.json' with { type: 'json' };
import LANDMARKS_FILE from './landmarks.json' with { type: 'json' };

type Landmark = (typeof LANDMARKS_FILE)[number];

type Texts = Readonly<Partial<Record<string, string>>>;

const TEXTS: readonly (readonly [language: string, texts: Texts])[] = [
  ['fr', TEXTS_IN_FRENCH],
  ['en', TEXTS_IN_ENGLISH]
];

const isOfKnownKind = (landmark: Landmark): landmark is Landmark & FakePlace => isFakePlaceKind(landmark.kind);

const textsOf = (id: string): Readonly<Record<string, string>> =>
  Object.fromEntries(
    TEXTS.flatMap(([language, texts]) => {
      const text = texts[id];
      return text === undefined ? [] : [[`description:${language}`, text]];
    })
  );

const told = (landmark: FakePlace): FakePlace => {
  const texts = textsOf(landmark.id);
  return Object.keys(texts).length === 0 ? landmark : { ...landmark, tags: { ...landmark.tags, ...texts } };
};

const PHOTOS: Readonly<Partial<Record<string, number>>> = PHOTO_COUNTS;

const photographed = (landmark: FakePlace): FakePlace => {
  const count = PHOTOS[landmark.id];
  return count === undefined ? landmark : { ...landmark, tags: { ...landmark.tags, ...photosByHand(landmark.kind, count) } };
};

const VIEWED: ReadonlySet<string> = new Set(STREET_VIEWS);

const streetViewed = (landmark: FakePlace): FakePlace =>
  VIEWED.has(landmark.id) ? { ...landmark, tags: { ...landmark.tags, ...streetViewByHand(landmark.id) } } : landmark;

const landmarks = (): readonly FakePlace[] =>
  LANDMARKS_FILE.filter(isOfKnownKind).map(told).map(photographed).map(streetViewed);

export { landmarks };
