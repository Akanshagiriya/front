import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  OnInit,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { Session } from '../../../services/session';
import { DynamicHostDirective } from '../../directives/dynamic-host.directive';
import { NotificationsToasterComponent } from '../../../modules/notifications/toaster.component';
import { ThemeService } from '../../../common/services/theme.service';
import { V2TopbarService } from './v2-topbar.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'm-v2-topbar',
  templateUrl: 'v2-topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class V2TopbarComponent implements OnInit, OnDestroy {
  minds = window.Minds;
  timeout;
  isTouchScreen = false;
  forceBackground: boolean = true;
  showBackground: boolean = true;
  showSeparateLoginBtns: boolean = false;
  marketingPages: boolean = false;
  showBottombar: boolean = true;

  @ViewChild(DynamicHostDirective, { static: true })
  notificationsToasterHost: DynamicHostDirective;

  componentRef;
  componentInstance: NotificationsToasterComponent;

  onAuthPages: boolean = false; // sets to false if we're on login or register pages

  router$;

  constructor(
    protected session: Session,
    protected cd: ChangeDetectorRef,
    private themeService: ThemeService,
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected topbarService: V2TopbarService,
    protected router: Router
  ) {}

  ngOnInit() {
    this.loadComponent();
    this.session.isLoggedIn(() => this.detectChanges());

    this.listen();

    this.topbarService.setContainer(this);
  }

  getCurrentUser() {
    return this.session.getLoggedInUser();
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
        NotificationsToasterComponent
      ),
      viewContainerRef = this.notificationsToasterHost.viewContainerRef;

    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent(componentFactory);
    this.componentInstance = this.componentRef.instance;
  }

  /**
   * Marketing pages set this to true in order to change how the topbar looks
   * @param value
   * @param showBottombar
   */
  toggleMarketingPages(
    value: boolean,
    showBottombar = true,
    forceBackground: boolean = true
  ) {
    this.marketingPages = value;
    this.showSeparateLoginBtns = value;
    this.showBottombar = value && showBottombar;
    this.forceBackground = forceBackground;
    this.onScroll();
    this.detectChanges();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.showBackground = this.forceBackground
      ? true
      : this.marketingPages
      ? window.document.body.scrollTop > 52
      : true;
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  touchStart() {
    this.isTouchScreen = true;
  }

  mouseEnter() {
    if (this.session.isLoggedIn()) {
      this.timeout = setTimeout(() => {
        if (!this.isTouchScreen) {
          this.themeService.toggleUserThemePreference();
        }
      }, 5000);
    }
  }

  mouseLeave() {
    clearTimeout(this.timeout);
  }

  ngOnDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private listen() {
    this.setOnAuthPages(this.router.url);

    this.router$ = this.router.events.subscribe(
      (navigationEvent: NavigationEnd) => {
        if (navigationEvent instanceof NavigationEnd) {
          if (!navigationEvent.urlAfterRedirects) {
            return;
          }

          this.setOnAuthPages(
            navigationEvent.urlAfterRedirects || navigationEvent.url
          );
        }
      }
    );
  }

  private setOnAuthPages(url) {
    this.onAuthPages = url === '/login' || url === '/register';
    this.detectChanges();
  }
}
