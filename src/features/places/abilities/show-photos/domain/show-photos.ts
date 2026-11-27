import { distinctUntilChanged, map, type Observable, shareReplay, startWith } from 'rxjs';

type Tags = Readonly<Partial<Record<string, string>>>;

type PhotoPlace = {
  readonly id: string;
  readonly tags?: Tags;
};

type Photos = readonly string[];

type ShowPhotosInputs = {
  readonly opened: Observable<PhotoPlace | undefined>;
};

const SITE_PATH = /^[a-z0-9-]+(?:\/[a-z0-9-]+(?:\.[a-z0-9]+)*)+$/u;

const NONE: Photos = [];

const isOfTheSite = (path: string): boolean => SITE_PATH.test(path);

const photosOf = (place: PhotoPlace | undefined): Photos => [
  ...new Set(
    (place?.tags?.['image'] ?? '')
      .split(';')
      .map((path) => path.trim())
      .filter(isOfTheSite)
  )
];

const samePhotos = (previous: Photos, next: Photos): boolean => previous.join(';') === next.join(';');

const showPhotos = ({ opened }: ShowPhotosInputs): Observable<Photos> =>
  opened.pipe(map(photosOf), startWith(NONE), distinctUntilChanged(samePhotos), shareReplay({ bufferSize: 1, refCount: true }));

export { type Photos, showPhotos };
