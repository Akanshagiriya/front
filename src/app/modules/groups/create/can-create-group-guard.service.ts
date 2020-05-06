import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { FeaturesService } from '../../../services/features.service';
import { PermissionsService } from '../../../common/services/permissions/permissions.service';
import { Session } from '../../../services/session';
import { Flags } from '../../../common/services/permissions/flags';

@Injectable()
export class CanCreateGroupGuardService implements CanActivate {
  constructor(
    private router: Router,
    private featuresService: FeaturesService,
    private permissionsService: PermissionsService,
    private session: Session
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!this.session.getLoggedInUser()) {
      this.router.navigate(['/login']);
      return false;
    }
    if (this.featuresService.has('permissions')) {
      return this.permissionsService.canInteract(
        this.session.getLoggedInUser(),
        Flags.CREATE_GROUP
      );
    }
    return true;
  }
}