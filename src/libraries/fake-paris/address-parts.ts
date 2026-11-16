type AddressParts = {
  readonly number?: string;
  readonly street: string;
  readonly postcode: string;
  readonly city: string;
};

const ONE_LINE_ADDRESS = /(?:(?<number>\d+(?: bis| ter)?) )?(?<street>.+), (?<postcode>\d{5}) (?<city>.+)/u;

const numbered = (number: string | undefined): { readonly number?: string } => (number === undefined ? {} : { number });

const addressPartsOf = (address: string): readonly AddressParts[] => {
  const parts = ONE_LINE_ADDRESS.exec(address)?.groups;
  return parts === undefined
    ? []
    : [
        {
          ...numbered(parts['number']),
          street: String(parts['street']),
          postcode: String(parts['postcode']),
          city: String(parts['city'])
        }
      ];
};

export { addressPartsOf };
