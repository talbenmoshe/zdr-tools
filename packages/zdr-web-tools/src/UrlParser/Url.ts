import type { IUrl } from '@zdr-tools/zdr-entities';
import URI from 'urijs';

export class Url implements IUrl {
  private url: URI;

  constructor(url: string) {
    this.url = new URI(url);
  }

  setProtocol(protocol: string): IUrl {
    const cloned = this.url.clone();
    cloned.protocol(protocol);

    return new Url(cloned.toString());
  }

  setSearch(searchObject: Record<string, any>): IUrl {
    const cloned = this.url.clone();
    cloned.setSearch(searchObject);

    return new Url(cloned.toString());
  }

  toUrlString(): string {
    return this.url.toString();
  }

  appendPath(path: string): IUrl {
    const cloned = this.url.clone();
    cloned.segmentCoded(path);

    return new Url(cloned.toString());
  }

  getProtocol(): string {
    return this.url.protocol();
  }

  getHost(): string {
    return this.url.host();
  }

  getPort(): string {
    return this.url.port();
  }

  getPath(): string {
    return this.url.path();
  }

  getQuery(): string {
    return this.url.query();
  }

  getHostName(): string {
    return this.url.hostname();
  }

  getPathSegments(): string[] {
    return this.url.segment();
  }

  getHash(): string {
    return this.url.hash();
  }

  getSearchObject(): Record<string, any> {
    return this.url.search(true);
  }

  removeOrigin(): IUrl {
    const cloned = this.url.clone();

    cloned.origin('');

    return new Url(cloned.toString());
  }
}
