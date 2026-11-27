import { lastValueFrom, type Observable, of, Subject, throwError, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type Picture, type StreetView, showStreetView } from './show-street-view';

type Coordinates = { readonly longitude: number; readonly latitude: number };

type StreetViewPlace = {
  readonly id: string;
  readonly name: string;
  readonly coordinates: Coordinates;
  readonly tags?: Readonly<Record<string, string>>;
};

const CAMERA: Coordinates = { longitude: 0, latitude: 60 };

const pictureAt = (camera: Coordinates, azimuth: number, image = 'street-views/cafe-01.svg'): Picture => ({
  image,
  camera,
  azimuth
});

const loading = (picture: Picture) => (): Observable<Picture> => of(picture);

const placeAt = (coordinates: Coordinates, panoramax = 'p-1', id = 'cafe'): StreetViewPlace => ({
  id,
  name: 'Café de Flore',
  coordinates,
  tags: { panoramax }
});

const recording = (): { readonly asked: string[]; readonly loadPicture: (id: string) => Observable<Picture> } => {
  const asked: string[] = [];
  return {
    asked,
    loadPicture: (id: string): Observable<Picture> => {
      asked.push(id);
      return of(pictureAt(CAMERA, 0));
    }
  };
};

const lastView = (picture: Picture, ...opened: readonly (StreetViewPlace | undefined)[]): Promise<StreetView> =>
  lastValueFrom(showStreetView({ loadPicture: loading(picture) })({ opened: of(...opened) }));

const facingOf = async (picture: Picture, place: StreetViewPlace): Promise<number> => {
  const view = await lastView(picture, place);
  return view.status === 'shown' ? view.facing : Number.NaN;
};

describe('the street view of a place', () => {
  it.each([
    { towards: 'north-north-east', place: { longitude: 1, latitude: 61 }, camera: CAMERA, facing: 0.571_617_747 },
    {
      towards: 'north-east at the equator',
      place: { longitude: 1, latitude: 1 },
      camera: { longitude: 0, latitude: 0 },
      facing: 0.624_987_879
    },
    { towards: 'east along a parallel', place: { longitude: 1, latitude: 60 }, camera: CAMERA, facing: 0.748_797_179 },
    {
      towards: 'south-west',
      place: { longitude: 9, latitude: -31 },
      camera: { longitude: 10, latitude: -30 },
      facing: 0.112_490_115
    }
  ])('faces a place $towards of a camera heading north', async ({ place, camera, facing }) => {
    expect(await facingOf(pictureAt(camera, 0), placeAt(place))).toBeCloseTo(facing, 8);
  });

  it.each([
    { heading: 90, facing: 0.25 },
    { heading: 180, facing: 0 },
    { heading: 270, facing: 0.75 },
    { heading: -90, facing: 0.75 },
    { heading: 450, facing: 0.25 },
    { heading: 720, facing: 0.5 }
  ])('turns the place the other way when the camera heads $heading°', async ({ heading, facing }) => {
    expect(
      await facingOf(pictureAt({ longitude: 0, latitude: 0 }, heading), placeAt({ longitude: 0, latitude: 1 }))
    ).toBeCloseTo(facing, 8);
  });

  it('is the picture the key names', async () => {
    expect(
      await lastView(pictureAt(CAMERA, 0, 'street-views/paris/bar-02.svg'), placeAt({ longitude: 0, latitude: 61 }))
    ).toEqual({
      status: 'shown',
      name: 'Café de Flore',
      image: 'street-views/paris/bar-02.svg',
      facing: 0.5
    });
  });
});

