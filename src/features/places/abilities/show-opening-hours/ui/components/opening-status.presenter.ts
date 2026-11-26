import { m } from '#i18n/messages';
import type { Moment, OpeningStatus } from '../../domain/opening-hours';
import type { HoursView } from '../../domain/show-opening-hours';
import { clockOf, dayOf } from './opening-hours.presenter';

type Tone = 'open' | 'closed' | 'neutral';

type StatusWords = {
  readonly tone: Tone;
  readonly head: string;
  readonly rest?: string;
};

const LEAP_YEAR = 2000;

const dateOf = ({ day, month }: { readonly day: number; readonly month: number }, locale: string): string =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    Date.UTC(LEAP_YEAR, month - 1, day)
  );

const whenOf = (moment: Moment, locale: string): string => {
  switch (moment.day) {
    case 'today':
      return m.place_sheet_when_today({ heure: clockOf(moment.at) });
    case 'tonight':
      return m.place_sheet_when_tonight({ heure: clockOf(moment.at) });
    case 'tomorrow':
      return m.place_sheet_when_tomorrow({ heure: clockOf(moment.at) });
    case 'weekday':
      return m.place_sheet_when_weekday({ jour: dayOf(moment.weekday), heure: clockOf(moment.at) });
    default:
      return m.place_sheet_when_date({ date: dateOf(moment.date, locale) });
  }
};

const nowOf = (status: OpeningStatus, locale: string): StatusWords => {
  switch (status.state) {
    case 'open':
      return status.closes === undefined
        ? { tone: 'open', head: m.place_sheet_status_all_day() }
        : {
            tone: 'open',
            head: m.place_sheet_status_open(),
            rest: m.place_sheet_status_closes({ quand: whenOf(status.closes, locale) })
          };
    case 'closed':
      return status.opens === undefined
        ? { tone: 'closed', head: m.place_sheet_status_closed() }
        : {
            tone: 'closed',
            head: m.place_sheet_status_closed(),
            rest: m.place_sheet_status_opens({ quand: whenOf(status.opens, locale) })
          };
    default:
      return { tone: 'neutral', head: m.place_sheet_status_uncertain() };
  }
};

const statusOf = (view: HoursView, locale: string): StatusWords | undefined => {
  switch (view.status) {
    case 'known':
      return nowOf(view.now, locale);
    case 'unreadable':
      return { tone: 'neutral', head: m.place_sheet_status_unreadable() };
    default:
      return undefined;
  }
};

export { statusOf };
