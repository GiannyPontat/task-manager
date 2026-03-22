import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
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
            <mat-icon class="title-icon">lock_open</mat-icon>
            Nouveau mot de passe
          </mat-card-title>
          <mat-card-subtitle>Choisissez un nouveau mot de passe sécurisé</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!token()) {
            <div class="error-box">
              <mat-icon>error_outline</mat-icon>
              <p>Lien invalide. Veuillez refaire une demande de réinitialisation.</p>
            </div>
          } @else if (done()) {
            <div class="success-box">
              <mat-icon>check_circle</mat-icon>
              <p>Mot de passe mis à jour avec succès !</p>
              <a mat-raised-button class="login-btn" routerLink="/login">Se connecter</a>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau mot de passe</mat-label>
                <input matInput [type]="hideNew ? 'password' : 'text'"
                       formControlName="newPassword" autocomplete="new-password" />
                <button mat-icon-button matSuffix type="button" (click)="hideNew = !hideNew">
                  <mat-icon>{{ hideNew ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
                  <mat-error>Minimum 6 caractères.</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmer le mot de passe</mat-label>
                <input matInput [type]="hideConfirm ? 'password' : 'text'"
                       formControlName="confirmPassword" autocomplete="new-password" />
                <button mat-icon-button matSuffix type="button" (click)="hideConfirm = !hideConfirm">
                  <mat-icon>{{ hideConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
                  <mat-error>Les mots de passe ne correspondent pas.</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <p class="error-msg">
                  <mat-icon>error_outline</mat-icon>
                  {{ errorMessage() }}
                </p>
              }

              <button mat-raised-button type="submit" class="full-width submit-btn"
                      [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  Mise à jour…
                } @else {
                  <mat-icon>save</mat-icon>
                  Mettre à jour
                }
              </button>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
      border-radius: 16px !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 20px 60px rgba(0,0,0,0.09) !important;
      border: 1px solid #e2e8f0;
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

    mat-card-content { padding: 20px 32px 16px; }
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

    .success-box, .error-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .success-box {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      mat-icon { color: #16a34a; font-size: 36px; width: 36px; height: 36px; }
      p { color: #15803d; font-size: 0.88rem; margin: 0; }
    }

    .error-box {
      background: #fef2f2; border: 1px solid #fecaca;
      mat-icon { color: #ef4444; font-size: 36px; width: 36px; height: 36px; }
      p { color: #b91c1c; font-size: 0.88rem; margin: 0; }
    }

    .login-btn {
      background: linear-gradient(135deg, #6366f1, #3b82f6) !important;
      color: #fff !important;
      border-radius: 8px !important;
    }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.85rem;
      margin: 4px 0 8px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
  `],
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  token        = signal<string | null>(null);
  loading      = signal(false);
  done         = signal(false);
  errorMessage = signal('');
  hideNew      = true;
  hideConfirm  = true;

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    this.token.set(this.route.snapshot.queryParamMap.get('token'));
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token()) return;
    this.loading.set(true);
    this.errorMessage.set('');
    this.authService.resetPassword(this.token()!, this.form.value.newPassword!).pipe(
      catchError(err => {
        this.errorMessage.set(err?.error?.message ?? 'Lien invalide ou expiré.');
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
    ).subscribe(res => {
      if (res !== null) this.done.set(true);
    });
  }
}
