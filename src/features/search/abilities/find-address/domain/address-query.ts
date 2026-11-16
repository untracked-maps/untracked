import { normalised, wordsIn } from '../../../domain/text';
import { isSignificant } from '../../../domain/words';
import STREET_WORDS from './street-words.json' with { type: 'json' };

type AddressIntent = 'address' | 'street' | 'none';

type AddressQuery = {
  readonly intent: AddressIntent;
  readonly number: string | undefined;
  readonly postcode: string | undefined;
  readonly words: readonly string[];
};

const HOUSE_NUMBER = /^\d{1,4}(?:bis|ter)?$/u;

const NUMBER_SUFFIXES: ReadonlySet<string> = new Set(['bis', 'ter']);

const POSTCODE = /^\d{5}$/u;

const DIGIT = /\d/u;

const ABBREVIATIONS: ReadonlyMap<string, string> = new Map(
  Object.entries(STREET_WORDS.abbreviations).map(([short, word]): readonly [string, string] => [short, normalised(word)])
);

const STREET_KINDS: ReadonlySet<string> = new Set(STREET_WORDS.kinds.map(normalised));

const isPostcode = (token: string): boolean => POSTCODE.test(token);

const numberTokensIn = (tokens: readonly string[]): readonly string[] =>
  HOUSE_NUMBER.test(String(tokens[0])) ? tokens.slice(0, NUMBER_SUFFIXES.has(String(tokens[1])) ? 2 : 1) : [];

const expanded = (word: string): string => ABBREVIATIONS.get(word) ?? word;

const intentOf = (query: string, words: readonly string[]): AddressIntent => {
  if (DIGIT.test(query)) {
    return 'address';
  }
  return words.some((word) => STREET_KINDS.has(word)) ? 'street' : 'none';
};

const addressQueryOf = (query: string): AddressQuery => {
  const tokens = wordsIn(normalised(query));
  const numberTokens = numberTokensIn(tokens);
  const rest = tokens.slice(numberTokens.length);
  const words = rest
    .filter((token) => !isPostcode(token))
    .map(expanded)
    .filter(isSignificant);
  return {
    intent: intentOf(query, words),
    number: numberTokens.length === 0 ? undefined : numberTokens.join(''),
    postcode: rest.find(isPostcode),
    words
  };
};

export { type AddressIntent, type AddressQuery, addressQueryOf };
