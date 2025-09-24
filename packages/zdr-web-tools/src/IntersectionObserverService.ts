import { type IEventBroker, EventBroker, AdvancedEventEmitter } from '@zdr-tools/zdr-entities';

interface IIntersectionObserverServiceOptions extends IntersectionObserver {
  sensitivity: number;
}

type ObserverCallback = (observer: IntersectionObserver) => void;
export type IIntersectionChangedParams = { entries: IntersectionObserverEntry[]; observer: IntersectionObserver };

export class IntersectionObserverService extends AdvancedEventEmitter {
  private _observer: IntersectionObserver | null = null;
  intersectionChanged: IEventBroker<IIntersectionChangedParams>;

  constructor(options?: IIntersectionObserverServiceOptions) {
    super();

    if (typeof IntersectionObserver !== 'undefined') {
      const root = options?.root ?? null;
      const sensitivity = options?.sensitivity ?? 0;
      this._observer = new IntersectionObserver(this._handleObserverChanged, {
        root,
        rootMargin: `${sensitivity}px ${sensitivity}px ${sensitivity}px ${sensitivity}px`,
        threshold: 0.0
      });
    }

    this.intersectionChanged = new EventBroker<IIntersectionChangedParams>(this);
  }

  _handleObserverChanged = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    this.intersectionChanged.emit({ entries, observer });
  };

  _safeGetObserver(callback: ObserverCallback) {
    this._observer && callback(this._observer);
  }

  observe(element: Element) {
    this._safeGetObserver(observer => {
      observer.observe(element);
    });
  }

  unobserve(element: Element) {
    this._safeGetObserver(observer => {
      observer.unobserve(element);
    });
  }

  disconnect() {
    this._safeGetObserver(observer => {
      observer.disconnect();
    });
  }
}
