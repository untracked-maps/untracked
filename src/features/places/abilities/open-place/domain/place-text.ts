import type { Tags } from './good-to-know';

type PlaceText = {
  readonly text: string;
  readonly long: boolean;
};

type Named = {
  readonly name: string;
  readonly tags?: Tags;
};

const LONGEST_SHORT_TEXT = 180;

const textOf = (tags: Tags | undefined, locale: string): PlaceText | undefined => {
  const text = tags?.[`description:${locale}`];
  return text === undefined ? undefined : { text, long: text.length > LONGEST_SHORT_TEXT };
};

const localNameOf = ({ name, tags }: Named): string | undefined => {
  const localName = tags?.['name'];
  return localName === name ? undefined : localName;
};

export { localNameOf, textOf };
