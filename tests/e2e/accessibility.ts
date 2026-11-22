import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

type Violations = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'];

const stillOn = (page: Page): Promise<void> =>
  page.evaluate(async function still(): Promise<void> {
    const running = document.getAnimations().filter(({ playState }) => playState === 'running');
    await (running.length === 0 ? Promise.resolve() : Promise.allSettled(running.map(({ finished }) => finished)).then(still));
  });

const violationsOf = async (page: Page): Promise<Violations> => {
  await stillOn(page);
  return (await new AxeBuilder({ page }).analyze()).violations;
};

export { violationsOf };
