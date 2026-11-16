import { PLACE_KINDS, type PlaceKind } from '../../../domain/place';
import { normalised, wordsIn } from '../../../domain/text';
import KIND_WORDS from './kind-words.json' with { type: 'json' };

type FindKind = (query: string) => PlaceKind | undefined;

const PHRASES: Readonly<Record<PlaceKind, readonly string[]>> = KIND_WORDS.kinds;

const FILLERS: ReadonlySet<string> = new Set(KIND_WORDS.fillers.map(normalised));

const isMeaningful = (word: string): boolean => !FILLERS.has(word);

const keyOf = (text: string): string => wordsIn(normalised(text)).filter(isMeaningful).join(' ');

const KINDS_BY_KEY: ReadonlyMap<string, PlaceKind> = new Map(
  PLACE_KINDS.flatMap((kind) => PHRASES[kind].map((phrase): readonly [string, PlaceKind] => [keyOf(phrase), kind]))
);

const kindNamedIn: FindKind = (query) => KINDS_BY_KEY.get(keyOf(query));

export { type FindKind, kindNamedIn };
