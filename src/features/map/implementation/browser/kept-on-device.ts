import { BehaviorSubject, type Observable } from 'rxjs';

type KeptOnDevice<Value> = {
  readonly kept: () => Observable<Value>;
  readonly keep: (value: Value) => void;
};

type DeviceStorage = Pick<Storage, 'getItem' | 'setItem'>;

const keptOnDevice = <Value>(
  storage: DeviceStorage,
  key: string,
  [first, ...others]: readonly [Value, ...Value[]]
): KeptOnDevice<Value> => {
  const stored = storage.getItem(key);
  const kept$ = new BehaviorSubject(others.find((value) => String(value) === stored) ?? first);
  return {
    kept: () => kept$.asObservable(),
    keep: (value: Value): void => {
      storage.setItem(key, String(value));
      kept$.next(value);
    }
  };
};

const keptInMemory = <Value>([first]: readonly [Value, ...Value[]]): KeptOnDevice<Value> => {
  const kept$ = new BehaviorSubject(first);
  return {
    kept: () => kept$.asObservable(),
    keep: (value: Value): void => kept$.next(value)
  };
};

export { type KeptOnDevice, keptInMemory, keptOnDevice };
