import { beforeEach } from 'vitest';
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    parkPointer: () => Promise<void>;
    reduceMotion: (reduced: boolean) => Promise<void>;
  }
}

beforeEach(async () => {
  await commands.parkPointer();
  await commands.reduceMotion(false);
});
