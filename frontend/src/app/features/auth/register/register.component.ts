import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, ReactiveFormsModule, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, finalize, of, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

const passwordsMatch: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw  = group.get('password')?.value  ?? '';
  const cpw = group.get('confirm')?.value ?? '';
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatSnackBarModule],
  animations: [
    trigger('formStagger', [
      transition(':enter', [
        query('.f-item', [
          style({ opacity: 0, transform: 'translateY(16px)' }),
          stagger(55, [animate('500ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))])
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
            <span class="brand-tag">Créer un compte</span>
          </div>

          <!-- Header -->
          <div class="f-item">
            <h1 class="card-title">Rejoignez Flowly.</h1>
            <p class="card-sub">Gérez vos projets et tâches en équipe.</p>
          </div>

          <!-- Form -->
          <form class="f-item card-form" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>

            <!-- Username -->
            <div class="field-group">
              <label class="field-label" for="username">Nom d'utilisateur</label>
              <div class="field-wrap" [class.field-focus]="usernameFocused" [class.field-error]="usernameErr">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input id="username" type="text" class="field-input" formControlName="username"
                  placeholder="votre_pseudo" autocomplete="username"
                  (focus)="usernameFocused=true" (blur)="usernameFocused=false" />
              </div>
              @if (usernameErr) {
                <span class="field-err-msg">
                  {{ f['username'].hasError('required') ? 'Nom requis.' : f['username'].hasError('minlength') ? 'Minimum 3 caractères.' : 'Maximum 50 caractères.' }}
                </span>
              }
            </div>

            <!-- Email -->
            <div class="field-group">
              <label class="field-label" for="reg-email">Adresse email</label>
              <div class="field-wrap" [class.field-focus]="emailFocused" [class.field-error]="emailErr" [class.field-locked]="emailFromInvite">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  @if (emailFromInvite) {
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  } @else {
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  }
                </svg>
                <input id="reg-email" type="email" class="field-input" formControlName="email"
                  placeholder="vous&#64;exemple.com" autocomplete="email" [readonly]="emailFromInvite"
                  (focus)="emailFocused=true" (blur)="emailFocused=false" />
              </div>
              @if (emailErr) {
                <span class="field-err-msg">{{ f['email'].hasError('required') ? 'Email requis.' : 'Format invalide.' }}</span>
              }
              @if (emailFromInvite) {
                <span class="field-hint">Email pré-rempli depuis votre invitation.</span>
              }
            </div>

            <!-- Password -->
            <div class="field-group">
              <label class="field-label" for="reg-password">Mot de passe</label>
              <div class="field-wrap" [class.field-focus]="passwordFocused" [class.field-error]="passwordErr">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input id="reg-password" [type]="showPassword ? 'text' : 'password'" class="field-input"
                  formControlName="password" autocomplete="new-password"
                  (focus)="passwordFocused=true" (blur)="passwordFocused=false" />
                <button type="button" class="toggle-btn" (click)="showPassword = !showPassword">
                  @if (showPassword) {
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
              @if (passwordErr) {
                <span class="field-err-msg">{{ f['password'].hasError('required') ? 'Mot de passe requis.' : 'Minimum 8 caractères.' }}</span>
              }
              @if (f['password'].value) {
                <div class="strength-wrap">
                  <div class="strength-bar">
                    @for (i of [0,1,2,3]; track i) {
                      <div class="strength-seg" [class]="i < strength() ? strengthClass() : ''"></div>
                    }
                  </div>
                  <span class="strength-label" [class]="strengthClass()">{{ strengthLabel() }}</span>
                </div>
              }
            </div>

            <!-- Confirm password -->
            <div class="field-group">
              <label class="field-label" for="reg-confirm">Confirmer le mot de passe</label>
              <div class="field-wrap" [class.field-focus]="confirmFocused" [class.field-error]="confirmErr">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <input id="reg-confirm" [type]="showConfirm ? 'text' : 'password'" class="field-input"
                  formControlName="confirm" autocomplete="new-password"
                  (focus)="confirmFocused=true" (blur)="confirmFocused=false" />
                <button type="button" class="toggle-btn" (click)="showConfirm = !showConfirm">
                  @if (showConfirm) {
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
                <span class="field-err-msg">
                  {{ f['confirm'].hasError('required') ? 'Confirmation requise.' : 'Les mots de passe ne correspondent pas.' }}
                </span>
              }
            </div>

            <!-- Error banner -->
            @if (errorMessage) {
              <div class="error-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ errorMessage }}
              </div>
            }

            <!-- Submit -->
            <button type="submit" class="submit-btn" [disabled]="form.invalid || loading">
              @if (loading) {
                <span class="btn-spinner"></span><span>Création...</span>
              } @else {
                <span>Créer mon compte</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              }
            </button>

          </form>

          <div class="f-item form-sep"></div>

          <div class="f-item login-row">
            <span class="login-hint">Déjà un compte ?</span>
            <a routerLink="/login" class="login-link">Se connecter</a>
          </div>

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
      background: var(--bg-app);
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      color: var(--text-main);
      position: relative;
      overflow: hidden;
      --accent: #3b82f6;
      --border: rgba(0,0,0,0.1);
      --border-focus: rgba(59,130,246,0.5);
      --glass: rgba(0,0,0,0.04);
      --muted: rgba(15,23,42,0.45);
      --error: #f87171;
    }

    :host-context([data-theme="dark"]) {
      --border: rgba(255,255,255,0.08);
      --glass: rgba(255,255,255,0.04);
      --muted: rgba(226,232,240,0.45);
      --field-label-color: rgba(226,232,240,0.6);
      --footer-copy-color: rgba(226,232,240,0.25);
      --field-bg: rgba(255,255,255,0.05);
      --toggle-hover-bg: rgba(255,255,255,0.08);
      --placeholder-color: rgba(226,232,240,0.25);
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
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      position: relative;
      z-index: 1;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 36px 40px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .card-brand { display: flex; align-items: center; justify-content: center; gap: 12px; }
    .brand-logo { font-size: 1.05rem; font-weight: 700; color: var(--accent); letter-spacing: -0.02em; text-decoration: none; }
    .brand-sep { width: 1px; height: 16px; background: var(--border); }
    .brand-tag { font-size: 12px; color: var(--muted); }

    .card-title { font-size: 1.65rem; font-weight: 800; letter-spacing: -0.04em; color: var(--text-main); margin: 0 0 6px; text-align: center; }
    .card-sub { font-size: 13.5px; color: var(--muted); margin: 0; line-height: 1.5; text-align: center; }

    .card-form { display: flex; flex-direction: column; gap: 15px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 600; color: var(--field-label-color, rgba(15,23,42,0.55)); letter-spacing: 0.01em; }

    .field-wrap {
      display: flex; align-items: center; gap: 10px;
      background: var(--field-bg, rgba(0,0,0,0.03));
      border: 1px solid var(--border);
      border-radius: 11px; padding: 0 14px; height: 44px;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .field-wrap.field-focus {
      border-color: var(--border-focus);
      background: rgba(59,130,246,0.04);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
    }
    .field-wrap.field-error { border-color: rgba(248,113,113,0.5); background: rgba(248,113,113,0.04); }
    .field-wrap.field-locked { opacity: 0.6; }

    .field-icon { color: var(--muted); flex-shrink: 0; }
    .field-input {
      flex: 1; background: transparent; border: none; outline: none;
      font-family: 'Outfit', system-ui, sans-serif; font-size: 14px;
      color: var(--text-main); caret-color: var(--accent);
    }
    .field-input::placeholder { color: var(--placeholder-color, rgba(15,23,42,0.25)); }
    .field-err-msg { font-size: 11.5px; color: var(--error); padding-left: 4px; }
    .field-hint { font-size: 11px; color: rgba(59,130,246,0.7); padding-left: 4px; }

    .toggle-btn {
      background: none; border: none; padding: 4px; cursor: pointer;
      color: var(--muted); display: flex; align-items: center;
      border-radius: 5px; transition: color 0.15s, background 0.15s;
    }
    .toggle-btn:hover { color: var(--text-main); background: var(--toggle-hover-bg, rgba(0,0,0,0.06)); }

    .strength-wrap { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
    .strength-bar { display: flex; gap: 4px; flex: 1; }
    .strength-seg {
      height: 3px; flex: 1; border-radius: 2px;
      background: rgba(255,255,255,0.08);
      transition: background 0.25s;
    }
    .strength-seg.weak   { background: #f87171; }
    .strength-seg.fair   { background: #fb923c; }
    .strength-seg.strong { background: #4ade80; }
    .strength-label { font-size: 11px; font-weight: 600; min-width: 40px; text-align: right; }
    .strength-label.weak   { color: #f87171; }
    .strength-label.fair   { color: #fb923c; }
    .strength-label.strong { color: #4ade80; }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.07);
      border: 1px solid rgba(248,113,113,0.2);
      border-radius: 10px; padding: 10px 14px;
      font-size: 12.5px; color: #fca5a5;
      animation: fadeSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

    .submit-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; height: 48px; margin-top: 4px;
      background: var(--accent); color: #fff;
      border: none; border-radius: 12px;
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
    .login-row { display: flex; align-items: center; justify-content: center; gap: 6px; }
    .login-hint { font-size: 13px; color: var(--muted); }
    .login-link { font-size: 13px; font-weight: 600; color: var(--accent); text-decoration: none; transition: opacity 0.15s; }
    .login-link:hover { opacity: 0.8; }

    .page-footer {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 40px; border-top: 1px solid var(--border);
    }
    .footer-copy { font-size: 11.5px; color: var(--footer-copy-color, rgba(15,23,42,0.25)); }
    .footer-links { display: flex; align-items: center; gap: 10px; }
    .footer-a { font-size: 11.5px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
    .footer-a:hover { color: var(--text-main); }
    .footer-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border); }

    @media (max-width: 640px) {
      .page-center { padding: 32px 16px; }
      .card { padding: 28px 20px; }
      .page-footer { padding: 14px 20px; }
    }
  `],
})
export class RegisterComponent {
  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);
  private readonly snackBar    = inject(MatSnackBar);

  showPassword    = false;
  showConfirm     = false;
  usernameFocused = false;
  emailFocused    = false;
  passwordFocused = false;
  confirmFocused  = false;
  loading         = false;
  errorMessage    = '';
  emailFromInvite = false;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm:  ['', Validators.required],
  }, { validators: passwordsMatch });

  get f() { return this.form.controls; }

  private passwordValue = toSignal(
    this.form.get('password')!.valueChanges.pipe(startWith('')),
    { initialValue: '' }
  );

  strength      = computed(() => {
    const pw = this.passwordValue() ?? '';
    let score = 0;
    if (pw.length >= 6)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    return score;
  });
  strengthClass = computed(() => ['', 'weak', 'fair', 'strong', 'strong'][this.strength()] ?? 'weak');
  strengthLabel = computed(() => ['', 'Faible', 'Moyen', 'Fort', 'Fort'][this.strength()] ?? '');

  get usernameErr(): boolean { const c = this.f['username']; return !!(c.invalid && c.touched); }
  get emailErr():    boolean { const c = this.f['email'];    return !!(c.invalid && c.touched); }
  get passwordErr(): boolean { const c = this.f['password']; return !!(c.invalid && c.touched); }
  get confirmErr():  boolean {
    const c = this.f['confirm'];
    return !!(c.invalid && c.touched) || !!(this.form.hasError('mismatch') && c.touched);
  }

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.get('email')!.setValue(email);
      this.form.get('email')!.disable();
      this.emailFromInvite = true;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    const { username, email, password } = this.form.getRawValue();
    this.authService.register({ username: username!, email: email!, password: password! }).pipe(
      catchError(err => {
        const msg = err?.error?.message ?? "Une erreur est survenue lors de l'inscription.";
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
