import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-register',
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
            <mat-icon class="title-icon">person_add</mat-icon>
            Inscription
          </mat-card-title>
          <mat-card-subtitle>Créez votre compte gratuitement</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nom d'utilisateur</mat-label>
              <input matInput formControlName="username"
                     placeholder="john_doe" autocomplete="username" />
              <mat-icon matSuffix>badge</mat-icon>
              @if (form.get('username')?.hasError('required') && form.get('username')?.touched) {
                <mat-error>Le nom d'utilisateur est requis.</mat-error>
              } @else if (form.get('username')?.hasError('minlength') && form.get('username')?.touched) {
                <mat-error>Minimum 3 caractères.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse email</mat-label>
              <input matInput type="email" formControlName="email"
                     placeholder="vous@exemple.com" autocomplete="email"
                     [readonly]="emailFromInvite" />
              <mat-icon matSuffix>{{ emailFromInvite ? 'lock' : 'email' }}</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>L'email est requis.</mat-error>
              } @else if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Format d'email invalide.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'"
                     formControlName="password" autocomplete="new-password" />
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
                Inscription...
              } @else {
                <mat-icon>person_add</mat-icon>
                Créer mon compte
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <span class="redirect-hint">Déjà un compte ?</span>
          <a mat-button color="accent" routerLink="/login">Se connecter</a>
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
      font-size: 1.6rem !important;
      font-weight: 700 !important;
      color: #0f172a;
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
      color: #64748b !important;
      margin-top: 4px !important;
    }

    mat-card-content { padding: 20px 32px 8px; }

    .full-width { width: 100%; }

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

    .error-message {
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
    }

    mat-card-actions {
      padding: 8px 32px 24px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .redirect-hint { color: #64748b; font-size: 0.875rem; }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  hidePassword = true;
  loading = false;
  errorMessage = '';
  emailFromInvite = false;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.get('email')!.setValue(email);
      this.form.get('email')!.disable();
      this.emailFromInvite = true;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, email, password } = this.form.getRawValue();

    this.authService.register({ username: username!, email: email!, password: password! }).pipe(
      catchError(err => {
        const msg = err?.error?.message ?? 'Une erreur est survenue lors de l\'inscription.';
        this.errorMessage = msg;
        this.snackBar.open(msg, 'Fermer', { duration: 4000, panelClass: 'snack-error' });
        return of(null);
      }),
      finalize(() => { this.loading = false; }),
    ).subscribe(res => {
      if (res) {
        this.snackBar.open(`Compte créé ! Bienvenue, ${res.username} !`, '', { duration: 3000 });
        this.router.navigate(['/tasks']);
      }
    });
  }
}
