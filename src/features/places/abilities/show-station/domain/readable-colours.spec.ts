import { describe, expect, it } from 'vitest';
import { readableColours } from './readable-colours';

describe('the colours of a line', () => {
  it('are kept when they read at 4.5:1', () => {
    expect(readableColours({ colour: '#CF009E', textColour: '#FFFFFF' })).toEqual({ colour: '#cf009e', textColour: '#ffffff' });
  });

  it('darken the background under a lighter text', () => {
    expect(readableColours({ colour: '#5091CB', textColour: '#FFFFFF' }).colour).toBe('#4074a2');
  });

  it('lighten the background under a darker text', () => {
    expect(readableColours({ colour: '#6E491E', textColour: '#000000' }).colour).toBe('#927756');
  });

  it('never change the text', () => {
    expect(readableColours({ colour: '#6E491E', textColour: '#000000' }).textColour).toBe('#000000');
  });

  it('stop at the last shade when none reads', () => {
    expect(readableColours({ colour: '#FFFFFF', textColour: '#FFFFFF' }).colour).toBe('#ffffff');
  });
});

describe('the colours of a line, at the edges', () => {
  it('are kept at 4.5:1 exactly', () => {
    expect(readableColours({ colour: '#008580', textColour: '#FFFFFF' }).colour).toBe('#008580');
  });

  it('change just under 4.5:1', () => {
    expect(readableColours({ colour: '#378280', textColour: '#FFFFFF' }).colour).not.toBe('#378280');
  });

  it('darken to a quarter at most when no shade reads', () => {
    expect(readableColours({ colour: '#555555', textColour: '#666666' }).colour).toBe('#151515');
  });

  it('are grey and white when the line has none', () => {
    expect(readableColours({})).toEqual({ colour: '#5b6573', textColour: '#ffffff' });
  });

  it('are grey when the colour cannot be read', () => {
    expect(readableColours({ colour: 'not a colour', textColour: '#FFFFFF' }).colour).toBe('#5b6573');
  });

  it('read CSS colour names, as OpenStreetMap allows', () => {
    expect(readableColours({ colour: 'black', textColour: 'white' }).colour).toBe('#000000');
  });
});
