type Fields = Readonly<Record<string, unknown>>;

type FileTags = Readonly<Partial<Record<string, string>>>;

type FileLine = {
  readonly id: string;
  readonly tags: FileTags;
  readonly directions: readonly string[];
};

type FileExit = {
  readonly coordinates: { readonly longitude: number; readonly latitude: number };
  readonly tags: FileTags;
};

type StationFile = {
  readonly id: string;
  readonly lines: readonly FileLine[];
  readonly exits: readonly FileExit[];
};

type FetchFile = (url: string) => Promise<Response>;

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null;

const listOf = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

const tagsOf = (value: unknown): FileTags =>
  isFields(value)
    ? Object.fromEntries(Object.entries(value).filter((tag): tag is [string, string] => typeof tag[1] === 'string'))
    : {};

const lineOf = (value: unknown): readonly FileLine[] =>
  isFields(value) && typeof value['id'] === 'string'
    ? [
        {
          id: value['id'],
          tags: tagsOf(value['tags']),
          directions: listOf(value['directions']).filter((direction) => typeof direction === 'string')
        }
      ]
    : [];

const exitOf = (value: unknown): readonly FileExit[] => {
  const coordinates = isFields(value) ? value['coordinates'] : undefined;
  return isFields(value) &&
    isFields(coordinates) &&
    typeof coordinates['longitude'] === 'number' &&
    typeof coordinates['latitude'] === 'number'
    ? [
        {
          coordinates: { longitude: coordinates['longitude'], latitude: coordinates['latitude'] },
          tags: tagsOf(value['tags'])
        }
      ]
    : [];
};

const stationIn = (id: string, file: unknown): StationFile => ({
  id,
  lines: listOf(isFields(file) ? file['lines'] : undefined).flatMap(lineOf),
  exits: listOf(isFields(file) ? file['exits'] : undefined).flatMap(exitOf)
});

const stationFile = async (fetchFile: FetchFile, url: string, id: string): Promise<StationFile> => {
  const response = await fetchFile(url);
  if (!response.ok) {
    throw new Error(`The station file answered ${response.status}.`);
  }
  return stationIn(id, await response.json());
};

export { type FetchFile, type FileLine, stationFile };
