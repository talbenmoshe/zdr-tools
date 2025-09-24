import type { IUrl } from './IUrl';

export interface IUrlParser {
  parse(url: string): IUrl;
}
