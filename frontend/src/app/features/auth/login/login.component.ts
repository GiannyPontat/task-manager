import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">login</mat-icon>
            Connexion
          </mat-card-title>
          <mat-card-subtitle>Accédez à vos tâches</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email"
                     placeholder="vous@exemple.com" autocomplete="email" />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>L'email est requis.</mat-error>
              } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Format d'email invalide.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword"
                      [attr.aria-label]="hidePassword ? 'Afficher' : 'Masquer'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Le mot de passe est requis.</mat-error>
              } @else if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Minimum 6 caractères.</mat-error>
              }
            </mat-form-field>

            @if (warmingUp()) {
              <div class="warmup-banner">
                <mat-spinner diameter="16" class="warmup-spinner"></mat-spinner>
                <span>Le serveur se réveille, merci de patienter&nbsp;☕</span>
              </div>
            }

            @if (errorMessage) {
              <p class="error-message">
                <mat-icon>error_outline</mat-icon>
                {{ errorMessage }}
              </p>
            }

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn"
                    [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                Connexion...
              } @else {
                <mat-icon>login</mat-icon>
                Se connecter
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions class="card-actions">
          <a mat-button class="forgot-link" routerLink="/forgot-password">Mot de passe oublié ?</a>
          <div class="register-row">
            <span class="redirect-hint">Pas encore de compte ?</span>
            <a mat-button color="accent" routerLink="/register">S'inscrire</a>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-main, #f8fafc);
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      border-radius: 16px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.09) !important;
      background: var(--bg-card, #fff) !important;
      border: 1px solid var(--border, #e2e8f0) !important;
    }

    mat-card-header { padding: 32px 32px 4px; }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: var(--text-main, #0f172a);
      letter-spacing: -0.5px;
    }

    .title-icon {
      width: 40px; height: 40px; font-size: 22px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    }

    :host ::ng-deep mat-card-subtitle {
      font-size: 0.9rem !important;
      color: var(--text-muted, #64748b) !important;
      margin-top: 4px !important;
    }

    mat-card-content { padding: 20px 32px 8px; }

    .full-width { width: 100%; }

    /* Theme-aware Material fields */
    :host ::ng-deep .full-width .mat-mdc-text-field-wrapper {
      background: var(--input-bg, #f8fafc) !important;
    }
    :host ::ng-deep .full-width .mdc-notched-outline__leading,
    :host ::ng-deep .full-width .mdc-notched-outline__notch,
    :host ::ng-deep .full-width .mdc-notched-outline__trailing {
      border-color: var(--border, #e2e8f0) !important;
    }
    :host ::ng-deep .full-width.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .full-width.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .full-width.mat-focused .mdc-notched-outline__trailing {
      border-color: rgba(99,102,241,0.7) !important;
    }
    :host ::ng-deep .full-width .mdc-floating-label,
    :host ::ng-deep .full-width .mat-mdc-form-field-label { color: var(--text-muted, #64748b) !important; }
    :host ::ng-deep .full-width input { color: var(--text-main, #0f172a) !important; caret-color: #6366f1; }
    :host ::ng-deep .full-width button mat-icon { color: var(--text-muted, #64748b); }

    .submit-btn {
      margin-top: 12px;
      height: 48px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 10px !important;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
      transition: box-shadow 0.2s, transform 0.15s;
      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(99,102,241,0.45) !important;
        transform: translateY(-1px);
      }
    }

    .btn-spinner { display: inline-block; }

    .warmup-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 0.83rem;
      color: var(--text-muted, #64748b);
      margin: 4px 0 8px;
      animation: fadeIn 0.4s ease;
    }

    .warmup-spinner { flex-shrink: 0; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ef4444;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.85rem;
      margin: 4px 0 8px;
    }

    .card-actions {
      padding: 4px 32px 24px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }

    .forgot-link { color: #6366f1 !important; font-size: 0.82rem !important; align-self: flex-end; }

    .register-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }

    .redirect-hint { color: var(--text-muted, #64748b); font-size: 0.875rem; }
  `],
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  hidePassword = true;
  loading = false;
  errorMessage = '';
  warmingUp = signal(false);
  private warmUpTimer: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.warmingUp.set(false);
    this.warmUpTimer = setTimeout(() => this.warmingUp.set(true), 5000);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).pipe(
      catchError(err => {
        const msg = err?.error?.message ?? 'Email ou mot de passe incorrect.';
        this.errorMessage = msg;
        this.snackBar.open(msg, 'Fermer', { duration: 4000, panelClass: 'snack-error' });
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.warmingUp.set(false);
        if (this.warmUpTimer) clearTimeout(this.warmUpTimer);
      }),
    ).subscribe(res => {
      if (res) {
        this.snackBar.open(`Bienvenue, ${res.username} !`, '', { duration: 3000 });
        this.router.navigate(['/tasks']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.warmUpTimer) clearTimeout(this.warmUpTimer);
  }
}
