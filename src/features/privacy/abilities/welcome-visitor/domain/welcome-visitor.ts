import { distinctUntilChanged, map, type Observable } from 'rxjs';

export type Acknowledged = () => Observable<boolean>;

export type WelcomeVisitorPorts = {
  readonly acknowledged: Acknowledged;
};

export const welcomeVisitor =
  ({ acknowledged }: WelcomeVisitorPorts) =>
  (): Observable<boolean> =>
    acknowledged().pipe(
      map((isAcknowledged: boolean): boolean => !isAcknowledged),
      distinctUntilChanged()
    );
