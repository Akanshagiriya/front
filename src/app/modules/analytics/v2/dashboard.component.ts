import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { MindsTitle } from '../../../services/ux/title';
import { Client } from '../../../services/api';
import { Session } from '../../../services/session';

import { AnalyticsDashboardService } from './dashboard.service';
import { Filter } from './../../../interfaces/dashboard';

// import categories from './categories.default';
import isMobileOrTablet from '../../../helpers/is-mobile-or-tablet';

@Component({
  selector: 'm-analytics__dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AnalyticsDashboardService],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  isMobile: boolean;

  // subscription: Subscription;
  paramsSubscription: Subscription;

  category$ = this.analyticsService.category$;
  description$ = this.analyticsService.description$;
  selectedCat: string;

  selectedTimespan;
  timespanFilter: Filter = {
    id: 'timespan',
    label: 'Timespan',
    options: [],
  };
  channelFilter: Filter;

  constructor(
    public client: Client,
    public route: ActivatedRoute,
    private router: Router,
    public session: Session,
    public title: MindsTitle,
    public analyticsService: AnalyticsDashboardService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // TODO: why wasn't this working? didn't reroute
    if (!this.session.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.isMobile = isMobileOrTablet();

    this.title.setTitle('Analytics');

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.updateCategory(params.get('category'));
    });

    this.paramsSubscription = this.route.queryParams.subscribe(params => {
      // TODO: handleUrl
      if (params['timespan']) {
        // this.updateTimespan(params['timespan']);
      }
    });

    this.analyticsService.timespans$.subscribe(timespans => {
      this.timespanFilter.options = timespans;
      this.detectChanges();
    });
    this.analyticsService.category$.subscribe(category => {
      this.detectChanges();
    });
    this.analyticsService.metrics$.subscribe(metrics => {
      this.detectChanges();
    });
    this.analyticsService.filters$.subscribe(filters => {
      this.channelFilter = filters.find(filter => filter.id === 'channel');

      // TODO: remove this once channel search is ready
      // Temporarily remove channel search from filter options
      this.channelFilter.options = this.channelFilter.options.filter(option => {
        return option.id === 'all' || option.id === 'self';
      });
      this.detectChanges();
    });

    if (!this.session.isAdmin()) {
      this.analyticsService.updateFilter('channel::self');
    } else {
      this.analyticsService.updateFilter('channel::all');
    }
  }

  updateTimespan(timespanId) {
    // TODO
    // update url
    // this.analyticsService.updateTimespan(timespanId);
  }

  updateCategory(categoryId) {
    this.analyticsService.updateCategory(categoryId);
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    if (this.paramsSubscription) this.paramsSubscription.unsubscribe();
  }
}
