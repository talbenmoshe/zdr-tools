import type { IUrl, IUrlParser } from '@zdr-tools/zdr-entities';
import { Url } from './Url';

export class UrlParser implements IUrlParser {
  parse(url: string): IUrl {
    return new Url(url);
  }
}
