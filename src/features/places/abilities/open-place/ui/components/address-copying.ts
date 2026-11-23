import { filter, of } from 'rxjs';
import { m } from '#i18n/messages';
import { type CopyText, copyAddress } from '../../domain/open-place';

type Tell = (notice: { readonly text: string }) => void;

const addressCopying =
  (ports: { readonly copyText: CopyText }, tell: Tell) =>
  (address: string): void => {
    copyAddress(ports)(of(address))
      .pipe(filter((copied) => copied === 'not copied'))
      .subscribe(() => tell({ text: m.place_sheet_address_not_copied() }));
  };

export { addressCopying };
