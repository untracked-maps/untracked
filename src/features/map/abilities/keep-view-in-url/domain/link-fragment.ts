import { fragmentOfView, type MapView, viewOfFragment } from './view-fragment';

type Coordinates = MapView['center'];

type Linked =
  | { readonly kind: 'place'; readonly id: string; readonly at?: Coordinates }
  | { readonly kind: 'point'; readonly at: Coordinates };

type LinkTarget = {
  readonly at: Coordinates;
  readonly place?: string;
};

const PLACE_KEY = 'place';
const POINT_KEY = 'point';
const POINT_MARK = '1';
const SHARED_ZOOM = 17;

const placeLinked = (id: string, at: Coordinates | undefined): Linked =>
  at === undefined ? { kind: 'place', id } : { kind: 'place', id, at };

const pointLinked = (mark: string | null, at: Coordinates | undefined): Linked | undefined =>
  mark === POINT_MARK && at !== undefined ? { kind: 'point', at } : undefined;

const linkOfFragment = (fragment: string): Linked | undefined => {
  const keys = new URLSearchParams(fragment);
  const id = keys.get(PLACE_KEY) ?? '';
  const at = viewOfFragment(fragment)?.center;
  return id === '' ? pointLinked(keys.get(POINT_KEY), at) : placeLinked(id, at);
};

const keyOf = ({ place }: LinkTarget): string =>
  place === undefined ? `${POINT_KEY}=${POINT_MARK}` : `${PLACE_KEY}=${encodeURIComponent(place)}`;

const linkTo = (page: string, target: LinkTarget): string => {
  const [address] = page.split('#');
  return `${address}#${fragmentOfView({ center: target.at, zoom: SHARED_ZOOM })}&${keyOf(target)}`;
};

export { type Coordinates, type Linked, type LinkTarget, linkOfFragment, linkTo };
