import { normalised, wordsIn } from '../../../domain/text';

const ELISION = /\b(?<letter>[a-z]) (?=[a-z0-9])/gu;

const STOP_WORDS: ReadonlySet<string> = new Set([
  'a',
  'and',
  'au',
  'aux',
  'd',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
  'of',
  'paris',
  'sure',
  'the'
]);

const isSignificant = (word: string): boolean => !STOP_WORDS.has(word);

const significantWordsOf = (text: string): readonly string[] => wordsIn(normalised(text)).filter(isSignificant);

const queryWordsOf = (query: string): readonly string[] => {
  const significant = significantWordsOf(query);
  return significant.length > 0 ? significant : wordsIn(normalised(query));
};

const significantWordCountOf = (name: string): number => Math.max(1, significantWordsOf(name).length);

const indexedWordsOf = (name: string): readonly string[] => {
  const words = normalised(name);
  return [...new Set([...wordsIn(words), ...wordsIn(words.replace(ELISION, '$<letter>'))])];
};

export { indexedWordsOf, queryWordsOf, significantWordCountOf };
