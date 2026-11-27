import { distinctUntilChanged, map, type Observable, startWith } from 'rxjs';

type Tags = Readonly<Partial<Record<string, string>>>;

type PhotoPlace = {
  readonly id: string;
  readonly tags?: Tags;
};

type Photos = readonly string[];

type ShowPhotosInputs = {
  readonly opened: Observable<PhotoPlace | undefined>;
};

const SITE_PATH = /^(?:[a-z0-9-]+\/)+[a-z0-9-]+\.[a-z0-9]+$/u;

const NONE: Photos = [];

const isOfTheSite = (path: string): boolean => SITE_PATH.test(path);

const photosOf = (place: PhotoPlace | undefined): Photos => {
  const image = place?.tags?.['image'];
  return image === undefined
    ? NONE
    : [
        ...new Set(
          image
            .split(';')
            .map((path) => path.trim())
            .filter(isOfTheSite)
        )
      ];
};

const samePhotos = (previous: Photos, next: Photos): boolean => previous.join(';') === next.join(';');

const showPhotos = ({ opened }: ShowPhotosInputs): Observable<Photos> =>
  opened.pipe(map(photosOf), startWith(NONE), distinctUntilChanged(samePhotos));

export { type Photos, showPhotos };
