import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  AnalyticsDashboardService,
  Filter,
  Option,
} from '../../dashboard.service';
import { Session } from '../../../../../services/session';

@Component({
  selector: 'm-analytics__filter',
  templateUrl: 'filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsFilterComponent implements OnInit {
  @Input() filter: Filter;
  @Input() dropUp: boolean = false;
  @Input() showLabel: boolean = true;

  expanded = false;
  options: Array<any> = [];
  selectedOption: Option;
  constructor(
    private analyticsService: AnalyticsDashboardService,
    public session: Session
  ) {}

  ngOnInit() {
    this.selectedOption =
      this.filter.options.find(option => option.selected === true) ||
      this.filter.options[0];
  }

  updateFilter(option: Option) {
    this.expanded = false;
    if (!option.available) {
      return;
    }
    this.selectedOption = option;

    if (this.filter.id === 'timespan') {
      this.analyticsService.updateTimespan(option.id);
      return;
    }

    const selectedFilterStr = `${this.filter.id}::${option.id}`;
    this.analyticsService.updateFilter(selectedFilterStr);
  }

  // clickHeader() {
  //   if (this.expanded) {
  //     console.log('its expanded');
  //     setTimeout(() => {
  //       this.expanded = false;
  //     });
  //   } else {
  //     console.log('itsnot expanded');
  //   }
  // document.getElementById("myAnchor").blur();
  // }
}
