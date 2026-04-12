import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  animations: [
    trigger('panelEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(28px)' }),
        animate('640ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('formStagger', [
      transition(':enter', [
        query('.f-item', [
          style({ opacity: 0, transform: 'translateY(18px)' }),
          stagger(65, [
            animate('520ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
  ],
  template: `
    <div class="page">

      <!-- ── LEFT PANEL ── -->
      <aside class="left-panel" [@panelEnter]>
        <div class="left-inner">

          <a routerLink="/" class="brand">
            <span class="brand-logo">Flowly</span>
          </a>

          <div class="left-body">
            <h1 class="left-h1">Vos projets,<br>sous contrôle.</h1>
            <p class="left-sub">
              Un kanban full-stack conçu pour montrer ce qu'Angular 17
              et Spring Boot peuvent faire ensemble.
            </p>

            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span>Authentification JWT + refresh tokens</span>
              </li>
              <li class="feature-item">
                <span class="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span>Board kanban avec drag-and-drop CDK</span>
              </li>
              <li class="feature-item">
                <span class="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span>Invitations par email via API Resend</span>
              </li>
              <li class="feature-item">
                <span class="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span>Déployé sur Render + Vercel</span>
              </li>
            </ul>
          </div>

          <div class="left-footer">
            <div class="stack-pills">
              <span class="s-pill">Angular 17</span>
              <span class="s-pill">Spring Boot</span>
              <span class="s-pill">PostgreSQL</span>
            </div>
          </div>

        </div>
      </aside>

      <!-- ── RIGHT PANEL — Form ── -->
      <main class="right-panel">

        <div class="rp-center">
        <div class="form-wrap" [@formStagger]>

          <div class="f-item form-header">
            <div class="form-eyebrow">
              <span class="status-dot"></span>
              Serveur actif
            </div>
            <h2 class="form-title">Bon retour.</h2>
            <p class="form-sub">Connectez-vous pour accéder à votre workspace.</p>
          </div>

          <form class="f-item form-body" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <!-- Email -->
            <div class="field-group">
              <label class="field-label" for="email">Adresse email</label>
              <div class="field-wrap" [class.field-error]="emailErr" [class.field-focus]="emailFocused">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  class="field-input"
                  formControlName="email"
                  placeholder="vous&#64;exemple.com"
                  autocomplete="email"
                  (focus)="emailFocused = true"
                  (blur)="emailFocused = false"
                />
              </div>
              @if (emailErr) {
                <span class="field-err-msg">
                  {{ form.get('email')?.hasError('required') ? 'Email requis.' : 'Format invalide.' }}
                </span>
              }
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label" for="password">Mot de passe</label>
                <a routerLink="/forgot-password" class="forgot-link">Oublié ?</a>
              </div>
              <div class="field-wrap" [class.field-error]="passwordErr" [class.field-focus]="passwordFocused">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="field-input"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  (focus)="passwordFocused = true"
                  (blur)="passwordFocused = false"
                />
                <button type="button" class="toggle-btn" (click)="showPassword = !showPassword"
                        [attr.aria-label]="showPassword ? 'Masquer' : 'Afficher'">
                  @if (showPassword) {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
                </button>
              </div>
              @if (passwordErr) {
                <span class="field-err-msg">
                  {{ form.get('password')?.hasError('required') ? 'Mot de passe requis.' : 'Minimum 6 caractères.' }}
                </span>
              }
            </div>

            <!-- Warmup banner -->
            @if (warmingUp()) {
              <div class="warmup-banner">
                <span class="warmup-spinner"></span>
                <span>Le serveur se réveille, merci de patienter...</span>
              </div>
            }

            <!-- Error message -->
            @if (errorMessage) {
              <div class="error-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage }}
              </div>
            }

            <!-- Submit -->
            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              @if (loading) {
                <span class="btn-spinner"></span>
                <span>Connexion...</span>
              } @else {
                <span>Se connecter</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              }
            </button>

          </form>

          <!-- Separator -->
          <div class="f-item form-sep"></div>

          <!-- Register link -->
          <div class="f-item register-row">
            <span class="register-hint">Pas encore de compte ?</span>
            <a routerLink="/register" class="register-link">Créer un compte</a>
          </div>

        </div>
        </div>

        <!-- Footer -->
        <footer class="rp-footer">
          <span class="rp-footer-copy">© 2025 Flowly</span>
          <div class="rp-footer-links">
            <a href="https://github.com/GiannyPontat/task-manager" target="_blank" rel="noopener" class="rp-footer-a">GitHub</a>
            <span class="rp-footer-dot"></span>
            <a routerLink="/" class="rp-footer-a">Accueil</a>
          </div>
        </footer>

      </main>

    </div>
  `,
  styles: [`
    /* ── Page layout ── */
    .page {
      display: grid;
      grid-template-columns: 420px 1fr;
      min-height: 100dvh;
      background: #090f1a;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      color: #e2e8f0;
      --accent: #3b82f6;
      --border: rgba(255,255,255,0.08);
      --border-focus: rgba(59,130,246,0.5);
      --glass: rgba(255,255,255,0.04);
      --muted: rgba(226,232,240,0.6);
      --error: #f87171;
    }

    /* ── Left panel ── */
    .left-panel {
      background: linear-gradient(160deg, rgba(59,130,246,0.08) 0%, rgba(9,15,26,0.95) 60%);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .left-panel::before {
      content: '';
      position: absolute;
      top: -160px;
      left: -120px;
      width: 500px;
      height: 500px;
      background: radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    .left-panel::after {
      content: '';
      position: absolute;
      bottom: -100px;
      right: -80px;
      width: 360px;
      height: 360px;
      background: radial-gradient(ellipse, rgba(14,165,233,0.1) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .left-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 36px 40px;
    }

    .brand { text-decoration: none; display: inline-block; margin-bottom: auto; }
    .brand-logo {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
    }

    .left-body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 0 32px; }

    .left-h1 {
      font-size: clamp(1.9rem, 2.5vw, 2.4rem);
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.04em;
      color: #f1f5f9;
      margin: 0 0 16px;
    }
    .left-sub {
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--muted);
      max-width: 300px;
      margin: 0 0 36px;
    }

    .feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: rgba(226,232,240,0.65);
    }
    .feature-check {
      width: 22px; height: 22px;
      border-radius: 7px;
      background: rgba(59,130,246,0.12);
      border: 1px solid rgba(59,130,246,0.22);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .left-footer { padding-top: 32px; border-top: 1px solid var(--border); }
    .stack-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .s-pill {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--muted);
      background: var(--glass);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 999px;
    }

    /* ── Right panel ── */
    .right-panel {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;
      padding: 0;
    }

    .rp-center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
    }

    .form-wrap {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* ── Footer ── */
    .rp-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 40px;
      border-top: 1px solid var(--border);
    }
    .rp-footer-copy {
      font-size: 11.5px;
      color: rgba(226,232,240,0.5);
    }
    .rp-footer-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .rp-footer-a {
      font-size: 11.5px;
      color: rgba(226,232,240,0.65);
      text-decoration: none;
      transition: color 0.15s;
    }
    .rp-footer-a:hover { color: rgba(226,232,240,0.9); }
    .rp-footer-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: rgba(226,232,240,0.2);
    }

    /* ── Form separator ── */
    .form-sep {
      height: 1px;
      background: var(--border);
    }

    .form-header { text-align: center; }

    .form-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #4ade80;
      animation: pulse-green 2.5s ease-in-out infinite;
    }
    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
      50%       { box-shadow: 0 0 0 4px rgba(74,222,128,0); }
    }

    .form-title {
      font-size: 1.9rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: #f1f5f9;
      margin: 0 0 8px;
    }
    .form-sub {
      font-size: 13.5px;
      color: var(--muted);
      line-height: 1.5;
      margin: 0;
    }

    /* ── Form body ── */
    .form-body { display: flex; flex-direction: column; gap: 18px; }

    .field-group { display: flex; flex-direction: column; gap: 6px; }

    .field-label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(226,232,240,0.75);
      letter-spacing: 0.01em;
    }
    .field-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .forgot-link {
      font-size: 12px;
      color: var(--accent);
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.15s;
    }
    .forgot-link:hover { opacity: 1; }

    .field-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 11px;
      padding: 0 14px;
      height: 46px;
      transition: border-color 0.2s, background 0.2s,
                  box-shadow 0.2s;
    }
    .field-wrap.field-focus {
      border-color: var(--border-focus);
      background: rgba(59,130,246,0.04);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    }
    .field-wrap.field-error {
      border-color: rgba(248,113,113,0.5);
      background: rgba(248,113,113,0.04);
    }

    .field-icon { color: var(--muted); flex-shrink: 0; }

    .field-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 14px;
      color: #e2e8f0;
      caret-color: var(--accent);
    }
    .field-input::placeholder { color: rgba(226,232,240,0.4); }

    .toggle-btn {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--muted);
      display: flex;
      align-items: center;
      border-radius: 5px;
      transition: color 0.15s, background 0.15s;
    }
    .toggle-btn:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }

    .field-err-msg {
      font-size: 11.5px;
      color: var(--error);
      padding-left: 4px;
    }

    /* ── Banners ── */
    .warmup-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(59,130,246,0.07);
      border: 1px solid rgba(59,130,246,0.15);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12.5px;
      color: rgba(226,232,240,0.6);
      animation: fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .warmup-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(59,130,246,0.25);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      flex-shrink: 0;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(248,113,113,0.07);
      border: 1px solid rgba(248,113,113,0.2);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12.5px;
      color: #fca5a5;
      animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Submit button ── */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 48px;
      margin-top: 4px;
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 12px;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px rgba(59,130,246,0.3);
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.08);
      transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .submit-btn:hover:not(:disabled) {
      opacity: 0.93;
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(59,130,246,0.42);
    }
    .submit-btn:hover:not(:disabled)::before { transform: translateX(0); }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Register row ── */
    .register-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .register-hint { font-size: 13px; color: var(--muted); }
    .register-link {
      font-size: 13px;
      font-weight: 600;
      color: var(--accent);
      text-decoration: none;
      transition: opacity 0.15s;
    }
    .register-link:hover { opacity: 0.8; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .page { grid-template-columns: 1fr; }
      .left-panel { display: none; }
      .rp-center { padding: 80px 20px 40px; align-items: flex-start; }
      .form-wrap { max-width: 100%; }
      .rp-footer { padding: 14px 20px; }
    }
  `],
})
export class LoginComponent implements OnDestroy {
  private readonly fb     = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  showPassword   = false;
  emailFocused   = false;
  passwordFocused = false;
  loading        = false;
  errorMessage   = '';
  warmingUp      = signal(false);
  private warmUpTimer: ReturnType<typeof setTimeout> | null = null;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailErr(): boolean {
    const c = this.form.get('email');
    return !!(c?.invalid && c?.touched);
  }
  get passwordErr(): boolean {
    const c = this.form.get('password');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.errorMessage = '';
    this.warmingUp.set(false);
    this.warmUpTimer = setTimeout(() => this.warmingUp.set(true), 5000);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).pipe(
      catchError(err => {
        this.errorMessage = err?.error?.message ?? 'Email ou mot de passe incorrect.';
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
        this.warmingUp.set(false);
        if (this.warmUpTimer) clearTimeout(this.warmUpTimer);
      }),
    ).subscribe(res => {
      if (res) {
        this.snackBar.open(`Bienvenue, ${res.username}\u00a0!`, '', { duration: 3000 });
        this.router.navigate(['/tasks']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.warmUpTimer) clearTimeout(this.warmUpTimer);
  }
}
