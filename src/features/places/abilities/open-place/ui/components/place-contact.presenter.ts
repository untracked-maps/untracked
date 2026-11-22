const WEB = /^https?:\/\//iu;

const UNSAFE = /^(?:javascript|data|vbscript|file|blob):/iu;

const SPACES = /\s/gu;

const LEADING_WWW = /^www\./u;

const LEADING_AT = /^@/u;

const callLink = (phone: string): string => `tel:${phone.replaceAll(SPACES, '')}`;

const linkOf = (value: string): string => {
  const link = value.trim();
  if (UNSAFE.test(link)) {
    return '#';
  }
  return WEB.test(link) ? link : `https://${link}`;
};

const siteNameOf = (website: string): string => {
  const hostname = URL.parse(linkOf(website))?.hostname;
  return hostname === undefined ? website : hostname.replace(LEADING_WWW, '');
};

const accountOf = (value: string): string =>
  URL.parse(linkOf(value))
    ?.pathname.split('/')
    .find((segment) => segment !== '') ?? value.replace(LEADING_AT, '');

const instagramAccountOf = (instagram: string): string => `@${accountOf(instagram)}`;

const facebookPageOf = (facebook: string): string => accountOf(facebook);

export { callLink, facebookPageOf, instagramAccountOf, linkOf, siteNameOf };
