import { defer, map, type Observable, shareReplay } from 'rxjs';

type PostalAddress = {
  readonly houseNumber?: string;
  readonly street?: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
};

type AddressLine = (address: PostalAddress) => string;

type Formatter = typeof import('@fragaria/address-formatter')['default'];

const LINE_SEPARATOR = ', ';

const present = (name: string, value: string | undefined): Readonly<Record<string, string>> =>
  value === undefined ? {} : { [name]: value };

const lineWith =
  (formatter: Formatter): AddressLine =>
  ({ houseNumber, street, postalCode, addressLocality, addressCountry }: PostalAddress): string =>
    formatter
      .format(
        {
          ...present('houseNumber', houseNumber),
          ...present('road', street),
          postcode: postalCode,
          city: addressLocality,
          countryCode: addressCountry
        },
        { output: 'array', appendCountry: false }
      )
      .join(LINE_SEPARATOR);

const addressLine: Observable<AddressLine> = defer(() => import('@fragaria/address-formatter')).pipe(
  map(({ default: formatter }) => lineWith(formatter)),
  shareReplay(1)
);

export { type AddressLine, addressLine };
