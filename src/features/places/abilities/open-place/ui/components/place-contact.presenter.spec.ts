import { describe, expect, it } from 'vitest';
import { callLink, facebookPageOf, instagramAccountOf, linkOf, siteNameOf } from './place-contact.presenter';

const FACEBOOK = 'https://facebook.example';

describe('the link that calls a place', () => {
  it('dials the number without its spaces', () => {
    expect(callLink('+33 1 99 00 12 34')).toBe('tel:+33199001234');
  });
});

describe('the link to a page of a place', () => {
  it.each([
    ['https://www.procope.example/menu', 'https://www.procope.example/menu'],
    ['http://procope.example', 'http://procope.example'],
    ['HTTPS://procope.example', 'HTTPS://procope.example'],
    ['procope.example', 'https://procope.example'],
    ['javascript:alert(1)', '#'],
    [' JavaScript:alert(1)', '#'],
    ['data:text/html,hello', '#'],
    ['vbscript:msgbox', '#'],
    ['file:///etc/passwd', '#'],
    ['blob:https://procope.example/1', '#']
  ])('is %s for %s', (value, expected) => {
    expect(linkOf(value)).toBe(expected);
  });
});

describe('the name of the website of a place', () => {
  it.each([
    ['https://www.procope.example/carte?langue=fr', 'procope.example'],
    ['https://reservations.procope.example', 'reservations.procope.example'],
    ['procope.example/menu', 'procope.example'],
    ['https://wwwprocope.example', 'wwwprocope.example']
  ])('of %s is %s', (website, expected) => {
    expect(siteNameOf(website)).toBe(expected);
  });

  it('is the website as written when it cannot be read', () => {
    expect(siteNameOf('https://')).toBe('https://');
  });
});

describe('the Instagram account of a place', () => {
  it.each([
    ['https://instagram.example/leprocope', '@leprocope'],
    ['https://instagram.example/leprocope/', '@leprocope'],
    ['@leprocope', '@leprocope'],
    ['leprocope', '@leprocope']
  ])('of %s is %s', (instagram, expected) => {
    expect(instagramAccountOf(instagram)).toBe(expected);
  });
});

describe('the Facebook page of a place', () => {
  it.each([
    [`${FACEBOOK}/procope`, 'procope'],
    [`${FACEBOOK}/procope/`, 'procope'],
    ['procope', 'procope']
  ])('of %s is %s', (facebook, expected) => {
    expect(facebookPageOf(facebook)).toBe(expected);
  });
});
