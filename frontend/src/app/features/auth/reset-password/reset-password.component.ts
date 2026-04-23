import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const pwd     = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pwd && confirm && pwd !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  animations: [
    trigger('formStagger', [
      transition(':enter', [
        query('.f-item', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(65, [animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))])
        ], { optional: true })
      ])
    ]),
  ],
  template: `
    <div class="page">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <div class="page-center">
        <div class="card" [@formStagger]>

          <!-- Brand -->
          <div class="f-item card-brand">
            <a routerLink="/" class="brand-logo">Flowly</a>
            <span class="brand-sep"></span>
            <span class="brand-tag">Nouveau mot de passe</span>
          </div>

          @if (!token()) {
            <!-- Invalid token -->
            <div class="f-item error-state">
              <div class="state-icon state-icon--error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h1 class="card-title">Lien invalide.</h1>
              <p class="card-sub">Ce lien est invalide ou a expiré. Veuillez refaire une demande.</p>
              <a routerLink="/forgot-password" class="action-btn">
                Nouvelle demande
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

          } @else if (done()) {
            <!-- Success state -->
            <div class="f-item success-state">
              <div class="state-icon state-icon--success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 class="card-title">Mot de passe mis à jour.</h1>
              <p class="card-sub">Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.</p>
              <a routerLink="/login" class="action-btn">
                Se connecter
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

          } @else {
            <!-- Header -->
            <div class="f-item">
              <h1 class="card-title">Nouveau mot de passe.</h1>
              <p class="card-sub">Choisissez un mot de passe sécurisé pour votre compte.</p>
            </div>

            <!-- Form -->
            <form class="f-item card-form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

              <!-- New password -->
              <div class="field-group">
                <label class="field-label" for="new-password">Nouveau mot de passe</label>
                <div class="field-wrap" [class.field-focus]="newFocused" [class.field-error]="newErr">
                  <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input id="new-password" [type]="hideNew ? 'password' : 'text'" class="field-input"
                    formControlName="newPassword" autocomplete="new-password"
                    (focus)="newFocused=true" (blur)="newFocused=false" />
                  <button type="button" class="toggle-btn" (click)="hideNew = !hideNew">
                    @if (!hideNew) {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    } @else {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (newErr) {
                  <span class="field-err-msg">Minimum 6 caractères.</span>
                }
              </div>

              <!-- Confirm password -->
              <div class="field-group">
                <label class="field-label" for="confirm-password">Confirmer le mot de passe</label>
                <div class="field-wrap" [class.field-focus]="confirmFocused" [class.field-error]="confirmErr">
                  <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <input id="confirm-password" [type]="hideConfirm ? 'password' : 'text'" class="field-input"
                    formControlName="confirmPassword" autocomplete="new-password"
                    (focus)="confirmFocused=true" (blur)="confirmFocused=false" />
                  <button type="button" class="toggle-btn" (click)="hideConfirm = !hideConfirm">
                    @if (!hideConfirm) {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    } @else {
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    }
                  </button>
                </div>
                @if (confirmErr) {
                  <span class="field-err-msg">Les mots de passe ne correspondent pas.</span>
                }
              </div>

              <!-- Error banner -->
              @if (errorMessage()) {
                <div class="error-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {{ errorMessage() }}
                </div>
              }

              <!-- Submit -->
              <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <span class="btn-spinner"></span><span>Mise à jour...</span>
                } @else {
                  <span>Mettre à jour</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                }
              </button>
            </form>
          }

        </div>
      </div>

      <footer class="page-footer">
        <span class="footer-copy">© 2025 Flowly</span>
        <div class="footer-links">
          <a href="https://github.com/GiannyPontat/task-manager" target="_blank" rel="noopener" class="footer-a">GitHub</a>
          <span class="footer-dot"></span>
          <a routerLink="/" class="footer-a">Accueil</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      background: #090f1a;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      color: #e2e8f0;
      position: relative;
      overflow: hidden;
      --accent: #4048E7;
      --accent-shadow: rgba(64,72,231,0.3);
      --accent-shadow-hover: rgba(64,72,231,0.48);
      --field-focus-bg: rgba(64,72,231,0.07);
      --field-focus-ring: rgba(64,72,231,0.14);
      --border: rgba(255,255,255,0.08);
      --border-focus: rgba(64,72,231,0.5);
      --text-muted: rgba(226,232,240,0.45);
      --error: #f87171;
    }

    .blob { position: fixed; border-radius: 50%; pointer-events: none; }
    .blob-1 {
      width: 500px; height: 500px; top: -200px; left: -150px;
      background: radial-gradient(ellipse, rgba(64,72,231,0.2) 0%, transparent 70%);
    }
    .blob-2 {
      width: 400px; height: 400px; bottom: -150px; right: -100px;
      background: radial-gradient(ellipse, rgba(94,93,130,0.12) 0%, transparent 70%);
    }

    .page-center {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 48px 24px; position: relative; z-index: 1;
    }

    .card {
      width: 100%; max-width: 420px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 36px 40px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      display: flex; flex-direction: column; gap: 24px;
    }

    .card-brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { font-size: 1.05rem; font-weight: 700; color: var(--accent); letter-spacing: -0.02em; text-decoration: none; }
    .brand-sep { width: 1px; height: 16px; background: var(--border); }
    .brand-tag { font-size: 12px; color: var(--text-muted); }

    .card-title { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.04em; color: #f1f5f9; margin: 0 0 8px; }
    .card-sub { font-size: 13.5px; color: var(--text-muted); margin: 0; line-height: 1.6; }

    /* States */
    .success-state, .error-state { display: flex; flex-direction: column; gap: 12px; }

    .state-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .state-icon--success {
      background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2); color: #4ade80;
    }
    .state-icon--error {
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); color: #f87171;
    }

    .action-btn {
      display: inline-flex; align-items: center; gap: 8px;
      margin-top: 4px; padding: 11px 20px;
      background: var(--accent); color: var(--btn-text);
      border-radius: 11px; text-decoration: none;
      font-size: 13.5px; font-weight: 600;
      transition: opacity 0.15s, transform 0.15s;
      align-self: flex-start;
      box-shadow: 0 4px 16px var(--accent-shadow);
    }
    .action-btn:hover { opacity: 0.9; transform: translateY(-1px); }

    .card-form { display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 600; color: rgba(226,232,240,0.6); letter-spacing: 0.01em; }

    .field-wrap {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border);
      border-radius: 11px; padding: 0 14px; height: 46px;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .field-wrap.field-focus {
      border-color: var(--border-focus); background: var(--field-focus-bg);
      box-shadow: 0 0 0 3px var(--field-focus-ring);
    }
    .field-wrap.field-error { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.04); }

    .field-icon { color: var(--text-muted); flex-shrink: 0; }
    .field-input {
      flex: 1; background: transparent; border: none; outline: none;
      font-family: 'Outfit', system-ui, sans-serif; font-size: 14px;
      color: #e2e8f0; caret-color: var(--accent);
    }
    .field-input::placeholder { color: rgba(226,232,240,0.2); }
    .field-err-msg { font-size: 11.5px; color: var(--error); padding-left: 4px; }

    .toggle-btn {
      background: none; border: none; padding: 4px; cursor: pointer;
      color: var(--text-muted); display: flex; align-items: center;
      border-radius: 5px; transition: color 0.15s, background 0.15s;
    }
    .toggle-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.07); border: 1px solid rgba(248,113,113,0.2);
      border-radius: 10px; padding: 10px 14px;
      font-size: 12.5px; color: #fca5a5;
      animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; height: 48px; margin-top: 4px;
      background: var(--accent); color: var(--btn-text); border: none; border-radius: 12px;
      font-family: 'Outfit', system-ui, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
      position: relative; overflow: hidden;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px var(--accent-shadow);
    }
    .submit-btn::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(255,255,255,0.08); transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.93; transform: translateY(-2px); box-shadow: 0 6px 28px var(--accent-shadow-hover); }
    .submit-btn:hover:not(:disabled)::before { transform: translateX(0); }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: var(--btn-text);
      border-radius: 50%; animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .page-footer {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 40px; border-top: 1px solid var(--border);
    }
    .footer-copy { font-size: 11.5px; color: rgba(226,232,240,0.25); }
    .footer-links { display: flex; align-items: center; gap: 10px; }
    .footer-a { font-size: 11.5px; color: rgba(226,232,240,0.3); text-decoration: none; transition: color 0.15s; }
    .footer-a:hover { color: rgba(226,232,240,0.65); }
    .footer-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(226,232,240,0.2); }

    @media (max-width: 640px) {
      .page-center { padding: 32px 16px; }
      .card { padding: 28px 20px; }
      .page-footer { padding: 14px 20px; }
    }
  `],
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route       = inject(ActivatedRoute);
  private readonly router      = inject(Router);

  newFocused     = false;
  confirmFocused = false;
  hideNew        = true;
  hideConfirm    = true;
  token        = signal<string | null>(null);
  loading      = signal(false);
  done         = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  get newErr():     boolean { const c = this.form.get('newPassword');     return !!(c?.invalid && c?.touched); }
  get confirmErr(): boolean {
    const c = this.form.get('confirmPassword');
    return !!(this.form.hasError('mismatch') && c?.touched);
  }

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
