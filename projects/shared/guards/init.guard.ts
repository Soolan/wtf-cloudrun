import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '@shared/services';
import {inject} from '@angular/core';
import {firstValueFrom} from 'rxjs';

export const INIT_GUARD: CanActivateFn = async(): Promise<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await firstValueFrom(authService.user$);

  if (user) {
    await router.navigate(['/console']);
    return false;
  }
  return true;
};
