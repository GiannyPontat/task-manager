import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatSnackBarModule,
    MatRippleModule,
  ],
  template: `
    <div class="profile-page">
      <!-- decorative ambient blobs -->
      <div class="ambient-blob blob-1" aria-hidden="true"></div>
      <div class="ambient-blob blob-2" aria-hidden="true"></div>

      <div class="profile-container">

        <!-- ══════════════════ HERO CARD ══════════════════ -->
        <section class="hero-card">
          <!-- gradient banner with floating blobs -->
          <div class="hero-banner" aria-hidden="true">
            <div class="banner-blob banner-blob-1"></div>
            <div class="banner-blob banner-blob-2"></div>
            <div class="banner-grid"></div>
          </div>

          <div class="hero-body">
            <!-- avatar zone -->
            <div class="avatar-zone">
              <div class="avatar-ring">
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
                <span class="status-dot" title="En ligne"></span>
              </div>
              @if (avatarUrl()) {
                <button class="ghost-pill" (click)="removeAvatar()">
                  <mat-icon>person</mat-icon>
                  <span>Initiales</span>
                </button>
              }
            </div>

            <!-- identity -->
            <div class="identity">
              <div class="identity-top">
                <h1 class="user-name">{{ username() }}</h1>
                <span class="role-pill">
                  <mat-icon>verified</mat-icon>
                  {{ roleLabel() }}
                </span>
              </div>
              <p class="user-email">
                <mat-icon>alternate_email</mat-icon>
                {{ auth.currentUser()?.email ?? '' }}
              </p>
            </div>

            <!-- inline cta -->
            <div class="hero-cta">
              <button class="ghost-btn" (click)="fileInput.click()">
                <mat-icon>photo_camera</mat-icon>
                Changer la photo
              </button>
            </div>
          </div>

          <!-- ── Stats grid ── -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-head">
                <div class="stat-icon stat-icon--done"><mat-icon>task_alt</mat-icon></div>
                <span class="stat-trend">+{{ donePercent() }}%</span>
              </div>
              <span class="stat-val">{{ doneTasks() }}</span>
              <span class="stat-lbl">Tâches finies</span>
              <div class="stat-bar"><div class="stat-fill done" [style.width.%]="donePercent()"></div></div>
            </div>

            <div class="stat-card">
              <div class="stat-head">
                <div class="stat-icon stat-icon--pending"><mat-icon>pending_actions</mat-icon></div>
                <span class="stat-trend muted">{{ pendingPercent() }}%</span>
              </div>
              <span class="stat-val">{{ pendingTasks() }}</span>
              <span class="stat-lbl">En attente</span>
              <div class="stat-bar"><div class="stat-fill pending" [style.width.%]="pendingPercent()"></div></div>
            </div>

            <div class="stat-card stat-card--accent">
              <div class="stat-head">
                <div class="stat-icon stat-icon--prod"><mat-icon>trending_up</mat-icon></div>
                <span class="stat-trend accent">PRO</span>
              </div>
              <span class="stat-val gradient-text">{{ productivity() }}<sup>%</sup></span>
              <span class="stat-lbl">Productivité</span>
              <div class="stat-bar"><div class="stat-fill prod" [style.width.%]="productivity()"></div></div>
            </div>
          </div>
        </section>

        <!-- ══════════════════ INFOS PERSONNELLES ══════════════════ -->
        <section class="form-card">
          <header class="card-head">
            <div class="head-icon"><mat-icon>person_outline</mat-icon></div>
            <div>
              <h2 class="card-title">Informations personnelles</h2>
              <p class="card-sub">Modifiez votre nom et votre adresse e-mail</p>
            </div>
          </header>

          <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="card-form">
            <div class="fields-grid">
              <label class="field-wrap">
                <span class="field-label">Nom / Pseudo</span>
                <div class="field-input">
                  <mat-icon class="field-icon">badge</mat-icon>
                  <input type="text" formControlName="username" placeholder="Votre nom affiché" />
                </div>
              </label>

              <label class="field-wrap field-wrap--readonly">
                <span class="field-label">Adresse e-mail</span>
                <div class="field-input">
                  <mat-icon class="field-icon">email</mat-icon>
                  <input type="email" [value]="auth.currentUser()?.email ?? ''" readonly />
                  <mat-icon class="field-lock">lock</mat-icon>
                </div>
                <span class="field-hint">L'e-mail ne peut pas être modifié ici</span>
              </label>
            </div>

            <div class="form-footer">
              <button type="submit" class="primary-btn" matRipple [disabled]="infoForm.invalid || savingInfo()">
                <span class="btn-sheen"></span>
                <mat-icon [class.spin]="savingInfo()">{{ savingInfo() ? 'sync' : 'check' }}</mat-icon>
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        </section>

        <!-- ══════════════════ SÉCURITÉ ══════════════════ -->
        <section class="form-card">
          <header class="card-head">
            <div class="head-icon head-icon--lock"><mat-icon>lock_outline</mat-icon></div>
            <div>
              <h2 class="card-title">Sécurité</h2>
              <p class="card-sub">Changez votre mot de passe régulièrement</p>
            </div>
          </header>

          <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="card-form">
            <div class="fields-grid">
              <label class="field-wrap">
                <span class="field-label">Ancien mot de passe</span>
                <div class="field-input">
                  <mat-icon class="field-icon">lock_open</mat-icon>
                  <input [type]="showOld() ? 'text' : 'password'" formControlName="oldPassword" />
                  <button type="button" class="field-toggle" (click)="showOld.set(!showOld())">
                    <mat-icon>{{ showOld() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </label>

              <label class="field-wrap">
                <span class="field-label">Nouveau mot de passe</span>
                <div class="field-input">
                  <mat-icon class="field-icon">lock</mat-icon>
                  <input [type]="showNew() ? 'text' : 'password'" formControlName="newPassword" />
                  <button type="button" class="field-toggle" (click)="showNew.set(!showNew())">
                    <mat-icon>{{ showNew() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                  <span class="field-error">Minimum 8 caractères</span>
                } @else {
                  <span class="field-hint">8 caractères min — mélangez lettres, chiffres et symboles</span>
                }
              </label>
            </div>

            <div class="form-footer">
              <button type="submit" class="primary-btn" matRipple [disabled]="passwordForm.invalid || savingPwd()">
                <span class="btn-sheen"></span>
                <mat-icon [class.spin]="savingPwd()">{{ savingPwd() ? 'sync' : 'check' }}</mat-icon>
                <span>Mettre à jour</span>
              </button>
            </div>
          </form>
        </section>

        <!-- ══════════════════ DANGER ZONE ══════════════════ -->
        <section class="danger-card">
          <div class="danger-icon">
            <mat-icon>warning_amber</mat-icon>
          </div>
          <div class="danger-body">
            <h3 class="danger-title">Zone de danger</h3>
            <p class="danger-text">La suppression de votre compte est <strong>irréversible</strong>. Toutes vos tâches et projets seront perdus.</p>
          </div>
          <button class="danger-btn" matRipple (click)="deleteAccount()">
            <mat-icon>delete_forever</mat-icon>
            <span>Supprimer le compte</span>
          </button>
        </section>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      --orange:          #F87941;
      --salmon:          #F9B095;
      --dark:            #0F172A;
      --base:            #FDFCFC;
      --gradient:        linear-gradient(135deg, #F87941 0%, #F9B095 100%);
      --gradient-soft:   linear-gradient(135deg, rgba(248,121,65,0.10) 0%, rgba(249,176,149,0.06) 100%);
      --orange-bg:       rgba(248,121,65,0.08);
      --orange-bg-hover: rgba(248,121,65,0.14);
      --orange-border:   rgba(248,121,65,0.18);
      --orange-ring:     rgba(248,121,65,0.12);
      --done:            #10b981;
      --pending:         #f59e0b;
      --danger:          #ef4444;
      --shadow-2xl:      0 25px 50px -12px rgba(15,23,42,0.10), 0 0 0 1px rgba(15,23,42,0.04);
      --shadow-card:     0 12px 32px -8px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04);
      --shadow-hover:    0 20px 40px -10px rgba(248,121,65,0.18), 0 0 0 1px var(--orange-border);
    }

    /* ══════════════════ PAGE SHELL ══════════════════ */
    .profile-page {
      position: relative;
      min-height: 100vh;
      padding: 40px 32px 80px;
      box-sizing: border-box;
      overflow: hidden;
    }

    .ambient-blob {
      position: absolute; pointer-events: none; z-index: 0;
      border-radius: 50%; filter: blur(110px); opacity: 0.45;
    }
    .blob-1 {
      width: 520px; height: 520px;
      background: radial-gradient(circle, var(--orange) 0%, transparent 70%);
      top: -180px; left: -120px;
    }
    .blob-2 {
      width: 460px; height: 460px;
      background: radial-gradient(circle, var(--salmon) 0%, transparent 70%);
      bottom: -160px; right: -120px;
    }
    :host-context([data-theme="dark"]) .ambient-blob { opacity: 0.18; }

    .profile-container {
      position: relative; z-index: 1;
      max-width: 1100px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 24px;
    }

    /* ══════════════════ HERO CARD ══════════════════ */
    .hero-card {
      position: relative;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, rgba(15,23,42,0.06));
      border-radius: 2.5rem;
      box-shadow: var(--shadow-2xl);
      overflow: hidden;
    }

    .hero-banner {
      position: relative;
      height: 160px;
      background: var(--gradient);
      overflow: hidden;
    }
    .banner-blob {
      position: absolute; border-radius: 50%; filter: blur(40px);
    }
    .banner-blob-1 {
      width: 240px; height: 240px;
      background: rgba(255,255,255,0.35);
      top: -80px; right: 12%;
      animation: float-blob 9s ease-in-out infinite;
    }
    .banner-blob-2 {
      width: 180px; height: 180px;
      background: rgba(15,23,42,0.18);
      bottom: -60px; left: 18%;
      animation: float-blob 11s ease-in-out infinite reverse;
    }
    .banner-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
      background-size: 32px 32px;
      mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
    }
    @keyframes float-blob {
      0%, 100% { transform: translate(0,0); }
      50%      { transform: translate(20px, -16px); }
    }

    .hero-body {
      display: flex; align-items: flex-end; gap: 24px;
      padding: 0 36px 28px; margin-top: -52px; flex-wrap: wrap;
    }

    /* ── Avatar ── */
    .avatar-zone {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    .avatar-ring {
      position: relative;
      padding: 4px;
      border-radius: 28px;
      background: var(--gradient);
      box-shadow: 0 14px 36px -8px rgba(248,121,65,0.45);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s;
    }
    .avatar-ring:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 20px 44px -8px rgba(248,121,65,0.55);
    }
    .avatar-circle {
      position: relative; width: 104px; height: 104px;
      border-radius: 24px; background: var(--gradient);
      display: flex; align-items: center; justify-content: center;
      border: 3px solid var(--bg-card, #fff);
      overflow: hidden;
    }
    .avatar-img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .avatar-initials {
      font-size: 2.4rem; font-weight: 800; color: #fff;
      letter-spacing: -1px; text-transform: uppercase;
    }
    .avatar-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: rgba(15,23,42,0.55); opacity: 0; border: none;
      cursor: pointer; transition: opacity 0.2s; color: #fff;
    }
    .avatar-overlay mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .avatar-circle:hover .avatar-overlay { opacity: 1; }
    .status-dot {
      position: absolute; bottom: 4px; right: 4px;
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--done);
      border: 3px solid var(--bg-card, #fff);
      box-shadow: 0 0 0 0 rgba(16,185,129,0.7);
      animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;
    }
    @keyframes ping {
      0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
      80%  { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }

    .ghost-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--bg-app, #fff); border: 1px solid var(--border, rgba(15,23,42,0.08));
      border-radius: 999px; color: var(--text-muted, #64748b);
      font-size: 0.7rem; font-weight: 600; font-family: inherit;
      padding: 4px 10px; cursor: pointer;
      transition: all 0.18s;
    }
    .ghost-pill mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .ghost-pill:hover {
      background: var(--orange-bg); color: var(--orange); border-color: var(--orange-border);
      transform: translateY(-1px);
    }

    /* ── Identity ── */
    .identity {
      display: flex; flex-direction: column; gap: 8px;
      flex: 1; min-width: 220px; padding-bottom: 4px;
    }
    .identity-top {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .user-name {
      margin: 0; font-size: 2rem; font-weight: 800;
      color: var(--text-main, #0F172A); letter-spacing: -0.8px; line-height: 1.1;
    }
    .role-pill {
      display: inline-flex; align-items: center; gap: 5px;
      background: var(--orange-bg); border: 1px solid var(--orange-border);
      border-radius: 999px; color: var(--orange);
      font-size: 0.72rem; font-weight: 700; padding: 4px 12px;
      letter-spacing: 0.02em;
    }
    .role-pill mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .user-email {
      display: inline-flex; align-items: center; gap: 6px;
      margin: 0; font-size: 0.85rem; color: var(--text-muted, #64748b);
      font-weight: 500;
    }
    .user-email mat-icon { font-size: 15px; width: 15px; height: 15px; color: var(--orange); }

    .hero-cta { padding-bottom: 4px; }
    .ghost-btn {
      display: inline-flex; align-items: center; gap: 7px;
      height: 40px; padding: 0 18px; border-radius: 12px;
      background: transparent; border: 1px solid var(--border, rgba(15,23,42,0.1));
      color: var(--text-main, #0F172A);
      font-size: 0.82rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: all 0.18s;
    }
    .ghost-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ghost-btn:hover {
      border-color: var(--orange); color: var(--orange);
      background: var(--orange-bg); transform: translateY(-1px);
    }

    /* ── Stats grid ── */
    .stats-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 16px; padding: 0 36px 36px;
    }
    .stat-card {
      position: relative;
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, rgba(15,23,42,0.06));
      border-radius: 20px; padding: 18px 20px;
      display: flex; flex-direction: column; gap: 8px;
      box-shadow: 0 2px 8px rgba(15,23,42,0.03);
      transition: transform 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s, border-color 0.22s;
      overflow: hidden;
    }
    .stat-card::before {
      content: ''; position: absolute; inset: 0;
      background: var(--gradient-soft); opacity: 0;
      transition: opacity 0.25s; pointer-events: none;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: var(--orange-border);
    }
    .stat-card:hover::before { opacity: 1; }
    .stat-card > * { position: relative; z-index: 1; }

    .stat-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 4px;
    }
    .stat-icon {
      width: 36px; height: 36px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .stat-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .stat-icon--done    { background: rgba(16,185,129,0.12); color: var(--done); }
    .stat-icon--pending { background: rgba(245,158,11,0.12); color: var(--pending); }
    .stat-icon--prod    { background: var(--orange-bg);      color: var(--orange); }
    .stat-card:hover .stat-icon { transform: scale(1.12) rotate(-6deg); }
    .stat-card:hover .stat-icon--prod {
      box-shadow: 0 8px 22px -4px rgba(248,121,65,0.45);
    }

    .stat-trend {
      font-size: 0.7rem; font-weight: 700;
      color: var(--done); background: rgba(16,185,129,0.1);
      padding: 3px 8px; border-radius: 999px;
    }
    .stat-trend.muted  { color: var(--pending); background: rgba(245,158,11,0.1); }
    .stat-trend.accent { color: var(--orange); background: var(--orange-bg); letter-spacing: 0.04em; }

    .stat-val {
      font-size: 2rem; font-weight: 800;
      color: var(--text-main, #0F172A); letter-spacing: -0.8px; line-height: 1;
    }
    .stat-val sup { font-size: 0.55em; font-weight: 700; vertical-align: super; }
    .gradient-text {
      background: var(--gradient);
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-lbl {
      font-size: 0.68rem; color: var(--text-muted, #64748b);
      font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
    }
    .stat-bar {
      height: 4px; background: var(--border, rgba(15,23,42,0.08));
      border-radius: 2px; overflow: hidden; margin-top: 4px;
    }
    .stat-fill { height: 100%; border-radius: 2px; transition: width 0.9s cubic-bezier(0.4,0,0.2,1); }
    .stat-fill.done    { background: var(--done); }
    .stat-fill.pending { background: var(--pending); }
    .stat-fill.prod    { background: var(--gradient); }

    /* ══════════════════ FORM CARDS ══════════════════ */
    .form-card {
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, rgba(15,23,42,0.06));
      border-radius: 2rem;
      padding: 32px 36px;
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.25s;
    }
    .form-card:hover { box-shadow: var(--shadow-2xl); }

    .card-head {
      display: flex; align-items: flex-start; gap: 14px;
      padding-bottom: 22px; margin-bottom: 22px;
      border-bottom: 1px solid var(--border, rgba(15,23,42,0.06));
    }
    .head-icon {
      width: 44px; height: 44px; flex-shrink: 0; border-radius: 14px;
      background: var(--orange-bg); border: 1px solid var(--orange-border);
      display: flex; align-items: center; justify-content: center;
      color: var(--orange);
      transition: transform 0.25s, box-shadow 0.25s;
    }
    .head-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .form-card:hover .head-icon {
      transform: rotate(-6deg) scale(1.06);
      box-shadow: 0 10px 24px -6px rgba(248,121,65,0.32);
    }
    .head-icon--lock {
      background: rgba(15,23,42,0.04); border-color: rgba(15,23,42,0.08);
      color: var(--text-main, #0F172A);
    }
    .form-card:hover .head-icon--lock {
      background: var(--orange-bg); border-color: var(--orange-border); color: var(--orange);
      box-shadow: 0 10px 24px -6px rgba(248,121,65,0.28);
    }

    .card-title {
      font-size: 1.05rem; font-weight: 700; margin: 0 0 4px;
      color: var(--text-main, #0F172A); letter-spacing: -0.3px;
    }
    .card-sub { font-size: 0.82rem; color: var(--text-muted, #64748b); margin: 0; line-height: 1.4; }

    /* ── Custom Form Fields (Login pattern) ── */
    .card-form { display: flex; flex-direction: column; }
    .fields-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 18px;
    }

    .field-wrap {
      display: flex; flex-direction: column; gap: 7px;
      cursor: text;
    }
    .field-label {
      font-size: 0.78rem; font-weight: 600;
      color: var(--text-main, #0F172A); letter-spacing: -0.1px;
      padding-left: 2px;
    }
    .field-input {
      position: relative;
      display: flex; align-items: center;
      height: 52px;
      background: var(--input-bg, rgba(15,23,42,0.025));
      border: 1.5px solid var(--border, rgba(15,23,42,0.08));
      border-radius: 14px;
      transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    }
    .field-input:focus-within {
      border-color: var(--orange);
      box-shadow: 0 0 0 4px var(--orange-ring);
      background: var(--bg-card, #fff);
    }
    .field-input:focus-within .field-icon { color: var(--orange); }

    .field-icon {
      position: absolute; left: 16px;
      font-size: 19px; width: 19px; height: 19px;
      color: var(--text-muted, #64748b);
      transition: color 0.18s;
      pointer-events: none;
    }
    .field-input input {
      flex: 1;
      width: 100%; height: 100%;
      padding: 0 48px 0 48px;
      background: transparent; border: none; outline: none;
      font-family: inherit; font-size: 0.92rem; font-weight: 500;
      color: var(--text-main, #0F172A);
      caret-color: var(--orange);
    }
    .field-input input::placeholder { color: var(--text-muted, #94a3b8); }

    .field-toggle, .field-lock {
      position: absolute; right: 12px;
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer;
      color: var(--text-muted, #64748b);
      transition: all 0.15s;
    }
    .field-toggle mat-icon, .field-lock {
      font-size: 18px; width: 18px; height: 18px;
    }
    .field-toggle:hover { background: var(--orange-bg); color: var(--orange); }
    .field-lock { cursor: default; }

    .field-wrap--readonly .field-input {
      background: var(--bg-panel, rgba(15,23,42,0.04));
      cursor: not-allowed;
    }
    .field-wrap--readonly input { color: var(--text-muted, #64748b); cursor: not-allowed; }

    .field-hint {
      font-size: 0.72rem; color: var(--text-muted, #94a3b8);
      padding-left: 2px; line-height: 1.3;
    }
    .field-error {
      font-size: 0.72rem; color: var(--danger);
      padding-left: 2px; font-weight: 500;
    }

    /* ── Submit button (black + sheen, Login pattern) ── */
    .form-footer {
      display: flex; justify-content: flex-end;
      margin-top: 20px;
    }
    .primary-btn {
      position: relative;
      display: inline-flex; align-items: center; gap: 8px;
      height: 48px; padding: 0 26px;
      border: none; border-radius: 14px;
      background: var(--dark);
      color: #fff;
      font-size: 0.88rem; font-weight: 600; font-family: inherit;
      cursor: pointer; overflow: hidden;
      box-shadow: 0 10px 28px -6px rgba(15,23,42,0.35);
      transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s, opacity 0.18s;
    }
    .primary-btn mat-icon { font-size: 18px; width: 18px; height: 18px; position: relative; z-index: 1; }
    .primary-btn span:not(.btn-sheen) { position: relative; z-index: 1; }
    .btn-sheen {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(248,121,65,0.7) 0%, rgba(249,176,149,0) 60%);
      opacity: 0; transition: opacity 0.25s;
    }
    .primary-btn:hover:not(:disabled) {
      transform: scale(1.02) translateY(-1px);
      box-shadow: 0 16px 36px -8px rgba(248,121,65,0.45);
    }
    .primary-btn:hover:not(:disabled) .btn-sheen { opacity: 1; }
    .primary-btn:active:not(:disabled) { transform: scale(0.98); }
    .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ══════════════════ DANGER ZONE ══════════════════ */
    .danger-card {
      display: flex; align-items: center; gap: 18px;
      background: linear-gradient(135deg, rgba(239,68,68,0.04) 0%, rgba(239,68,68,0.01) 100%);
      border: 1px solid rgba(239,68,68,0.16);
      border-radius: 1.5rem;
      padding: 22px 28px;
      transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
    }
    .danger-card:hover {
      border-color: rgba(239,68,68,0.32);
      box-shadow: 0 12px 32px -8px rgba(239,68,68,0.18);
    }
    .danger-icon {
      width: 44px; height: 44px; flex-shrink: 0; border-radius: 14px;
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.18);
      display: flex; align-items: center; justify-content: center;
      color: var(--danger);
      transition: transform 0.25s;
    }
    .danger-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .danger-card:hover .danger-icon { transform: rotate(-6deg) scale(1.08); }

    .danger-body { flex: 1; min-width: 0; }
    .danger-title {
      font-size: 0.95rem; font-weight: 700; margin: 0 0 3px;
      color: var(--text-main, #0F172A);
    }
    .danger-text {
      font-size: 0.8rem; color: var(--text-muted, #64748b);
      margin: 0; line-height: 1.45;
    }
    .danger-text strong { color: var(--danger); font-weight: 700; }

    .danger-btn {
      display: inline-flex; align-items: center; gap: 7px;
      height: 42px; padding: 0 18px; flex-shrink: 0;
      border: 1.5px solid rgba(239,68,68,0.3); border-radius: 12px;
      background: transparent; color: var(--danger);
      font-size: 0.82rem; font-weight: 600; font-family: inherit;
      cursor: pointer; transition: all 0.18s;
    }
    .danger-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .danger-btn:hover {
      background: var(--danger); color: #fff;
      border-color: var(--danger);
      transform: scale(1.02);
      box-shadow: 0 10px 28px -6px rgba(239,68,68,0.45);
    }
    .danger-btn:active { transform: scale(0.98); }

    /* ══════════════════ DARK MODE ══════════════════ */
    :host-context([data-theme="dark"]) .hero-banner {
      background: linear-gradient(135deg, rgba(248,121,65,0.45) 0%, rgba(249,176,149,0.28) 100%);
    }
    :host-context([data-theme="dark"]) .field-input:focus-within {
      background: rgba(248,121,65,0.04);
    }

    /* ══════════════════ RESPONSIVE ══════════════════ */
    @media (max-width: 860px) {
      .stats-grid { grid-template-columns: 1fr; }
      .fields-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .profile-page { padding: 24px 16px 60px; }
      .hero-body { flex-direction: column; align-items: flex-start; gap: 18px; padding: 0 24px 24px; }
      .stats-grid { padding: 0 24px 28px; }
      .form-card { padding: 24px; border-radius: 1.5rem; }
      .danger-card { flex-direction: column; align-items: flex-start; padding: 20px; }
      .user-name { font-size: 1.6rem; }
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
    this.snack.open('Compte supprimé', 'OK', { duration: 3000 });
    this.auth.logout();
  }
}
