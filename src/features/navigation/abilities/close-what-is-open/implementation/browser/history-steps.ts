import { filter, fromEvent, type Observable } from 'rxjs';

const hasState = (event: Event): boolean => 'state' in event && event.state !== null;

const historySteps = (target: EventTarget): Observable<Event> => fromEvent(target, 'popstate').pipe(filter(hasState));

export { historySteps };
