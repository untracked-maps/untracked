import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { type AddressLine, addressLine } from './address-line.presenter';

const lineOf = async (address: Parameters<AddressLine>[0]): Promise<string> => (await firstValueFrom(addressLine))(address);

describe('the line of an address', () => {
  it('writes a French address with its number, its street, its postal code and its city', async () => {
    expect(
      await lineOf({
        houseNumber: '12',
        street: "Rue de l'Éperon",
        postalCode: '75006',
        addressLocality: 'Paris',
        addressCountry: 'FR'
      })
    ).toBe("12 Rue de l'Éperon, 75006 Paris");
  });

  it('writes a Dutch address with its number after its street', async () => {
    expect(
      await lineOf({
        houseNumber: '123',
        street: 'Keizersgracht',
        postalCode: '1015 CJ',
        addressLocality: 'Amsterdam',
        addressCountry: 'NL'
      })
    ).toBe('Keizersgracht 123, 1015 CJ Amsterdam');
  });

  it('writes a street without a number', async () => {
    expect(await lineOf({ street: 'Rue de Rivoli', postalCode: '75001', addressLocality: 'Paris', addressCountry: 'FR' })).toBe(
      'Rue de Rivoli, 75001 Paris'
    );
  });

  it('writes a postal code and a city alone', async () => {
    expect(await lineOf({ postalCode: '75011', addressLocality: 'Paris', addressCountry: 'FR' })).toBe('75011 Paris');
  });
});
