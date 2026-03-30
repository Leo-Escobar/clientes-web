import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isLoginRequest = request.url.endsWith('/auth/login');

  const requestToSend =
    token && isApiRequest && !isLoginRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(requestToSend).pipe(
    catchError((error) => {
      if (error.status === 401 && isApiRequest && !isLoginRequest) {
        authService.logout();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
