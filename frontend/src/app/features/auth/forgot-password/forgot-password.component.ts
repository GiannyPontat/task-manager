import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="title-icon">lock_reset</mat-icon>
            Mot de passe oublié
          </mat-card-title>
          <mat-card-subtitle>Recevez un lien de réinitialisation par email</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (sent()) {
            <div class="success-box">
              <mat-icon>mark_email_read</mat-icon>
              <p>Si cet email est associé à un compte, vous recevrez un lien dans quelques minutes. Pensez à vérifier vos spams.</p>
            </div>
          } @else {
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

              <button mat-raised-button type="submit" class="full-width submit-btn"
                      [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Envoi en cours…
                } @else {
                  <mat-icon>send</mat-icon>
                  Envoyer le lien
                }
              </button>
            </form>
          }
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/login" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Retour à la connexion
          </a>
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
      font-size: 1.4rem !important;
      font-weight: 700 !important;
      color: #0f172a;
    }

    .title-icon {
      width: 40px; height: 40px; font-size: 22px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    }

    :host ::ng-deep mat-card-subtitle {
      font-size: 0.88rem !important;
      color: #64748b !important;
      margin-top: 4px !important;
    }

    mat-card-content { padding: 20px 32px 8px; }

    .full-width { width: 100%; }

    .submit-btn {
      margin-top: 8px;
      height: 48px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 10px !important;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
    }

    .success-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      text-align: center;
      mat-icon { color: #16a34a; font-size: 36px; width: 36px; height: 36px; }
      p { color: #15803d; font-size: 0.88rem; line-height: 1.5; margin: 0; }
    }

    mat-card-actions { padding: 8px 32px 24px; }

    .back-link { color: #6366f1; font-weight: 500; }
  `],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loading = signal(false);
  sent    = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.forgotPassword(this.form.value.email!).pipe(
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    ).subscribe(() => this.sent.set(true));
  }
}
