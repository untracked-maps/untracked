import { type Observable, Subject } from 'rxjs';
import {
  type District,
  type DistrictSheet,
  districtsFramedAt,
  districtsOutlined,
  type FramedDistrict,
  type KnownOutline,
  openDistrict
} from '#features/search/abilities/open-district/domain/open-district';
import { prerenderedOutlines } from '#features/search/abilities/open-district/implementation/prerendered/prerendered-outlines';

type FetchFile = (url: string) => Promise<Response>;

type Districts = {
  readonly sheet: Observable<DistrictSheet>;
  readonly outlined: Observable<KnownOutline['outline'] | undefined>;
  readonly framed: Observable<FramedDistrict>;
  readonly open: (district: District) => void;
  readonly close: () => void;
};

const districtSheets = (fetchFile: FetchFile, districtsUrl: string): Districts => {
  const opened = new Subject<District>();
  const closed = new Subject<void>();
  const sheet = openDistrict({ loadOutlines: prerenderedOutlines(fetchFile, districtsUrl) })({ opened, closed });
  return {
    sheet,
    outlined: districtsOutlined(sheet),
    framed: districtsFramedAt(sheet),
    open: (district): void => opened.next(district),
    close: (): void => closed.next()
  };
};

export { type Districts, districtSheets };
