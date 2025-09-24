
import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';
import { LoadingState, LoadingStateBroker } from './LoadingStateBroker';

export interface ILoadingStateEmitter {
  setIdle(): void;
  setLoading(): void;
  setError(): void;
  setDone(): void;
}

export class LoadingStateEmitter extends AdvancedEventEmitter implements ILoadingStateEmitter {
  state: LoadingStateBroker;

  constructor(initialState: LoadingState = LoadingState.IDLE) {
    super();
    this.state = new LoadingStateBroker(this, initialState);
  }

  setIdle(): void {
    this.state.setIdle();
  }
  setLoading(): void {
    this.state.setLoading();
  }
  setError(): void {
    this.state.setError();
  }
  setDone(): void {
    this.state.setDone();
  }
}
