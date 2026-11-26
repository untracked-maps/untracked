import { type Observable, of } from 'rxjs';
import { WELCOME_STORAGE_KEY } from '#configuration/welcome';
import { welcomeVisitor } from '#features/privacy/abilities/welcome-visitor/domain/welcome-visitor';
import { localAcknowledgement } from '#features/privacy/abilities/welcome-visitor/implementation/browser/local-acknowledgement';
import { browser } from '$app/env';

type Welcome = {
  readonly shown: Observable<boolean>;
  readonly acknowledge: () => void;
};

const welcomed = (): Welcome => {
  const acknowledgement = browser ? localAcknowledgement(localStorage, WELCOME_STORAGE_KEY) : undefined;
  return {
    shown: acknowledgement === undefined ? of(true) : welcomeVisitor({ acknowledged: acknowledgement.acknowledged })(),
    acknowledge: (): void => acknowledgement?.acknowledge()
  };
};

export { welcomed };
