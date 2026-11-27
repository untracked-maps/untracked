import type { FakePlaceOnMap } from './place-on-map';

type FakePlaceListed = Omit<FakePlaceOnMap, FakeDetail>;

type FakeDetail = 'phone' | 'website' | 'menu' | 'instagram' | 'facebook' | 'tags';

type FakePlaceDetails = Pick<FakePlaceOnMap, 'id' | FakeDetail>;

const listed = ({ phone, website, menu, instagram, facebook, tags, ...place }: FakePlaceOnMap): FakePlaceListed => place;

const detailsOf = ({ id, phone, website, menu, instagram, facebook, tags }: FakePlaceOnMap): readonly FakePlaceDetails[] => {
  const details = Object.fromEntries(
    Object.entries({ phone, website, menu, instagram, facebook, tags }).filter((detail) => detail[1] !== undefined)
  );
  return Object.keys(details).length === 0 ? [] : [{ id, ...details }];
};

const placesFile = (places: readonly FakePlaceOnMap[]): readonly FakePlaceListed[] => places.map(listed);

const detailsFile = (places: readonly FakePlaceOnMap[]): readonly FakePlaceDetails[] => places.flatMap(detailsOf);

export { detailsFile, placesFile };
