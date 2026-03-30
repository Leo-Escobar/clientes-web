import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

const requireAuth = (url: string): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: url },
  });
};

export const authGuard: CanActivateFn = (_, state) => requireAuth(state.url);

export const authChildGuard: CanActivateChildFn = (_, state) => requireAuth(state.url);
