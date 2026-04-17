import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatRippleModule,
  ],
  template: `
    <div class="profile-page">
      <div class="profile-container">

        <!-- ══════════════════ HERO HEADER ══════════════════ -->
        <div class="hero-card">
          <!-- Accent band -->
          <div class="hero-band" aria-hidden="true"></div>

          <div class="hero-body">
            <!-- Avatar -->
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                @if (avatarUrl()) {
                  <img class="avatar-img" [src]="avatarUrl()!" alt="avatar" />
                } @else {
                  <span class="avatar-initials">{{ initials() }}</span>
                }
                <!-- Hover overlay -->
                <input #fileInput type="file" accept="image/*" style="display:none"
                       (change)="onFileSelected($event)" />
                <button class="avatar-overlay" (click)="fileInput.click()" title="Changer la photo">
                  <mat-icon>photo_camera</mat-icon>
                </button>
              </div>
              @if (avatarUrl()) {
                <button class="pill-btn" (click)="removeAvatar()">
                  <mat-icon>person</mat-icon>Initiales
                </button>
              }
            </div>

            <!-- Identity -->
            <div class="hero-identity">
              <h1 class="user-name">{{ username() }}</h1>
              <span class="user-role-badge">
                <mat-icon>verified</mat-icon>{{ roleLabel() }}
              </span>
            </div>

            <!-- Stats inline -->
            <div class="hero-stats">
              <div class="hstat">
                <span class="hstat-val">{{ doneTasks() }}</span>
                <span class="hstat-lbl">Finies</span>
                <div class="hstat-bar"><div class="hstat-fill done" [style.width.%]="donePercent()"></div></div>
              </div>
              <div class="hstat-sep"></div>
              <div class="hstat">
                <span class="hstat-val">{{ pendingTasks() }}</span>
                <span class="hstat-lbl">En attente</span>
                <div class="hstat-bar"><div class="hstat-fill pending" [style.width.%]="pendingPercent()"></div></div>
              </div>
              <div class="hstat-sep"></div>
              <div class="hstat">
                <span class="hstat-val">{{ productivity() }}<sup>%</sup></span>
                <span class="hstat-lbl">Productivité</span>
                <div class="hstat-bar"><div class="hstat-fill prod" [style.width.%]="productivity()"></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════════════ INFOS CARD ══════════════════ -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon">
              <mat-icon>person</mat-icon>
            </div>
            <div>
              <h2 class="section-title">Informations personnelles</h2>
              <p class="section-sub">Modifiez votre nom et votre adresse e-mail</p>
            </div>
          </div>

          <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="card-form">
            <div class="fields-row">
              <mat-form-field appearance="outline" class="field">
                <mat-label>Nom / Pseudo</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="username" placeholder="Votre nom affiché" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="field field-readonly">
                <mat-label>Adresse e-mail</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput [value]="auth.currentUser()?.email ?? ''" readonly />
                <mat-hint>L'e-mail ne peut pas être modifié ici</mat-hint>
              </mat-form-field>
            </div>
            <div class="form-footer">
              <button type="submit" class="save-btn" matRipple [disabled]="infoForm.invalid || savingInfo()">
                <mat-icon [class.spin]="savingInfo()">{{ savingInfo() ? 'sync' : 'check' }}</mat-icon>
                Enregistrer
              </button>
            </div>
          </form>
        </div>

        <!-- ══════════════════ SECURITY CARD ══════════════════ -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon security">
              <mat-icon>lock</mat-icon>
            </div>
            <div>
              <h2 class="section-title">Sécurité</h2>
              <p class="section-sub">Changez votre mot de passe</p>
            </div>
          </div>

          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="card-form">
            <div class="fields-row">
              <mat-form-field appearance="outline" class="field">
                <mat-label>Ancien mot de passe</mat-label>
                <mat-icon matPrefix>lock_open</mat-icon>
                <input matInput formControlName="oldPassword"
                       [type]="showOld() ? 'text' : 'password'" />
                <button type="button" mat-icon-button matSuffix (click)="showOld.set(!showOld())">
                  <mat-icon>{{ showOld() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
              <mat-form-field appearance="outline" class="field">
                <mat-label>Nouveau mot de passe</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput formControlName="newPassword"
                       [type]="showNew() ? 'text' : 'password'" />
                <button type="button" mat-icon-button matSuffix (click)="showNew.set(!showNew())">
                  <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                  <mat-error>Minimum 8 caractères</mat-error>
                }
              </mat-form-field>
            </div>
            <div class="form-footer">
              <button type="submit" class="save-btn" matRipple [disabled]="passwordForm.invalid || savingPwd()">
                <mat-icon [class.spin]="savingPwd()">{{ savingPwd() ? 'sync' : 'check' }}</mat-icon>
                Enregistrer
              </button>
            </div>
          </form>
        </div>

        <!-- ══════════════════ DANGER ZONE ══════════════════ -->
        <div class="danger-zone">
          <div class="danger-text">
            <mat-icon>warning_amber</mat-icon>
            <span>La suppression de votre compte est irréversible.</span>
          </div>
          <button class="delete-btn" matRipple (click)="deleteAccount()">
            <mat-icon>delete_forever</mat-icon>
            Supprimer le compte
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      /* Semantic local tokens */
      --done:    #10b981;
      --pending: #f59e0b;
      --danger:  #ef4444;
      --danger-text: #f87171;
    }

    .profile-page {
      min-height: 100vh;
      background: transparent;
      padding: 32px 24px 60px;
      box-sizing: border-box;
    }

    .profile-container {
      max-width: 780px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Hero card ── */
    .hero-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .hero-band {
      height: 80px;
      background: var(--primary);
      opacity: 0.06;
    }
    :host-context([data-theme="dark"]) .hero-band { opacity: 0.12; }

    .hero-body {
      display: flex;
      align-items: flex-end;
      gap: 24px;
      padding: 0 28px 28px;
      margin-top: -40px;
      flex-wrap: wrap;
    }

    /* ── Avatar ── */
    .avatar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .avatar-circle {
      position: relative;
      width: 88px;
      height: 88px;
      border-radius: 22px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--bg-card);
      box-shadow: 0 0 0 1px var(--border), var(--shadow);
      overflow: hidden;
    }

    .avatar-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      font-size: 1.9rem;
      font-weight: 800;
      color: var(--btn-text);
      letter-spacing: -1px;
      text-transform: uppercase;
    }

    .avatar-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      opacity: 0;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s;
      color: #fff;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .avatar-circle:hover .avatar-overlay { opacity: 1; }

    .pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 600;
      font-family: inherit;
      padding: 4px 10px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      &:hover { background: var(--bg-panel-hover); color: var(--text-main); }
    }

    /* ── Identity ── */
    .hero-identity {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      min-width: 160px;
    }

    .user-name {
      margin: 0;
      font-size: 1.7rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .user-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 12px;
      width: fit-content;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: var(--primary); }
    }

    /* ── Hero stats ── */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-left: auto;
    }

    .hstat {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      min-width: 64px;
    }

    .hstat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.5px;
      line-height: 1;
      sup { font-size: 0.6em; font-weight: 700; vertical-align: super; }
    }

    .hstat-lbl {
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-align: right;
    }

    .hstat-bar {
      width: 100%;
      height: 3px;
      background: var(--border);
      border-radius: 2px;
      overflow: hidden;
    }

    .hstat-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hstat-fill.done    { background: var(--done); }
    .hstat-fill.pending { background: var(--pending); }
    .hstat-fill.prod    { background: var(--primary); }

    .hstat-sep {
      width: 1px;
      height: 32px;
      background: var(--border);
      flex-shrink: 0;
    }

    /* ── Section cards ── */
    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 26px;
      box-shadow: var(--shadow);
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 22px;
    }

    .section-icon {
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border-radius: 11px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .section-icon.security {
      color: var(--text-muted);
    }

    .section-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 3px;
      letter-spacing: -0.2px;
    }

    .section-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.4;
    }

    /* ── Form ── */
    .card-form { display: flex; flex-direction: column; }

    .fields-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field { width: 100%; }

    :host ::ng-deep .field .mat-mdc-text-field-wrapper {
      background: var(--input-bg) !important;
    }
    :host ::ng-deep .field .mdc-notched-outline__leading,
    :host ::ng-deep .field .mdc-notched-outline__notch,
    :host ::ng-deep .field .mdc-notched-outline__trailing {
      border-color: var(--border) !important;
    }
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__trailing {
      border-color: var(--primary) !important;
    }
    :host ::ng-deep .field .mdc-floating-label,
    :host ::ng-deep .field .mat-mdc-form-field-label { color: var(--text-muted) !important; }
    :host ::ng-deep .field input { color: var(--text-main) !important; caret-color: var(--primary); }
    :host ::ng-deep .field .mat-mdc-form-field-icon-prefix mat-icon { color: var(--text-muted); }
    :host ::ng-deep .field button mat-icon { color: var(--text-muted); }
    :host ::ng-deep .field .mat-mdc-form-field-hint { color: var(--text-muted) !important; }
    :host ::ng-deep .field-readonly input { color: var(--text-muted) !important; cursor: default; }
    :host ::ng-deep .field-readonly .mat-mdc-text-field-wrapper { background: var(--bg-panel) !important; }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 18px;
    }

    .save-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 38px;
      padding: 0 20px;
      border: none;
      border-radius: 10px;
      background: var(--primary);
      color: var(--btn-text);
      font-size: 0.84rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px var(--accent-shadow);
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 20px var(--accent-shadow-hover); }
      &:active:not(:disabled) { transform: scale(0.98); }
      &:disabled { opacity: 0.38; cursor: not-allowed; }
    }

    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Danger zone ── */
    .danger-zone {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: rgba(239,68,68,0.04);
      border: 1px solid rgba(239,68,68,0.12);
      border-radius: 14px;
      padding: 16px 20px;
    }
    :host-context([data-theme="dark"]) .danger-zone {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.2);
    }

    .danger-text {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.82rem;
      color: var(--text-muted);
      mat-icon { color: var(--danger); font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

    .delete-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      height: 34px;
      padding: 0 14px;
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 9px;
      background: transparent;
      color: var(--danger-text);
      font-size: 0.8rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s, border-color 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.45); }
    }

    @media (max-width: 640px) {
      .profile-page { padding: 20px 16px 48px; }
      .hero-body { flex-direction: column; align-items: flex-start; gap: 16px; }
      .hero-stats { margin-left: 0; width: 100%; justify-content: space-between; }
      .fields-row { grid-template-columns: 1fr; }
      .section-card { padding: 20px 16px; }
      .danger-zone { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  readonly auth      = inject(AuthService);
  private readonly userSvc = inject(UserService);
  private readonly taskSvc        = inject(TaskService);
  private readonly projectService = inject(ProjectService);
  private readonly snack   = inject(MatSnackBar);
  private readonly fb      = inject(FormBuilder);

  savingInfo = signal(false);
  savingPwd  = signal(false);
  showOld    = signal(false);
  showNew    = signal(false);

  avatarUrl = computed(() => this.auth.currentUser()?.avatarUrl ?? null);

  doneTasks    = signal(0);
  pendingTasks = signal(0);
  totalTasks   = signal(0);

  donePercent    = computed(() => this.totalTasks() ? Math.round(this.doneTasks() / this.totalTasks() * 100) : 0);
  pendingPercent = computed(() => this.totalTasks() ? Math.round(this.pendingTasks() / this.totalTasks() * 100) : 0);
  productivity   = computed(() => this.donePercent());

  username  = computed(() => this.auth.currentUser()?.username ?? 'Utilisateur');
  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role ?? '';
    return role === 'ADMIN' ? 'Administrateur' : 'Membre';
  });
  initials = computed(() => {
    const parts = this.username().trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return this.username().slice(0, 2).toUpperCase();
  });

  infoForm = this.fb.group({
    username: [this.auth.currentUser()?.username ?? '', Validators.required],
  });

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    const projectId = this.projectService.selected()?.id;
    if (!projectId) return;
    this.taskSvc.getTasks(projectId).subscribe({
      next: (page) => {
        const tasks = page.content ?? [];
        this.totalTasks.set(tasks.length);
        this.doneTasks.set(tasks.filter(t => t.status === 'DONE').length);
        this.pendingTasks.set(tasks.filter(t => t.status === 'TODO').length);
      },
    });
  }

  removeAvatar(): void {
    this.userSvc.updateAvatar(null).subscribe({
      error: () => this.snack.open('Erreur lors de la suppression de la photo', 'OK', { duration: 3000 }),
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.userSvc.updateAvatar(dataUrl).subscribe({
        error: () => this.snack.open('Erreur lors de la mise à jour de la photo', 'OK', { duration: 3000 }),
      });
    };
    reader.readAsDataURL(file);
  }

  saveInfo(): void {
    if (this.infoForm.invalid) return;
    const username = this.infoForm.value.username!.trim();
    this.savingInfo.set(true);
    this.userSvc.updateProfile(username).subscribe({
      next: () => {
        this.savingInfo.set(false);
        this.snack.open(`Nom mis à jour : ${username}`, 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.savingInfo.set(false);
        const msg = err?.error?.message ?? 'Erreur lors de la mise à jour';
        this.snack.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { oldPassword, newPassword } = this.passwordForm.value;
    this.savingPwd.set(true);
    this.userSvc.changePassword(oldPassword!, newPassword!).subscribe({
      next: () => {
        this.savingPwd.set(false);
        this.snack.open('Mot de passe modifié. Reconnectez-vous.', 'OK', { duration: 3000 });
        setTimeout(() => this.auth.logout(), 2000);
      },
      error: (err) => {
        this.savingPwd.set(false);
        const msg = err?.error?.message ?? 'Ancien mot de passe incorrect';
        this.snack.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  deleteAccount(): void {
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    // TODO: DELETE /api/users/me
    this.snack.open('Compte supprimé', 'OK', { duration: 3000 });
    this.auth.logout();
  }
}
