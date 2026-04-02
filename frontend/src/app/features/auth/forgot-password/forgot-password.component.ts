import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-forgot-password',
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
            <span class="brand-tag">Réinitialisation</span>
          </div>

          @if (sent()) {
            <!-- Success state -->
            <div class="f-item success-state">
              <div class="success-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 class="card-title">Email envoyé.</h1>
              <p class="card-sub">
                Si cet email est associé à un compte, vous recevrez un lien dans quelques minutes.
                Pensez à vérifier vos spams.
              </p>
              <a routerLink="/login" class="back-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Retour à la connexion
              </a>
            </div>

          } @else {
            <!-- Header -->
            <div class="f-item">
              <h1 class="card-title">Mot de passe oublié.</h1>
              <p class="card-sub">Entrez votre email pour recevoir un lien de réinitialisation.</p>
            </div>

            <!-- Form -->
            <form class="f-item card-form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              <div class="field-group">
                <label class="field-label" for="fp-email">Adresse email</label>
                <div class="field-wrap" [class.field-focus]="emailFocused" [class.field-error]="emailErr">
                  <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input id="fp-email" type="email" class="field-input" formControlName="email"
                    placeholder="vous&#64;exemple.com" autocomplete="email"
                    (focus)="emailFocused=true" (blur)="emailFocused=false" />
                </div>
                @if (emailErr) {
                  <span class="field-err-msg">
                    {{ form.get('email')?.hasError('required') ? 'Email requis.' : 'Format invalide.' }}
                  </span>
                }
              </div>

              <button type="submit" class="submit-btn" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  <span class="btn-spinner"></span><span>Envoi...</span>
                } @else {
                  <span>Envoyer le lien</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                }
              </button>
            </form>

            <div class="f-item form-sep"></div>

            <div class="f-item back-row">
              <a routerLink="/login" class="back-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Retour à la connexion
              </a>
            </div>
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
      --accent: #3b82f6;
      --border: rgba(255,255,255,0.08);
      --border-focus: rgba(59,130,246,0.5);
      --muted: rgba(226,232,240,0.45);
      --error: #f87171;
    }

    .blob { position: fixed; border-radius: 50%; pointer-events: none; }
    .blob-1 {
      width: 500px; height: 500px; top: -200px; left: -150px;
      background: radial-gradient(ellipse, rgba(59,130,246,0.14) 0%, transparent 70%);
    }
    .blob-2 {
      width: 400px; height: 400px; bottom: -150px; right: -100px;
      background: radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 70%);
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
    .brand-tag { font-size: 12px; color: var(--muted); }

    .card-title { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.04em; color: #f1f5f9; margin: 0 0 8px; }
    .card-sub { font-size: 13.5px; color: var(--muted); margin: 0; line-height: 1.6; }

    /* Success state */
    .success-state { display: flex; flex-direction: column; gap: 14px; }
    .success-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.2);
      color: #4ade80; display: flex; align-items: center; justify-content: center;
    }
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      margin-top: 4px; padding: 10px 18px;
      background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 10px; text-decoration: none;
      font-size: 13px; font-weight: 600; color: rgba(226,232,240,0.7);
      transition: background 0.15s, color 0.15s; align-self: flex-start;
    }
    .back-btn:hover { background: rgba(255,255,255,0.09); color: #e2e8f0; }

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
      border-color: var(--border-focus); background: rgba(59,130,246,0.04);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    }
    .field-wrap.field-error { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.04); }

    .field-icon { color: var(--muted); flex-shrink: 0; }
    .field-input {
      flex: 1; background: transparent; border: none; outline: none;
      font-family: 'Outfit', system-ui, sans-serif; font-size: 14px;
      color: #e2e8f0; caret-color: var(--accent);
    }
    .field-input::placeholder { color: rgba(226,232,240,0.2); }
    .field-err-msg { font-size: 11.5px; color: var(--error); padding-left: 4px; }

    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; height: 48px; margin-top: 4px;
      background: var(--accent); color: #fff; border: none; border-radius: 12px;
      font-family: 'Outfit', system-ui, sans-serif; font-size: 14px; font-weight: 600; cursor: pointer;
      position: relative; overflow: hidden;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px rgba(59,130,246,0.3);
    }
    .submit-btn::before {
      content: ''; position: absolute; inset: 0;
      background: rgba(255,255,255,0.08); transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.93; transform: translateY(-2px); box-shadow: 0 6px 28px rgba(59,130,246,0.42); }
    .submit-btn:hover:not(:disabled)::before { transform: translateX(0); }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .form-sep { height: 1px; background: var(--border); }
    .back-row { display: flex; align-items: center; }
    .back-link {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 500; color: var(--muted);
      text-decoration: none; transition: color 0.15s;
    }
    .back-link:hover { color: #e2e8f0; }

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
export class ForgotPasswordComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  emailFocused = false;
  loading = signal(false);
  sent    = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailErr(): boolean {
    const c = this.form.get('email');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.forgotPassword(this.form.value.email!).pipe(
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    ).subscribe(() => this.sent.set(true));
  }
}
