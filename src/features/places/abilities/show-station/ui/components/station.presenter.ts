import { m } from '#i18n/messages';
import type { LineDepartures, Told } from '../../domain/next-departures';
import type { StationView } from '../../domain/show-station';
import type { StationExit } from '../../domain/station-exits';

type Named = Pick<LineDepartures, 'ref' | 'mode' | 'network'>;

const CLOCK_TIME: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
};

const toldText = (told: Told, locale: string, timeZone: string): string => {
  if (told.told === 'at platform') {
    return m.station_at_platform();
  }
  return told.told === 'minutes'
    ? m.station_minutes({ minutes: told.minutes })
    : new Intl.DateTimeFormat(locale, { ...CLOCK_TIME, timeZone }).format(new Date(told.at));
};

const exitText = ({ ref, name }: StationExit): string => {
  if (ref === undefined) {
    return name ?? '';
  }
  return name === undefined ? m.station_exit_number({ ref }) : m.station_exit({ ref, name });
};

const accessText = ({ access }: StationExit): string => {
  if (access === undefined) {
    return '';
  }
  return access === 'accessible' ? m.station_exit_accessible() : m.station_exit_escalator();
};

type Family = 'metro' | 'rer' | 'train' | 'tram';

const FAMILY_NAMES: Readonly<Record<Family, (refs: { readonly ref: string }) => string>> = {
  metro: m.station_line_metro,
  rer: m.station_line_rer,
  train: m.station_line_train,
  tram: m.station_line_tram
};

const familyOf = ({ mode, network }: Named): Family => {
  if (mode === 'subway') {
    return 'metro';
  }
  if (mode === 'tram') {
    return 'tram';
  }
  return network === 'RER' ? 'rer' : 'train';
};

const refsOf = (lines: readonly Named[], family: Family): string =>
  [...new Set(lines.filter((line) => familyOf(line) === family).map(({ ref }) => ref))].join(', ');

const lineName = (line: Named): string => FAMILY_NAMES[familyOf(line)]({ ref: line.ref });

const linesServed = (view: StationView): string | undefined => {
  if (view.status !== 'open' || view.departures.status !== 'known' || view.departures.lines.length === 0) {
    return undefined;
  }
  const { lines } = view.departures;
  return [...new Set(lines.map(familyOf))].map((family) => FAMILY_NAMES[family]({ ref: refsOf(lines, family) })).join(' · ');
};

export { accessText, exitText, lineName, linesServed, toldText };
