import { Injectable } from "@angular/core";
import { filter, first, map, switchMap, mergeMap, skip, take } from 'rxjs/operators';
import { FeedsService } from "../../services/feeds.service";

@Injectable()
export class FeaturedContentService {

  offset: number = -1;

  constructor(
    protected feedsService: FeedsService,
  ) {
    this.feedsService
      .setLimit(12)
      .setOffset(0)
      .setEndpoint('api/v2/boost/fetch/campaigns')
      .fetch();
  }

  async fetch() {
    if (this.offset >= this.feedsService.rawFeed.getValue().length) {
      this.offset = -1;
    }
    return await this.feedsService.feed
      .pipe(
        filter(feed => feed.length > 0),
        first(),
        mergeMap(feed => feed),
        skip(this.offset++),
        take(1),
        switchMap(async entity => {
          if (!entity) {
            return false;
          }
          return await entity.pipe(first()).toPromise();
        }),
      ).toPromise();
  }
}
