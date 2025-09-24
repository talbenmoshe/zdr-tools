export interface IUrl {
  getProtocol(): string;
  getHost(): string;
  getPort(): string;
  getPath(): string;
  getQuery(): string;
  getHostName(): string;
  getPathSegments(): string[];
  getHash(): string;
  getSearchObject(): Record<string, any>;
  setSearch(searchObject: Record<string, any>): IUrl;
  appendPath(path: string): IUrl;
  toUrlString(): string;
  removeOrigin(): IUrl;
  setProtocol(protocol: string): IUrl;
}