describe('the picture of a street view', () => {
  it('is the one the key names', async () => {
    const { asked, loadPicture } = recording();
    await lastValueFrom(showStreetView({ loadPicture })({ opened: of(placeAt(CAMERA, 'b5c3-09')) }));
    expect(asked).toEqual(['b5c3-09']);
  });

  it.each(['', '../p-1', 'p-1/', '/p-1', 'p 1', 'P-1', 'p-1\n'])('is none for a key %j that names no picture', async (key) => {
    expect(await lastView(pictureAt(CAMERA, 0), placeAt(CAMERA, key))).toEqual({ status: 'none' });
  });

  it.each([
    'https://images.example/p-1.jpg',
    '//images.example/p-1.jpg',
    '/street-views/cafe-01.svg',
    'street-views/cafe-01.svg?',
    'cafe-01.svg',
    'street-views/cafe-01'
  ])('is none for a picture %j that is not of the site', async (image) => {
    expect(await lastView(pictureAt(CAMERA, 0, image), placeAt(CAMERA))).toEqual({ status: 'none' });
  });
});

describe('no street view', () => {
  it('is shown without the key', async () => {
    expect(
      await lastView(pictureAt(CAMERA, 0), { id: 'cafe', name: 'Chez Paul', coordinates: CAMERA, tags: { amenity: 'cafe' } })
    ).toEqual({
      status: 'none'
    });
  });

  it('is shown without tags', async () => {
    expect(await lastView(pictureAt(CAMERA, 0), { id: 'cafe', name: 'Chez Paul', coordinates: CAMERA })).toEqual({
      status: 'none'
    });
  });

  it('is shown when the picture cannot be read', async () => {
    const loadPicture = (): Observable<Picture> => throwError(() => new Error('404'));
    expect(await lastValueFrom(showStreetView({ loadPicture })({ opened: of(placeAt(CAMERA)) }))).toEqual({ status: 'none' });
  });

  it('is shown once the sheet closes', async () => {
    expect(await lastView(pictureAt(CAMERA, 0), placeAt(CAMERA), undefined)).toEqual({ status: 'none' });
  });
});

describe('the street view of an opened place', () => {
  it('is none until the picture is read, then shown', () => {
    const pictures = new Subject<Picture>();
    const views: StreetView[] = [];
    const opened = new Subject<StreetViewPlace | undefined>();
    showStreetView({ loadPicture: () => pictures })({ opened }).subscribe((view) => {
      views.push(view);
    });
    opened.next(placeAt({ longitude: 0, latitude: 61 }));
    pictures.next(pictureAt(CAMERA, 0));
    expect(views).toEqual([
      { status: 'none' },
      { status: 'shown', name: 'Café de Flore', image: 'street-views/cafe-01.svg', facing: 0.5 }
    ]);
  });

  it('reads a picture once while the same place stays open', async () => {
    const { asked, loadPicture } = recording();
    await lastValueFrom(showStreetView({ loadPicture })({ opened: of(placeAt(CAMERA), placeAt(CAMERA)) }));
    expect(asked).toEqual(['p-1']);
  });

  it('faces again a neighbour that shares the picture', async () => {
    const views = await lastValueFrom(
      showStreetView({ loadPicture: loading(pictureAt({ longitude: 0, latitude: 0 }, 0)) })({
        opened: of(placeAt({ longitude: 0, latitude: 1 }, 'p-1', 'cafe'), placeAt({ longitude: 1, latitude: 0 }, 'p-1', 'bar'))
      }).pipe(toArray())
    );
    expect(views.map((view) => (view.status === 'shown' ? view.facing.toFixed(2) : view.status))).toEqual([
      'none',
      '0.50',
      'none',
      '0.75'
    ]);
  });

  it('reads the picture again for another place with another picture', async () => {
    const { asked, loadPicture } = recording();
    await lastValueFrom(
      showStreetView({ loadPicture })({ opened: of(placeAt(CAMERA, 'p-1', 'cafe'), placeAt(CAMERA, 'p-2', 'cafe')) })
    );
    expect(asked).toEqual(['p-1', 'p-2']);
  });

  it('shows nothing twice in a row', async () => {
    const views = await lastValueFrom(
      showStreetView({ loadPicture: loading(pictureAt(CAMERA, 0)) })({ opened: of(undefined, undefined) }).pipe(toArray())
    );
    expect(views).toEqual([{ status: 'none' }]);
  });
});
