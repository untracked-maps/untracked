type FetchFile = (url: string, init: { readonly signal: AbortSignal }) => Promise<Response>;

type TileDescription = {
  readonly data: object;
};

type DescribeTiles = (request: unknown, abortController: AbortController) => Promise<TileDescription>;

const tileDescriptionProtocol = 'openfreemap';

const PLANET = 'https://tiles.openfreemap.org/planet';

const BACKUP_PLANET = 'https://tiles.openfreemap.org/backup_planet';

const answered =
  (address: string) =>
  (response: Response): Promise<object> =>
    response.ok ? response.json() : Promise.reject(new Error(`${address} answered ${response.status}`));

const describedAt =
  (fetchFile: FetchFile, signal: AbortSignal) =>
  (address: string): Promise<TileDescription> =>
    fetchFile(address, { signal })
      .then(answered(address))
      .then((data) => ({ data }));

type TileDescriptionProtocol = {
  readonly name: string;
  readonly load: DescribeTiles;
};

const firstTileDescription =
  (fetchFile: FetchFile): DescribeTiles =>
  (_request, { signal }): Promise<TileDescription> => {
    const describedFrom = describedAt(fetchFile, signal);
    return describedFrom(PLANET).catch(() => describedFrom(BACKUP_PLANET));
  };

const openFreeMapProtocol = (fetchFile: FetchFile): TileDescriptionProtocol => ({
  name: tileDescriptionProtocol,
  load: firstTileDescription(fetchFile)
});

export { openFreeMapProtocol, tileDescriptionProtocol };
