import type { IPagedResult } from './interfaces';
import { PagedList } from './PagedList';

export abstract class CursorPagedList<T> extends PagedList<T, string> {
  protected abstract fetchPageByCursor(cursor: string | null): Promise<IPagedResult<T, string>>;

  protected fetchPage(pageToken: string | null): Promise<IPagedResult<T, string>> {
    return this.fetchPageByCursor(pageToken);
  }
}
