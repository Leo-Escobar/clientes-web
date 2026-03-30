import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthSession, LoginCredentials } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'clientes.auth';
  private readonly sessionState = signal<AuthSession | null>(this.readSession());

  readonly session = this.sessionState.asReadonly();

  login(credentials: LoginCredentials): Observable<AuthSession> {
    console.info(`[AuthService] Intentando iniciar sesion con ${credentials.nombreUsuario}.`);

    return this.http
      .post<AuthSession>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((session) => {
          console.info(`[AuthService] Sesion iniciada para ${session.nombreUsuario}.`);
          this.storeSession(session);
        }),
      );
  }

  logout(): void {
    const currentSession = this.sessionState();
    console.info(
      `[AuthService] Cerrando sesion${currentSession ? ` de ${currentSession.nombreUsuario}` : ''}.`,
    );
    localStorage.removeItem(this.storageKey);
    this.sessionState.set(null);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getToken(): string | null {
    return this.sessionState()?.token ?? null;
  }

  private storeSession(session: AuthSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readSession(): AuthSession | null {
    const rawSession = localStorage.getItem(this.storageKey);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
