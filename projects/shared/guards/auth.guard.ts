import {ActivatedRouteSnapshot, CanActivateFn, Router} from '@angular/router';
import {AuthService} from '@shared/services';
import {inject} from '@angular/core';
import {firstValueFrom} from 'rxjs';

export const AUTH_GUARD: CanActivateFn = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.user$);
  // Redirect to login if the user is not logged in
  if (!user) {
    await router.navigate(['/', 'login']);
    return false;
  }
  return true;
};
