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
      <div class="profile-layout">

        <!-- ══════ LEFT NAV ══════ -->
        <aside class="nav-col">
          <div class="nav-header">
            <p class="nav-eyebrow">Mon compte</p>
            <h2 class="nav-title">Gestion du profil</h2>
          </div>

          <nav class="nav-menu">
            <p class="nav-group-label">Paramètres</p>
            <button class="nav-item" [class.active]="activeSection() === 'info'"
                    (click)="activeSection.set('info')">
              <mat-icon>person_outline</mat-icon>
              <span>Infos personnelles</span>
            </button>
            <button class="nav-item" [class.active]="activeSection() === 'security'"
                    (click)="activeSection.set('security')">
              <mat-icon>lock_outline</mat-icon>
              <span>Sécurité</span>
            </button>

            <div class="nav-spacer"></div>
            <p class="nav-group-label">Danger</p>
            <button class="nav-item nav-item--danger" (click)="deleteAccount()">
              <mat-icon>delete_outline</mat-icon>
              <span>Supprimer le compte</span>
            </button>
          </nav>
        </aside>

        <!-- ══════ RIGHT CONTENT ══════ -->
        <div class="content-col">

          <!-- Banner + Avatar -->
          <div class="banner-card">
            <div class="banner-strip" aria-hidden="true"></div>
            <div class="banner-body">
              <div class="avatar-zone">
                <div class="avatar-circle">
                  @if (avatarUrl()) {
                    <img class="avatar-img" [src]="avatarUrl()!" alt="avatar" />
                  } @else {
                    <span class="avatar-initials">{{ initials() }}</span>
                  }
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

              <div class="banner-identity">
                <h1 class="user-name">{{ username() }}</h1>
                <span class="user-role-badge">
                  <mat-icon>verified</mat-icon>{{ roleLabel() }}
                </span>
              </div>

              <div class="banner-stats">
                <div class="bstat">
                  <span class="bstat-val">{{ doneTasks() }}</span>
                  <span class="bstat-lbl">Finies</span>
                  <div class="bstat-bar"><div class="bstat-fill done" [style.width.%]="donePercent()"></div></div>
                </div>
                <div class="bstat-sep"></div>
                <div class="bstat">
                  <span class="bstat-val">{{ pendingTasks() }}</span>
                  <span class="bstat-lbl">En attente</span>
                  <div class="bstat-bar"><div class="bstat-fill pending" [style.width.%]="pendingPercent()"></div></div>
                </div>
                <div class="bstat-sep"></div>
                <div class="bstat bstat--accent">
                  <span class="bstat-val">{{ productivity() }}<sup>%</sup></span>
                  <span class="bstat-lbl">Productivité</span>
                  <div class="bstat-bar"><div class="bstat-fill prod" [style.width.%]="productivity()"></div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Infos personnelles ── -->
          @if (activeSection() === 'info') {
            <div class="section-card">
              <div class="section-header">
                <div class="section-icon"><mat-icon>person_outline</mat-icon></div>
                <div>
                  <h2 class="section-title">Informations personnelles</h2>
                  <p class="section-sub">Modifiez votre nom et votre adresse e-mail</p>
                </div>
              </div>
              <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="card-form">
                <div class="fields-grid">
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
          }

          <!-- ── Sécurité ── -->
          @if (activeSection() === 'security') {
            <div class="section-card">
              <div class="section-header">
                <div class="section-icon section-icon--lock"><mat-icon>lock_outline</mat-icon></div>
                <div>
                  <h2 class="section-title">Sécurité</h2>
                  <p class="section-sub">Changez votre mot de passe</p>
                </div>
              </div>
              <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="card-form">
                <div class="fields-grid">
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
          }

        </div><!-- /content-col -->
      </div><!-- /profile-layout -->
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      --done:            #10b981;
      --pending:         #f59e0b;
      --danger:          #ef4444;
      --danger-text:     #f87171;
      --accent:          #F87941;
      --accent-soft:     rgba(248,121,65,0.08);
      --accent-border:   rgba(248,121,65,0.16);
      --accent-gradient: linear-gradient(135deg, #F87941 0%, #F9B095 100%);
    }
    :host-context([data-theme="dark"]) {
      --accent-soft:   rgba(248,121,65,0.12);
      --accent-border: rgba(248,121,65,0.22);
    }

    /* ── Page shell ── */
    .profile-page {
      min-height: 100vh;
      background: transparent;
      padding: 28px 24px 56px;
      box-sizing: border-box;
    }

    /* ── Two-column grid ── */
    .profile-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 20px;
      align-items: start;
    }

    /* ══════════════════ LEFT NAV ══════════════════ */
    .nav-col {
      position: sticky;
      top: 24px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 2rem;
      padding: 22px 14px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: var(--shadow);
    }

    .nav-header { padding: 0 8px; }
    .nav-eyebrow {
      margin: 0 0 2px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }
    .nav-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.2px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-group-label {
      margin: 6px 0 2px 8px;
      font-size: 0.64rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 12px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.84rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
      &:hover { background: var(--bg-app); color: var(--text-main); }
      &.active {
        background: var(--accent-soft);
        color: var(--accent);
        font-weight: 600;
        mat-icon { color: var(--accent); }
      }
    }

    .nav-item--danger {
      color: var(--danger-text);
      mat-icon { color: var(--danger); }
      &:hover { background: rgba(239,68,68,0.06); color: var(--danger); }
    }

    .nav-spacer { height: 8px; border-top: 1px solid var(--border); margin: 4px 0; }

    /* ══════════════════ RIGHT CONTENT ══════════════════ */
    .content-col {
      display: flex;
      flex-direction: column;
      gap: 18px;
      min-width: 0;
    }

    /* ── Banner card ── */
    .banner-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 2rem;
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .banner-strip {
      height: 90px;
      background: var(--accent-gradient);
    }
    :host-context([data-theme="dark"]) .banner-strip {
      background: linear-gradient(135deg, rgba(248,121,65,0.4) 0%, rgba(249,176,149,0.25) 100%);
    }

    .banner-body {
      display: flex;
      align-items: flex-end;
      gap: 20px;
      padding: 0 24px 24px;
      margin-top: -44px;
      flex-wrap: wrap;
    }

    /* ── Avatar ── */
    .avatar-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .avatar-circle {
      position: relative;
      width: 88px;
      height: 88px;
      border-radius: 20px;
      background: var(--accent-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid var(--bg-card);
      box-shadow: 0 0 0 1px var(--accent-border), 0 4px 16px rgba(248,121,65,0.18);
      overflow: hidden;
    }
    .avatar-img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials {
      font-size: 2rem; font-weight: 800; color: #fff;
      letter-spacing: -1px; text-transform: uppercase;
    }
    .avatar-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.42); opacity: 0; border: none;
      cursor: pointer; transition: opacity 0.15s; color: #fff;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .avatar-circle:hover .avatar-overlay { opacity: 1; }

    .pill-btn {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--bg-app); border: 1px solid var(--border);
      border-radius: 999px; color: var(--text-muted);
      font-size: 0.68rem; font-weight: 600; font-family: inherit;
      padding: 3px 9px; cursor: pointer; transition: background 0.15s, color 0.15s;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
      &:hover { background: var(--bg-panel-hover); color: var(--text-main); }
    }

    /* ── Identity ── */
    .banner-identity {
      display: flex; flex-direction: column; gap: 7px;
      flex: 1; min-width: 140px;
    }
    .user-name {
      margin: 0; font-size: 1.75rem; font-weight: 800;
      color: var(--text-main); letter-spacing: -0.5px; line-height: 1.1;
    }
    .user-role-badge {
      display: inline-flex; align-items: center; gap: 4px;
      background: var(--bg-app); border: 1px solid var(--border);
      border-radius: 999px; color: var(--text-muted);
      font-size: 0.7rem; font-weight: 600; padding: 3px 11px; width: fit-content;
      mat-icon { font-size: 13px; width: 13px; height: 13px; color: var(--accent); }
    }

    /* ── Banner stats ── */
    .banner-stats {
      display: flex; align-items: center; gap: 16px; margin-left: auto;
    }
    .bstat {
      display: flex; flex-direction: column; align-items: flex-end; gap: 3px; min-width: 60px;
    }
    .bstat-val {
      font-size: 1.4rem; font-weight: 800; color: var(--text-main);
      letter-spacing: -0.5px; line-height: 1;
      sup { font-size: 0.58em; font-weight: 700; vertical-align: super; }
    }
    .bstat--accent .bstat-val { color: var(--accent); }
    .bstat-lbl {
      font-size: 0.64rem; color: var(--text-muted); font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.06em; text-align: right;
    }
    .bstat-bar {
      width: 100%; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden;
    }
    .bstat-fill {
      height: 100%; border-radius: 2px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bstat-fill.done    { background: var(--done); }
    .bstat-fill.pending { background: var(--pending); }
    .bstat-fill.prod    { background: var(--accent-gradient); }
    .bstat-sep { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

    /* ── Section cards ── */
    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 2rem;
      padding: 26px 28px;
      box-shadow: var(--shadow);
    }

    .section-header {
      display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px;
    }
    .section-icon {
      width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px;
      background: var(--accent-soft); border: 1px solid var(--accent-border);
      display: flex; align-items: center; justify-content: center;
      color: var(--accent);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .section-icon--lock {
      background: var(--bg-app); border-color: var(--border); color: var(--text-muted);
    }
    .section-title {
      font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 0 0 3px; letter-spacing: -0.2px;
    }
    .section-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; line-height: 1.4; }

    /* ── Form grid ── */
    .card-form { display: flex; flex-direction: column; }
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .field { width: 100%; }

    :host ::ng-deep .field .mat-mdc-text-field-wrapper { background: var(--input-bg) !important; }
    :host ::ng-deep .field .mdc-notched-outline__leading,
    :host ::ng-deep .field .mdc-notched-outline__notch,
    :host ::ng-deep .field .mdc-notched-outline__trailing { border-color: var(--border) !important; }
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .field.mat-focused .mdc-notched-outline__trailing { border-color: var(--accent) !important; }
    :host ::ng-deep .field .mdc-floating-label,
    :host ::ng-deep .field .mat-mdc-form-field-label { color: var(--text-muted) !important; }
    :host ::ng-deep .field input { color: var(--text-main) !important; caret-color: var(--accent); }
    :host ::ng-deep .field .mat-mdc-form-field-icon-prefix mat-icon,
    :host ::ng-deep .field button mat-icon { color: var(--text-muted); }
    :host ::ng-deep .field .mat-mdc-form-field-hint { color: var(--text-muted) !important; }
    :host ::ng-deep .field-readonly input { color: var(--text-muted) !important; cursor: default; }
    :host ::ng-deep .field-readonly .mat-mdc-text-field-wrapper { background: var(--bg-panel) !important; }

    .form-footer { display: flex; justify-content: flex-end; margin-top: 16px; }

    .save-btn {
      display: inline-flex; align-items: center; gap: 7px;
      height: 40px; padding: 0 22px; border: none; border-radius: 12px;
      background: var(--accent-gradient); color: #fff;
      font-size: 0.85rem; font-weight: 600; font-family: inherit; cursor: pointer;
      box-shadow: 0 4px 18px rgba(248,121,65,0.28);
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
      &:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(248,121,65,0.4); }
      &:active:not(:disabled) { transform: scale(0.98); }
      &:disabled { opacity: 0.38; cursor: not-allowed; }
    }

    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .profile-layout { grid-template-columns: 1fr; }
      .nav-col { position: static; border-radius: 1.25rem; }
      .banner-body { flex-direction: column; align-items: flex-start; gap: 14px; }
      .banner-stats { margin-left: 0; width: 100%; justify-content: space-between; }
      .fields-grid { grid-template-columns: 1fr; }
      .section-card { padding: 20px 16px; border-radius: 1.25rem; }
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

  activeSection = signal<'info' | 'security'>('info');

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
