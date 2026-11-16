import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { localAcknowledgement } from './local-acknowledgement';

const KEY = 'welcome';

const keptIn = (values: Map<string, string>): Pick<Storage, 'getItem' | 'setItem'> => ({
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value): void => {
    values.set(key, value);
  }
});

const fakeStorage = (): Pick<Storage, 'getItem' | 'setItem'> => keptIn(new Map());

describe('local acknowledgement', () => {
  it('is not acknowledged on a first visit', async () => {
    expect(await firstValueFrom(localAcknowledgement(fakeStorage(), KEY).acknowledged())).toBe(false);
  });

  it('reads an acknowledgement kept on an earlier visit', async () => {
    const storage = keptIn(new Map([[KEY, 'true']]));

    expect(await firstValueFrom(localAcknowledgement(storage, KEY).acknowledged())).toBe(true);
  });

  it('is acknowledged once the visitor acknowledged the welcome', async () => {
    const acknowledgement = localAcknowledgement(fakeStorage(), KEY);

    acknowledgement.acknowledge();

    expect(await firstValueFrom(acknowledgement.acknowledged())).toBe(true);
  });

  it('stays acknowledged on a later visit', async () => {
    const storage = fakeStorage();
    localAcknowledgement(storage, KEY).acknowledge();

    expect(await firstValueFrom(localAcknowledgement(storage, KEY).acknowledged())).toBe(true);
  });
});
