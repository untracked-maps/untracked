import { map, merge, type Observable, of, shareReplay, startWith, switchMap, take, timer } from 'rxjs';

type NoticeAction = {
  readonly label: string;
  readonly run: () => void;
};

type Notice = {
  readonly text: string;
  readonly action?: NoticeAction;
};

type ShowNoticeInputs = {
  readonly told: Observable<Notice>;
  readonly acted: Observable<void>;
};

const READING_TIME = 3500;

const ACTING_TIME = 6000;

const showNotice = ({ told, acted }: ShowNoticeInputs): Observable<Notice | undefined> =>
  told.pipe(
    switchMap((notice) =>
      merge(
        of(notice),
        merge(timer(notice.action === undefined ? READING_TIME : ACTING_TIME), acted).pipe(
          take(1),
          map(() => undefined)
        )
      )
    ),
    startWith(undefined),
    shareReplay(1)
  );

export { type Notice, showNotice };
