import { describe, expect, it, onTestFinished } from 'vitest';
import { heldFrom } from './long-press';

const pointer = (type: string, x: number, y: number): PointerEvent =>
  new PointerEvent(type, { clientX: x, clientY: y, bubbles: true });

const element = (): HTMLElement => {
  const pressed = document.body.appendChild(document.createElement('div'));
  onTestFinished(() => pressed.remove());
  return pressed;
};

const heldAfter = async (milliseconds: number, ...meanwhile: readonly PointerEvent[]): Promise<readonly string[]> => {
  const pressed = element();
  const start = pointer('pointerdown', 10, 10);
  const told: string[] = [];
  const vibrate = (vibration: number): void => {
    told.push(`vibrated ${vibration} ms`);
  };
  const subscription = heldFrom(pressed, start, vibrate).subscribe((held) => {
    told.push(held === start ? 'held from the start' : 'held from elsewhere');
  });
  onTestFinished(() => subscription.unsubscribe());
  meanwhile.map((event) => pressed.dispatchEvent(event));
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
  return told;
};

describe('heldFrom', () => {
  it('vibrates 10 ms, then tells the press started where the finger went down', async () => {
    expect(await heldAfter(600)).toEqual(['vibrated 10 ms', 'held from the start']);
  });

  it('tells nothing before 480 ms', async () => {
    expect(await heldAfter(400)).toEqual([]);
  });

  it('tells nothing once the finger lifts', async () => {
    expect(await heldAfter(600, pointer('pointerup', 10, 10))).toEqual([]);
  });

  it('tells nothing once the finger moves more than 10 px', async () => {
    expect(await heldAfter(600, pointer('pointermove', 10, 21))).toEqual([]);
  });

  it('still tells the press once the finger moves 10 px', async () => {
    expect(await heldAfter(600, pointer('pointermove', 16, 18))).toEqual(['vibrated 10 ms', 'held from the start']);
  });

  it('tells nothing once the press is cancelled', async () => {
    expect(await heldAfter(600, pointer('pointercancel', 10, 10))).toEqual([]);
  });
});
