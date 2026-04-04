import type {
  IOffsetPageResult,
  IOffsetPageToken,
  IPagedResult
} from './interfaces';
import { PagedList } from './PagedList';

export abstract class OffsetPagedList<T> extends PagedList<T, IOffsetPageToken> {
  constructor(private readonly pageSize: number) {
    super();
  }

  protected abstract fetchPageByOffset(page: IOffsetPageToken): Promise<IOffsetPageResult<T>>;

  protected getInitialPageToken(): IOffsetPageToken {
    return {
      offset: 0,
      limit: this.pageSize
    };
  }

  protected createNextPageToken(
    currentPage: IOffsetPageToken,
    result: IOffsetPageResult<T>
  ): IOffsetPageToken | null {
    if (result.hasMore === false || result.items.length === 0) {
      return null;
    }

    return {
      offset: currentPage.offset + result.items.length,
      limit: currentPage.limit
    };
  }

  protected async fetchPage(pageToken: IOffsetPageToken | null): Promise<IPagedResult<T, IOffsetPageToken>> {
    const currentPage = pageToken ?? this.getInitialPageToken();
    const result = await this.fetchPageByOffset(currentPage);

    return {
      items: result.items,
      nextPageToken: this.createNextPageToken(currentPage, result)
    };
  }
}
