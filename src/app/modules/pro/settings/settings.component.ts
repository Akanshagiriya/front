import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ProService } from '../pro.service';
import { Session } from '../../../services/session';
import { ActivatedRoute, Router } from '@angular/router';
import { MindsTitle } from '../../../services/ux/title';
import { Subscription } from 'rxjs';
import { SiteService } from '../../../common/services/site.service';

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

  error: string;

  protected param$: Subscription;

  @ViewChild('logoField', { static: false })
  protected logoField: ElementRef<HTMLInputElement>;

  @ViewChild('backgroundField', { static: false })
  protected backgroundField: ElementRef<HTMLInputElement>;

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
  }

  ngOnDestroy() {
    this.param$.unsubscribe();
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

  onLogoFileSelect(files: FileList | null) {
    if (!files || !files.item(0)) {
      this.settings.logo = null;
      this.detectChanges();
      return;
    }

    this.settings.logo = files.item(0);
    this.detectChanges();
  }

  onBackgroundFileSelect(files: FileList | null) {
    if (!files || !files.item(0)) {
      this.settings.background = null;
      this.detectChanges();
      return;
    }

    this.settings.background = files.item(0);
    this.detectChanges();
  }

  async save() {
    this.error = null;
    this.inProgress = true;
    this.detectChanges();

    try {
      const { logo, background, ...settings } = this.settings;

      if (logo) {
        await this.service.upload('logo', logo, this.user);

        if (this.logoField.nativeElement) {
          try {
            this.logoField.nativeElement.value = '';
          } catch (e) {
            console.warn('Browser prevented logoField resetting');
          }
        }

        settings.has_custom_logo = true;
      }

      if (background) {
        await this.service.upload('background', background, this.user);

        if (this.backgroundField.nativeElement) {
          try {
            this.backgroundField.nativeElement.value = '';
          } catch (e) {
            console.warn('Browser prevented backgroundField resetting');
          }
        }

        settings.has_custom_background = true;
      }

      this.settings = settings;

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
