import type { EventEmitterType } from '../interfaces';
import { PropEventBroker } from './PropEventBroker';

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  DONE = 'DONE'
}

export class LoadingStateBroker extends PropEventBroker<LoadingState> {
  constructor(emitter: EventEmitterType, initialValue: LoadingState = LoadingState.IDLE) {
    super(emitter, initialValue);
  }

  setIdle() {
    this.set(LoadingState.IDLE);
  }

  setLoading() {
    this.set(LoadingState.LOADING);
  }

  setError() {
    this.set(LoadingState.ERROR);
  }

  setDone() {
    this.set(LoadingState.DONE);
  }
}
