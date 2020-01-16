import { NotificationService } from './notification.service';
import { clientMock } from '../../../tests/client-mock.spec';
import { sessionMock } from '../../../tests/session-mock.spec';
import { socketMock } from '../../../tests/socket-mock.spec';
import { fakeAsync, tick } from '@angular/core/testing';
import { SiteService } from '../../common/services/site.service';
import { EventEmitter, PLATFORM_ID } from '@angular/core';

export let siteServiceMock = new (function() {
  var pro = () => null;
  var isProDomain = () => false;
  var title = () => 'Minds';
  var isAdmin = () => true;
})();
export let metaServiceMock = new (function() {
  this.setCounter = jasmine.createSpy('setCounter').and.callFake(() => {});
})();

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
    service = new NotificationService(
      sessionMock,
      clientMock,
      socketMock,
      metaServiceMock,
      PLATFORM_ID,
      siteServiceMock
    );
    clientMock.response = {};
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be instantiated', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe when listening', fakeAsync(() => {
    window.Minds.navigation = {};
    window.Minds.navigation.topbar = [];
    window.Minds.notifications_count = 0;
    const entity: any = {
      guid: 123,
    };

    service.listen();
    jasmine.clock().tick(10);
    expect(socketMock.subscribe).toHaveBeenCalled();
    service.increment(4);

    expect(window.Minds.notifications_count).toBe(4);
  }));
});
