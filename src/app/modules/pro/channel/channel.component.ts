import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Session } from '../../../services/session';
import { Subscription } from 'rxjs';
import { MindsUser } from '../../../interfaces/entities';
import { Client } from '../../../services/api/client';
import { MindsTitle } from '../../../services/ux/title';
import { ProChannelService } from './channel.service';
import { SignupModalService } from '../../modals/signup/service';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { OverlayModalComponent } from '../../../common/components/overlay-modal/overlay-modal.component';
import { SessionsStorageService } from '../../../services/session-storage.service';
import { SiteService } from '../../../services/site.service';

@Component({
  providers: [ProChannelService, OverlayModalService],
  selector: 'm-pro--channel',
  templateUrl: 'channel.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProChannelComponent implements OnInit, AfterViewInit, OnDestroy {
  username: string;

  type: string;

  query: string;

  channel: MindsUser;

  inProgress: boolean;

  error: string;

  collapseNavItems: boolean;

  protected params$: Subscription;

  protected loggedIn$: Subscription;

  @ViewChild('overlayModal', { static: true })
  protected overlayModal: OverlayModalComponent;

  get currentUser() {
    if (!this.session.isLoggedIn()) {
      return null;
    }

    return this.session.getLoggedInUser();
  }

  get homeRouterLink() {
    return this.channelService.getRouterLink('home');
  }

  get feedRouterLink() {
    let params;

    if (this.query) {
      params = { query: this.query };
    }

    return this.channelService.getRouterLink('feed', params);
  }

  get videosRouterLink() {
    let params;

    if (this.query) {
      params = { query: this.query };
    }

    return this.channelService.getRouterLink('videos', params);
  }

  get imagesRouterLink() {
    let params;

    if (this.query) {
      params = { query: this.query };
    }

    return this.channelService.getRouterLink('images', params);
  }

  get articlesRouterLink() {
    let params;

    if (this.query) {
      params = { query: this.query };
    }

    return this.channelService.getRouterLink('articles', params);
  }

  get groupsRouterLink() {
    return this.channelService.getRouterLink('groups');
  }

  get proSettingsLink() {
    return ['/pro/settings'];
  }

  get proSettingsHref() {
    return window.Minds.site_url + 'pro/settings';
  }

  get isProDomain() {
    return this.site.isProDomain;
  }

  @HostBinding('style.backgroundImage') get backgroundImageCssValue() {
    if (!this.channel) {
      return 'none';
    }

    return `url(${this.channel.pro_settings.background_image})`;
  }

  @HostBinding('class') get cssColorSchemeOverride() {
    if (!this.channel) {
      return '';
    }

    return `m-theme--wrapper m-theme--wrapper__${this.channel.pro_settings
      .scheme || 'light'}`;
  }

  constructor(
    protected element: ElementRef,
    protected session: Session,
    protected channelService: ProChannelService,
    protected client: Client,
    protected title: MindsTitle,
    protected router: Router,
    protected route: ActivatedRoute,
    protected cd: ChangeDetectorRef,
    protected modal: SignupModalService,
    protected modalService: OverlayModalService,
    protected sessionStorage: SessionsStorageService,
    protected site: SiteService,
    protected injector: Injector
  ) {}

  ngOnInit() {
    if (this.site.isProDomain) {
      this.username = this.site.pro.user_guid;
    }

    this.listen();
    this.onResize();
  }

  ngAfterViewInit() {
    this.modalService
      .setContainer(this.overlayModal)
      .setRoot(this.element.nativeElement);
  }

  listen() {
    this.params$ = this.route.params.subscribe(params => {
      if (params['username']) {
        this.username = params['username'];
      }

      if (params['type']) {
        this.type = params['type'];
        this.setTitle();
      }

      if (
        this.username &&
        (!this.channel || this.channel.username != this.username)
      ) {
        this.load();
      }
    });

    this.loggedIn$ = this.session.loggedinEmitter.subscribe(is => {
      if (is) {
        this.reload();
      }
    });
  }

  @HostListener('window:resize') onResize() {
    this.collapseNavItems = window.innerWidth <= 768;
  }

  setTitle() {
    if (!this.channel) {
      this.title.setTitle(this.username || 'Minds Pro');
      return;
    }

    const title = [
      (this.channel.pro_settings.title as string) ||
        this.channel.name ||
        this.channel.username,
    ];

    switch (this.type) {
      case 'feed':
        title.push('Feed');
        break;
      case 'videos':
        title.push('Videos');
        break;
      case 'images':
        title.push('Images');
        break;
      case 'articles':
        title.push('Articles');
        break;
      case 'groups':
        title.push('Groups');
        break;
      case 'donate':
        title.push('Donate');
        break;
    }

    if (this.channel.pro_settings.one_line_headline) {
      title.push(this.channel.pro_settings.one_line_headline);
    }

    this.title.setTitle(title.join(' - '));
  }

  ngOnDestroy() {
    this.params$.unsubscribe();
  }

  async load() {
    this.error = null;

    if (!this.username) {
      return;
    }

    this.inProgress = true;
    this.detectChanges();

    try {
      this.channel = await this.channelService.loadAndAuth(this.username);
      this.bindCssVariables();
      this.setTitle();
    } catch (e) {
      this.error = e.message;
    }

    this.shouldOpenWireModal();

    this.detectChanges();
  }

  async reload() {
    this.error = null;

    try {
      this.channel = await this.channelService.reload(this.username);
    } catch (e) {
      this.error = e.message;
    }

    this.shouldOpenWireModal();

    this.detectChanges();
  }

  bindCssVariables() {
    const styles = this.channel.pro_settings.styles;

    for (const style in styles) {
      if (!styles.hasOwnProperty(style)) {
        continue;
      }

      let value =
        typeof styles[style] === 'string' ? styles[style].trim() : null;

      if (!value) {
        continue;
      }

      const styleAttr = style.replace(/_/g, '-');
      this.element.nativeElement.style.setProperty(
        `--m-pro--${styleAttr}`,
        styles[style]
      );
    }
  }

  wire() {
    this.channelService.wire();
  }

  search(): Promise<boolean> {
    return this.router.navigate(
      this.channelService.getRouterLink('all', { query: this.query })
    );
  }

  clearSearch() {
    this.query = '';
    const cleanUrl = this.router.url.split(';')[0];
    this.router.navigate([cleanUrl]);
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  private shouldOpenWireModal() {
    if (this.sessionStorage.get('pro::wire-modal::open')) {
      this.wire();
    }
  }
}
