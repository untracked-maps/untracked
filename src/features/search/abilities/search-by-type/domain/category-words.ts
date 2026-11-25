import { normalised, wordsIn } from '../../../domain/text';
import { CATEGORY_KEYS, type CategoryKey } from './categories';
import CATEGORY_WORDS from './category-words.json' with { type: 'json' };

type FindCategory = (query: string) => CategoryKey | undefined;

type Vocabulary = {
  readonly category: CategoryKey;
  readonly words: ReadonlySet<string>;
};

const PHRASES: Readonly<Record<CategoryKey, readonly string[]>> = CATEGORY_WORDS.categories;

const FILLERS: ReadonlySet<string> = new Set(CATEGORY_WORDS.fillers.map(normalised));

const isMeaningful = (word: string): boolean => !FILLERS.has(word);

const wordsOf = (text: string): readonly string[] => wordsIn(normalised(text));

const VOCABULARIES: readonly Vocabulary[] = CATEGORY_KEYS.map((category) => ({
  category,
  words: new Set(PHRASES[category].flatMap(wordsOf).filter(isMeaningful))
}));

const isNamedIn =
  (typed: readonly string[]) =>
  ({ words }: Vocabulary): boolean =>
    typed.some((word) => words.has(word)) && typed.every((word) => words.has(word) || FILLERS.has(word));

const categoryNamedIn: FindCategory = (query) => VOCABULARIES.find(isNamedIn(wordsOf(query)))?.category;

export { categoryNamedIn, type FindCategory };
