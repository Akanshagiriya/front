import {
  Injectable,
  Renderer2,
  RendererFactory2,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Client } from '../../services/api/client';
import { Session } from '../../services/session';
import { Storage } from '../../services/storage';
import { BehaviorSubject, Subscription } from 'rxjs';
import { isPlatformServer, DOCUMENT } from '@angular/common';

@Injectable()
export class ThemeService {
  renderer: Renderer2;
  isDark$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDarkSubscription: Subscription;
  allowSetStorage: boolean = true;
  timer;

  constructor(
    rendererFactory: RendererFactory2,
    private client: Client,
    private session: Session,
    @Inject(PLATFORM_ID) private platformId,
    @Inject(DOCUMENT) private dom
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isDarkSubscription = this.isDark$.subscribe(isDark => {
      this.renderTheme();
    });
  }

  // TODO after release of MacOS 10.14.4
  // Setup a listener for below to automatically toggle into dark mode for Macs --
  // prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  setUp(): void {
    this.emitThemePreference();
  }

  /**
   * Toggles, saves and emits theme change
   */
  toggleUserThemePreference(): void {
    if (this.isDark$.value) {
      this.client.post('api/v2/settings/theme', {
        theme: 'light',
      });
      this.session.getLoggedInUser().theme = 'light';
    } else {
      this.client.post('api/v2/settings/theme', {
        theme: 'dark',
      });
      this.session.getLoggedInUser().theme = 'dark';
    }

    this.emitThemePreference();
  }

  /**
   * Emits an events that others can listen to
   */
  emitThemePreference(): void {
    const shouldBeDark: boolean =
      this.session.getLoggedInUser().theme === 'dark';
    this.isDark$.next(shouldBeDark);
  }

  toggleTheme(): void {
    this.isDark$.next(!this.isDark$.value);
    this.renderTheme();
  }

  renderTheme(): void {
    this.renderer.addClass(this.dom.body, 'm-theme-in-transition');
    if (this.isDark$.value) {
      this.renderer.removeClass(this.dom.body, 'm-theme__light');
      this.renderer.addClass(this.dom.body, 'm-theme__dark');
    } else {
      this.renderer.removeClass(this.dom.body, 'm-theme__dark');
      this.renderer.addClass(this.dom.body, 'm-theme__light');
    }
    this.clearTransitions();
  }

  clearTransitions(): void {
    clearTimeout(this.timer);
    const delay: number = isPlatformServer(this.platformId) ? 0 : 1000;
    this.timer = setTimeout(() => {
      this.renderer.removeClass(this.dom.body, 'm-theme-in-transition');
    }, delay);
  }
}
