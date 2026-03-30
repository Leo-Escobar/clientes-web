import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    nombreUsuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl('/clientes');
    }
  }

  protected submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.getRedirectUrl());
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible iniciar sesion.');
        },
      });
  }

  protected hasError(controlName: 'nombreUsuario' | 'contrasena'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && control.touched;
  }

  private getRedirectUrl(): string {
    const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo');

    if (redirectTo?.startsWith('/')) {
      return redirectTo;
    }

    return '/clientes';
  }
}
