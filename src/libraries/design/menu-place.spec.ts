import { describe, expect, it } from 'vitest';
import { menuPlace } from './menu-place';

type MenuMeasures = Parameters<typeof menuPlace>[0];

const PHONE = { width: 375, height: 667 };

const AT_THE_BOTTOM_RIGHT = { left: 315, top: 560, right: 363, bottom: 608 };

const AT_THE_TOP_RIGHT = { left: 315, top: 20, right: 363, bottom: 68 };

const AT_THE_BOTTOM_LEFT = { left: 12, top: 560, right: 60, bottom: 608 };

const measures = (changes: Partial<MenuMeasures> = {}): MenuMeasures => ({
  button: AT_THE_BOTTOM_RIGHT,
  menu: { width: 320, height: 400 },
  viewport: PHONE,
  ...changes
});

describe('a menu with room above its button', () => {
  it('stands 8 px above its button', () => {
    expect(menuPlace(measures()).top).toBe(152);
  });

  it('lines up with the right of its button', () => {
    expect(menuPlace(measures()).left).toBe(43);
  });

  it('stays 8 px from the left of the screen', () => {
    expect(menuPlace(measures({ button: AT_THE_BOTTOM_LEFT })).left).toBe(8);
  });

  it('stays 8 px from the right of the screen', () => {
    expect(menuPlace(measures({ viewport: { width: 360, height: 667 } })).left).toBe(32);
  });

  it('stands above its button when it fits exactly', () => {
    expect(menuPlace(measures({ menu: { width: 320, height: 544 } })).top).toBe(8);
  });
});

describe('a menu without room above its button', () => {
  it('stands 8 px below its button', () => {
    expect(menuPlace(measures({ button: AT_THE_TOP_RIGHT })).top).toBe(76);
  });

  it('stands below its button when it fits exactly', () => {
    expect(menuPlace(measures({ button: AT_THE_TOP_RIGHT, menu: { width: 320, height: 583 } })).top).toBe(76);
  });
});

describe('a menu without room above nor below its button', () => {
  const wide = { width: 1024, height: 500 };

  const middleRight = { left: 960, top: 300, right: 1008, bottom: 348 };

  const middleLeft = { left: 16, top: 300, right: 64, bottom: 348 };

  const beside = (button: MenuMeasures['button'], height = 470): ReturnType<typeof menuPlace> =>
    menuPlace(measures({ button, viewport: wide, menu: { width: 320, height } }));

  it('stands 8 px left of its button when there is more room on the left', () => {
    expect(beside(middleRight).left).toBe(632);
  });

  it('stands 8 px right of its button when there is more room on the right', () => {
    expect(beside(middleLeft).left).toBe(72);
  });

  it('stands right of its button when there is as much room on both sides', () => {
    expect(beside({ left: 488, top: 300, right: 536, bottom: 348 }).left).toBe(544);
  });

  it('lines up with the bottom of its button', () => {
    expect(beside({ left: 960, top: 380, right: 1008, bottom: 470 }, 450).top).toBe(20);
  });

  it('stays 8 px from the top of the screen', () => {
    expect(beside(middleRight).top).toBe(8);
  });

  it('stays 8 px from the bottom of the screen', () => {
    expect(beside({ left: 960, top: 450, right: 1008, bottom: 498 }).top).toBe(22);
  });
});

describe('the height of a menu', () => {
  it('is held 8 px from the top and the bottom of the screen, beyond which it scrolls', () => {
    expect(menuPlace(measures()).maxHeight).toBe(651);
  });
});
