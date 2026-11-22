import { describe, expect, it } from 'vitest';
import type { Notice } from '../../domain/show-notice';
import { noticeBoard } from './notice-board';

const shownOn = (board: ReturnType<typeof noticeBoard>): (Notice | undefined)[] => {
  const shown: (Notice | undefined)[] = [];
  board.shown.subscribe((notice) => {
    shown.push(notice);
  });
  return shown;
};

describe('the notice board', () => {
  it('shows nothing at first', () => {
    expect(shownOn(noticeBoard())).toEqual([undefined]);
  });

  it('shows the notice told', () => {
    const board = noticeBoard();
    const shown = shownOn(board);

    board.tell({ text: 'Address copied' });

    expect(shown).toEqual([undefined, { text: 'Address copied' }]);
  });

  it('hides the notice once acted on', () => {
    const board = noticeBoard();
    const shown = shownOn(board);
    board.tell({ text: 'History cleared', action: { label: 'Undo', run: () => undefined } });

    board.act();

    expect(shown.at(-1)).toBeUndefined();
  });
});
