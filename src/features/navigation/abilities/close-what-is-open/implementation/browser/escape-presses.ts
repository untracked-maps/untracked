import { filter, fromEvent, type Observable } from 'rxjs';

const isEscape = (event: Event): boolean => 'key' in event && event.key === 'Escape';

const escapePresses = (target: EventTarget): Observable<Event> => fromEvent(target, 'keydown').pipe(filter(isEscape));

export { escapePresses };
