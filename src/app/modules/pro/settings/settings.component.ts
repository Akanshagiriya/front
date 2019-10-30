import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ProService } from '../pro.service';
import { Session } from '../../../services/session';
import { ActivatedRoute, Router } from '@angular/router';
import { MindsTitle } from '../../../services/ux/title';
import { SiteService } from '../../../common/services/site.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'm-pro--settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'settings.component.html',
})
export class ProSettingsComponent implements OnInit, OnDestroy {
  settings: any;

  inProgress: boolean;

  saved: boolean = false;

  currentTab:
    | 'general'
    | 'theme'
    | 'hashtags'
    | 'footer'
    | 'domain'
    | 'cancel' = 'general';

  user: string | null = null;

  isDomainValid: boolean | null = null;

  error: string;

  domainValidationSubject: Subject<any> = new Subject<any>();

  protected param$: Subscription;

  protected domainValidation$: Subscription;

  constructor(
    protected service: ProService,
    protected session: Session,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    protected title: MindsTitle,
    protected site: SiteService
  ) {}

  ngOnInit() {
    this.param$ = this.route.params.subscribe(params => {
      if (this.session.isAdmin()) {
        this.user = params['user'] || null;
      }

      this.load();
    });

    this.domainValidation$ = this.domainValidationSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.validateDomain());
  }

  ngOnDestroy() {
    this.param$.unsubscribe();
    this.domainValidation$.unsubscribe();
  }

  async load() {
    this.inProgress = true;
    this.detectChanges();

    const { isActive, settings } = await this.service.get(this.user);

    if (!isActive && !this.user) {
      this.router.navigate(['/pro'], { replaceUrl: true });
      return;
    }

    this.settings = settings;

    this.title.setTitle('Pro Settings');

    this.inProgress = false;
    this.detectChanges();
  }

  async validateDomain() {
    this.isDomainValid = null;
    this.detectChanges();

    try {
      const { isValid } = await this.service.domainCheck(
        this.settings.domain,
        this.user
      );

      this.isDomainValid = isValid;
    } catch (e) {
      this.isDomainValid = null;
      this.error = (e && e.message) || 'Error checking domain';
    }

    this.detectChanges();
  }

  async save() {
    this.error = null;
    this.inProgress = true;
    this.detectChanges();

    try {
      await this.service.set(this.settings, this.user);
    } catch (e) {
      this.error = e.message;
    }

    this.saved = true;
    this.inProgress = false;
    this.detectChanges();
  }

  addBlankTag() {
    if (!this.settings) {
      return;
    }

    this.settings.tag_list.push({ label: '', tag: '' });
  }

  removeTag(index: number) {
    this.settings.tag_list.splice(index, 1);
  }

  addBlankFooterLink() {
    if (!this.settings) {
      return;
    }

    this.settings.footer_links.push({ title: '', href: '' });
  }

  removeFooterLink(index: number) {
    this.settings.footer_links.splice(index, 1);
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  get previewRoute() {
    return ['/pro', this.user || this.session.getLoggedInUser().username];
  }

  get ratios() {
    return this.service.ratios;
  }

  get isRemote() {
    return Boolean(this.user);
  }

  get isAdmin() {
    return this.session.isAdmin();
  }
}
