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
  host: { 'data-theme': 'light' },
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
            <h1 class="left-h1">Vos projets,<br><span class="left-h1-accent">sous contrôle.</span></h1>
            <p class="left-sub">
              Un kanban full-stack conçu pour montrer ce qu'Angular 17
              et Spring Boot peuvent faire ensemble.
            </p>

            <div class="stack-pills">
              <span class="s-pill">Angular 17</span>
              <span class="s-pill">Spring Boot</span>
              <span class="s-pill">PostgreSQL</span>
            </div>

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

        </div>
      </aside>

      <!-- ── RIGHT PANEL — Form ── -->
      <main class="right-panel">

        <div class="rp-center">
        <div class="form-wrap" [@formStagger]>

          <div class="f-item form-header">
            <div class="form-eyebrow">
              <span class="status-ping">
                <span class="status-ping-anim"></span>
                <span class="status-ping-core"></span>
              </span>
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
      grid-template-columns: minmax(420px, 1fr) 3fr;
      min-height: 100dvh;
      background: #FDFCFC;
      font-family: 'Inter', 'Outfit', system-ui, -apple-system, sans-serif;
      color: #2F3035;
    }

    /* ─────────────────────────────────────────────────────────────
       LEFT PANEL — Argumentaire (dark gradient)
       ───────────────────────────────────────────────────────────── */
    .left-panel {
      position: relative;
      overflow: hidden;
      background: linear-gradient(155deg, #0F172A 0%, #1A2236 55%, #1E293B 100%);
      display: flex;
      flex-direction: column;
    }
    /* Decorative orange glow blob */
    .left-panel::before {
      content: '';
      position: absolute;
      top: -180px; left: -140px;
      width: 520px; height: 520px;
      background: radial-gradient(circle, rgba(248,121,65,0.18) 0%, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(20px);
    }
    .left-panel::after {
      content: '';
      position: absolute;
      bottom: -160px; right: -120px;
      width: 480px; height: 480px;
      background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      filter: blur(20px);
    }

    .left-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 44px 56px;
    }

    /* Brand */
    .brand { text-decoration: none; display: inline-block; margin-bottom: auto; }
    .brand-logo {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #F87941 0%, #F9B095 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .left-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 56px 0 40px;
      max-width: 460px;
    }

    .left-h1 {
      font-size: clamp(2.5rem, 4vw, 3.5rem);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.045em;
      color: #F8FAFC;
      margin: 0 0 22px;
    }
    .left-h1-accent {
      background: linear-gradient(135deg, #F87941 0%, #F9B095 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      display: inline-block;
    }

    .left-sub {
      font-size: 15px;
      line-height: 1.65;
      color: #CBD5E1;
      max-width: 380px;
      margin: 0 0 28px;
      font-weight: 400;
    }

    /* Stack pills (glassmorphism, just under sub) */
    .stack-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    .s-pill {
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: #E2E8F0;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.14);
      padding: 6px 14px;
      border-radius: 999px;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
    }
    .s-pill:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(248,121,65,0.4);
      transform: translateY(-1px);
    }

    /* Feature list (orange accent checks) */
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13.5px;
      color: rgba(226,232,240,0.78);
      font-weight: 400;
    }
    .feature-check {
      width: 22px; height: 22px;
      border-radius: 7px;
      background: rgba(248,121,65,0.12);
      border: 1px solid rgba(248,121,65,0.35);
      color: #F87941;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 12px rgba(248,121,65,0.15);
    }

    /* ─────────────────────────────────────────────────────────────
       RIGHT PANEL — Form (white SaaS premium)
       ───────────────────────────────────────────────────────────── */
    .right-panel {
      background: #FDFCFC;
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
      padding: 56px 32px;
    }

    .form-wrap {
      width: 100%;
      max-width: 480px;
      background: #FFFFFF;
      border-radius: 2.5rem;
      padding: 48px 44px;
      box-shadow: 0 30px 80px -20px rgba(15, 23, 42, 0.12),
                  0 12px 40px -12px rgba(15, 23, 42, 0.06),
                  0 0 0 1px rgba(15, 23, 42, 0.03);
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .form-header { text-align: center; }

    /* Server status — animate-ping pattern */
    .form-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 18px;
    }
    .status-ping {
      position: relative;
      display: inline-flex;
      width: 9px; height: 9px;
    }
    .status-ping-anim {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22C55E;
      opacity: 0.75;
      animation: pingAnim 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .status-ping-core {
      position: relative;
      display: inline-flex;
      width: 9px; height: 9px;
      border-radius: 50%;
      background: #16A34A;
    }
    @keyframes pingAnim {
      0%   { transform: scale(1);    opacity: 0.75; }
      75%, 100% { transform: scale(2.4); opacity: 0; }
    }

    .form-title {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.045em;
      color: #0F172A;
      margin: 0 0 10px;
      line-height: 1.1;
    }
    .form-sub {
      font-size: 14px;
      color: #64748B;
      line-height: 1.55;
      margin: 0;
    }

    /* ── Form body ── */
    .form-body { display: flex; flex-direction: column; gap: 20px; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }

    .field-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
      letter-spacing: 0.005em;
    }
    .field-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .forgot-link {
      font-size: 12.5px;
      font-weight: 600;
      color: #F87941;
      text-decoration: none;
      transition: color 0.15s;
    }
    .forgot-link:hover { color: #EA580C; }

    .field-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 0 16px;
      height: 50px;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .field-wrap.field-focus {
      border-color: #F87941;
      background: #FFFFFF;
      box-shadow: 0 0 0 4px rgba(248,121,65,0.12);
    }
    .field-wrap.field-error {
      border-color: #FCA5A5;
      background: rgba(248,113,113,0.04);
    }

    .field-icon { color: #94A3B8; flex-shrink: 0; }

    .field-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-size: 14.5px;
      color: #0F172A;
      caret-color: #F87941;
      font-weight: 500;
    }
    .field-input::placeholder { color: #94A3B8; font-weight: 400; }

    .toggle-btn {
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
      color: #94A3B8;
      display: flex;
      align-items: center;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .toggle-btn:hover { color: #0F172A; background: rgba(15,23,42,0.05); }

    .field-err-msg {
      font-size: 12px;
      color: #DC2626;
      padding-left: 4px;
      font-weight: 500;
    }

    /* ── Banners ── */
    .warmup-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(248,121,65,0.06);
      border: 1px solid rgba(248,121,65,0.18);
      border-radius: 12px;
      padding: 11px 14px;
      font-size: 12.5px;
      color: #B45309;
      animation: fadeSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .warmup-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(248,121,65,0.2);
      border-top-color: #F87941;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      flex-shrink: 0;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(248,113,113,0.07);
      border: 1px solid rgba(248,113,113,0.22);
      border-radius: 12px;
      padding: 11px 14px;
      font-size: 12.5px;
      color: #DC2626;
      font-weight: 500;
      animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Submit button (black, hover scale) ── */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 52px;
      margin-top: 6px;
      background: #0F172A;
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 600;
      letter-spacing: 0.005em;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: background 0.2s ease-out, transform 0.2s ease-out, box-shadow 0.2s ease-out;
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.18);
    }
    .submit-btn:hover:not(:disabled) {
      background: #1E293B;
      transform: scale(1.02);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.28);
    }
    .submit-btn:active:not(:disabled) { transform: scale(0.99); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Form separator ── */
    .form-sep {
      height: 1px;
      background: #E2E8F0;
    }

    /* ── Register row ── */
    .register-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .register-hint { font-size: 13.5px; color: #64748B; }
    .register-link {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
      text-decoration: none;
      transition: color 0.15s;
    }
    .register-link:hover { color: #F87941; }

    /* ── Footer (très discret) ── */
    .rp-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 44px;
    }
    .rp-footer-copy {
      font-size: 11.5px;
      color: #94A3B8;
      font-weight: 500;
    }
    .rp-footer-links { display: flex; align-items: center; gap: 10px; }
    .rp-footer-a {
      font-size: 11.5px;
      color: #94A3B8;
      text-decoration: none;
      transition: color 0.15s;
      font-weight: 500;
    }
    .rp-footer-a:hover { color: #475569; }
    .rp-footer-dot {
      width: 3px; height: 3px;
      border-radius: 50%;
      background: #CBD5E1;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .page { grid-template-columns: 1fr; }
      .left-panel { display: none; }
      .rp-center { padding: 60px 20px 40px; align-items: flex-start; }
      .form-wrap { max-width: 100%; padding: 36px 28px; border-radius: 2rem; }
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
