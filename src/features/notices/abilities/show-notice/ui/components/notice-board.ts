import { type Observable, Subject } from 'rxjs';
import { type Notice, showNotice } from '../../domain/show-notice';

type Notices = {
  readonly shown: Observable<Notice | undefined>;
  readonly tell: (notice: Notice) => void;
  readonly act: () => void;
};

const noticeBoard = (): Notices => {
  const told = new Subject<Notice>();
  const acted = new Subject<void>();
  return { shown: showNotice({ told, acted }), tell: (notice) => told.next(notice), act: () => acted.next() };
};

export { type Notices, noticeBoard };
