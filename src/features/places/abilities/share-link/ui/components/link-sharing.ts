import { filter, of } from 'rxjs';
import { m } from '#i18n/messages';
import { type SharedLink, type ShareLinkPorts, shareLink } from '../../domain/share-link';

type Tell = (notice: { readonly text: string }) => void;

const linkSharing =
  (ports: ShareLinkPorts, tell: Tell) =>
  (link: SharedLink): void => {
    shareLink(ports)(of(link))
      .pipe(filter((shared) => shared === 'not copied'))
      .subscribe(() => tell({ text: m.share_link_not_copied() }));
  };

export { linkSharing };
