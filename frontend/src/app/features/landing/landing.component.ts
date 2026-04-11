import { Component, ElementRef, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('heroEnter', [
      transition(':enter', [
        query('.h-item', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          stagger(80, [
            animate('620ms cubic-bezier(0.16, 1, 0.3, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('visualEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.96)' }),
        animate('800ms 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ],
  template: `
    <!-- Atmospheric blobs -->
    <div class="bg-mesh" aria-hidden="true">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
    </div>

    <!-- ── NAVBAR ── -->
    <nav class="nav">
      <div class="nav-wrap">
        <a class="logo" routerLink="/">Flowly</a>
        <div class="nav-links">
          <a href="#features" class="nav-a">Fonctionnalités</a>
          <a href="#stack" class="nav-a">Stack Tech</a>
        </div>
        <a routerLink="/login" class="btn-login">Connexion</a>
      </div>
    </nav>

    <!-- ── HERO — Split layout ── -->
    <section class="hero" [@heroEnter]="true">

      <div class="hero-left">
        <div class="h-item hero-eyebrow">
          <span class="eyebrow-pulse"></span>
          Portfolio · Développeur Java Junior
        </div>
        <h1 class="h-item hero-h1">
          Le kanban qui<br>
          <em class="hero-em">parle code.</em>
        </h1>
        <p class="h-item hero-p">
          Construit avec <strong>Angular 17</strong> et <strong>Spring Boot</strong>.
          Authentification JWT, board kanban, invitations
          par email via l'API REST Resend.
        </p>
        <div class="h-item hero-actions">
          <a routerLink="/login" class="btn-primary">
            <span>Voir la démo</span>
            <svg class="btn-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="https://github.com/Gianny-Pnt/task-manager" target="_blank" rel="noopener" class="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </a>
        </div>
        <div class="h-item hero-pills">
          <span class="pill">JWT</span>
          <span class="pill">RxJS</span>
          <span class="pill">Docker</span>
          <span class="pill">PostgreSQL</span>
          <span class="pill">Resend</span>
        </div>
      </div>

      <div class="hero-right" [@visualEnter]="true">
        <div class="mock-window">
          <div class="mock-bar">
            <div class="mock-dots">
              <span class="md md-r"></span>
              <span class="md md-y"></span>
              <span class="md md-g"></span>
            </div>
            <span class="mock-bar-title">Flowly · Sprint Q2</span>
          </div>
          <div class="mock-board">
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>À faire</span>
                <span class="mc-badge">3</span>
              </div>
              <div class="mock-task">Intégration CI/CD</div>
              <div class="mock-task">Tests unitaires</div>
              <div class="mock-task">Documentation</div>
            </div>
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>En cours</span>
                <span class="mc-badge mc-blue">2</span>
              </div>
              <div class="mock-task mock-active">Landing redesign</div>
              <div class="mock-task">Refresh tokens</div>
            </div>
            <div class="mock-col">
              <div class="mock-col-hd">
                <span>Terminé</span>
                <span class="mc-badge mc-green">5</span>
              </div>
              <div class="mock-task mock-done">Auth JWT</div>
              <div class="mock-task mock-done">Docker setup</div>
              <div class="mock-task mock-done">API endpoints</div>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- ── FEATURES BENTO ── -->
    <section class="section" id="features">
      <div class="section-meta" data-reveal>
        <span class="eyebrow-label">Fonctionnalités</span>
        <h2 class="section-h">Ce que Flowly sait faire.</h2>
      </div>

      <div class="bento">

        <!-- Card 1: Collaboration (wide 2fr) -->
        <div class="bcard bcard-wide" data-reveal style="--i:0">
          <div class="bcard-icon icon-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h3 class="bcard-h">Collaboration en temps réel</h3>
          <p class="bcard-p">
            Invitez vos collègues par email. Gérez les rôles par workspace.
            Propulsé par l'<strong>API REST Resend</strong> — aucune restriction SMTP.
          </p>
          <div class="mock-invite">
            <div class="mi-row">
              <span class="mi-av mi-a">M</span>
              <div class="mi-info">
                <span class="mi-name">Marie Leconte</span>
                <span class="mi-email">marie&#64;studio.io</span>
              </div>
              <span class="mi-badge">Member</span>
            </div>
            <div class="mi-row">
              <span class="mi-av mi-b">T</span>
              <div class="mi-info">
                <span class="mi-name">Thomas Renard</span>
                <span class="mi-email">thomas&#64;dev.co</span>
              </div>
              <span class="mi-badge mi-admin">Admin</span>
            </div>
            <div class="mi-input-row">
              <span class="mi-placeholder">Inviter par email...</span>
              <span class="mi-send-btn">Envoyer</span>
            </div>
          </div>
          <div class="bcard-tag">API Resend · Workspaces</div>
        </div>

        <!-- Card 2: Security (narrow 1fr) -->
        <div class="bcard bcard-narrow" data-reveal style="--i:1">
          <div class="bcard-icon icon-emerald">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h3 class="bcard-h">Sécurité enterprise</h3>
          <p class="bcard-p">Tokens JWT + refresh, Spring Security, guards Angular.</p>
          <div class="sec-list">
            <div class="sec-item"><span class="sec-dot"></span><span>JWT access token</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Refresh token rotation</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Spring Security filters</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>Angular route guards</span></div>
            <div class="sec-item"><span class="sec-dot"></span><span>HTTP interceptors</span></div>
          </div>
          <div class="bcard-tag">JWT · Spring Security</div>
        </div>

        <!-- Card 3: Dashboard (full width) -->
        <div class="bcard bcard-full" data-reveal style="--i:2">
          <div class="bcard-full-inner">
            <div class="bcard-full-left">
              <div class="bcard-icon icon-blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 class="bcard-h">Dashboard dynamique</h3>
              <p class="bcard-p">
                Interface kanban propulsée par <strong>RxJS / Observables</strong>.
                Filtres temps réel, drag-and-drop CDK, pagination automatique.
              </p>
              <div class="bcard-tag">RxJS · Angular Signals · CDK</div>
            </div>
            <div class="bcard-full-right" aria-hidden="true">
              <div class="mini-chart-label">Tâches complétées / semaine</div>
              <svg class="mini-chart-svg" viewBox="0 0 210 64" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.75"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.15"/>
                  </linearGradient>
                </defs>
                <rect x="0"   y="28" width="22" height="36" rx="3" fill="url(#bGrad)"/>
                <rect x="28"  y="12" width="22" height="52" rx="3" fill="url(#bGrad)"/>
                <rect x="56"  y="20" width="22" height="44" rx="3" fill="url(#bGrad)"/>
                <rect x="84"  y="4"  width="22" height="60" rx="3" fill="url(#bGrad)"/>
                <rect x="112" y="16" width="22" height="48" rx="3" fill="url(#bGrad)"/>
                <rect x="140" y="26" width="22" height="38" rx="3" fill="url(#bGrad)"/>
                <rect x="168" y="8"  width="22" height="56" rx="3" fill="url(#bGrad)"/>
              </svg>
              <div class="mini-chart-days">
                <span>Lun</span><span>Mar</span><span>Mer</span>
                <span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── TECHNICAL CHALLENGE ── -->
    <section class="section">
      <div class="challenge" data-reveal>
        <div class="challenge-hd">
          <div class="challenge-ico">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <span class="challenge-eyebrow">Défi technique résolu</span>
        </div>
        <h3 class="challenge-h">SMTP bloqué sur Render → Migration vers l'API REST Resend</h3>
        <p class="challenge-txt">
          Render <strong>bloque les connexions SMTP sortantes</strong> sur les ports 465/587 (plan gratuit) —
          rendant JavaMailSender inutilisable. Solution : migration vers l'<strong>API REST Resend</strong>,
          qui transite par HTTPS :443 sans restriction d'hébergeur.
        </p>
        <div class="diff-row">
          <div class="diff-side">
            <span class="diff-lbl lbl-red">Avant</span>
            <code class="diff-code code-red">JavaMailSender → SMTP :587 → bloqué</code>
          </div>
          <svg class="diff-arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          <div class="diff-side">
            <span class="diff-lbl lbl-green">Après</span>
            <code class="diff-code code-green">Resend REST API → HTTPS :443 → opérationnel</code>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STACK TECH ── -->
    <section class="section" id="stack">
      <div class="section-meta" data-reveal>
        <span class="eyebrow-label">Stack Technique</span>
        <h2 class="section-h">Technologies maîtrisées.</h2>
      </div>
      <div class="stack-grid" data-reveal style="--i:1">
        <div class="stack-item" *ngFor="let t of stack">
          <span class="stack-dot" [style.background]="t.color"></span>
          <div>
            <div class="stack-name">{{ t.name }}</div>
            <div class="stack-sub">{{ t.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ── -->
    <footer class="footer" data-reveal>
      <div class="footer-wrap">
        <span class="footer-logo">Flowly</span>
        <div class="footer-links">
          <a href="https://gianny-dev.com" target="_blank" rel="noopener" class="footer-a">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            gianny-dev.com
          </a>
          <a href="https://linkedin.com/in/gianny-pnt" target="_blank" rel="noopener" class="footer-a">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
            LinkedIn
          </a>
        </div>
        <span class="footer-copy">© 2025 Gianny_Pnt</span>
      </div>
    </footer>
  `,
  styles: [`
    /* ── Host & tokens ── */
    :host {
      display: block;
      min-height: 100dvh;
      background: #090f1a;
      color: #e2e8f0;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      position: relative;
      overflow-x: hidden;
      --accent: #3b82f6;
      --accent-dim: rgba(59,130,246,0.12);
      --accent-border: rgba(59,130,246,0.22);
      --glass: rgba(255,255,255,0.04);
      --glass-hover: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.08);
      --border-strong: rgba(255,255,255,0.12);
      --muted: rgba(226,232,240,0.6);
      --radius: 20px;
    }

    /* ── Background blobs ── */
    .bg-mesh {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .blob {
      position: absolute;
      border-radius: 50%;
    }
    .b1 {
      width: 640px; height: 640px;
      top: -180px; left: -120px;
      background: radial-gradient(ellipse, #4f46e5 0%, transparent 70%);
      opacity: 0.18;
      filter: blur(60px);
    }
    .b2 {
      width: 560px; height: 560px;
      bottom: -120px; right: -80px;
      background: radial-gradient(ellipse, #0ea5e9 0%, transparent 70%);
      opacity: 0.14;
      filter: blur(55px);
    }

    /* ── Navbar ── */
    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 200;
      background: rgba(9,15,26,0.75);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border-bottom: 1px solid var(--border);
    }
    .nav-wrap {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 28px;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .logo {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent);
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      gap: 2px;
      margin-left: auto;
    }
    .nav-a {
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      transition: color 0.15s, background 0.15s;
    }
    .nav-a:hover { color: #e2e8f0; background: var(--glass); }
    .btn-login {
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      padding: 7px 16px;
      border-radius: 9px;
      transition: opacity 0.15s, transform 0.15s;
      box-shadow: 0 2px 14px rgba(59,130,246,0.28);
    }
    .btn-login:hover  { opacity: 0.88; transform: translateY(-1px); }
    .btn-login:active { transform: scale(0.97); }

    /* ── Hero — Split grid ── */
    .hero {
      position: relative;
      z-index: 1;
      max-width: 1120px;
      margin: 0 auto;
      padding: 144px 28px 72px;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      align-items: center;
    }

    .hero-left { display: flex; flex-direction: column; gap: 0; }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 20px;
    }
    .eyebrow-pulse {
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--accent);
      animation: eyePulse 2.4s ease-in-out infinite;
    }
    @keyframes eyePulse {
      0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
      50%       { opacity: 0.7; transform: scale(0.9); box-shadow: 0 0 0 4px rgba(59,130,246,0); }
    }

    .hero-h1 {
      font-size: clamp(2.6rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.04em;
      color: #f1f5f9;
      margin: 0 0 20px;
    }
    .hero-em {
      font-style: italic;
      color: var(--accent);
      font-weight: 800;
    }

    .hero-p {
      font-size: 15px;
      line-height: 1.72;
      color: rgba(226,232,240,0.72);
      max-width: 440px;
      margin: 0 0 32px;
    }
    .hero-p strong { color: #e2e8f0; font-weight: 600; }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }

    /* Primary CTA */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      padding: 11px 22px;
      border-radius: 11px;
      position: relative;
      overflow: hidden;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    }
    .btn-primary::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.08);
      transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-primary:hover { opacity: 0.93; transform: translateY(-2px); box-shadow: 0 6px 28px rgba(59,130,246,0.45); }
    .btn-primary:hover::before { transform: translateX(0); }
    .btn-primary:active { transform: scale(0.97) translateY(0); }
    .btn-arr {
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-primary:hover .btn-arr { transform: translateX(3px); }

    /* Ghost CTA */
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      color: rgba(226,232,240,0.7);
      background: var(--glass);
      border: 1px solid var(--border);
      padding: 11px 20px;
      border-radius: 11px;
      backdrop-filter: blur(8px);
      transition: background 0.15s, color 0.15s, transform 0.15s;
    }
    .btn-ghost:hover { background: var(--glass-hover); color: #e2e8f0; transform: translateY(-2px); }
    .btn-ghost:active { transform: scale(0.97); }

    /* Pills */
    .hero-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .pill {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--muted);
      background: var(--glass);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 999px;
    }

    /* ── Mock kanban window ── */
    .hero-right {
      animation: floatY 7s ease-in-out infinite;
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-14px); }
    }

    .mock-window {
      background: rgba(15,23,42,0.85);
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border: 1px solid var(--border-strong);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,0.55),
                  inset 0 1px 0 rgba(255,255,255,0.07);
    }
    .mock-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.025);
    }
    .mock-dots { display: flex; gap: 5px; }
    .md {
      width: 10px; height: 10px;
      border-radius: 50%;
    }
    .md-r { background: #ff5f56; }
    .md-y { background: #ffbd2e; }
    .md-g { background: #27c93f; }
    .mock-bar-title {
      font-size: 11px;
      font-weight: 500;
      color: var(--muted);
      margin-left: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .mock-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
    }
    .mock-col {
      padding: 12px 10px;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .mock-col:last-child { border-right: none; }
    .mock-col-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .mock-col-hd > span:first-child {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .mc-badge {
      font-size: 10px;
      font-weight: 600;
      color: rgba(226,232,240,0.55);
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      padding: 1px 5px;
      font-family: 'JetBrains Mono', monospace;
    }
    .mc-blue  { color: rgba(59,130,246,0.8); background: rgba(59,130,246,0.1); }
    .mc-green { color: rgba(34,197,94,0.8);  background: rgba(34,197,94,0.08); }

    .mock-task {
      font-size: 11px;
      color: rgba(226,232,240,0.65);
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 6px;
      padding: 6px 8px;
      line-height: 1.4;
      transition: border-color 0.2s;
    }
    .mock-active {
      color: rgba(226,232,240,0.8);
      background: rgba(59,130,246,0.07);
      border-color: rgba(59,130,246,0.3);
      animation: activePulse 2.5s ease-in-out infinite;
    }
    @keyframes activePulse {
      0%, 100% { border-color: rgba(59,130,246,0.3); }
      50%       { border-color: rgba(59,130,246,0.65); }
    }
    .mock-done {
      color: rgba(226,232,240,0.45);
      background: transparent;
      border-color: transparent;
      text-decoration: line-through;
    }

    /* ── Sections base ── */
    .section {
      position: relative;
      z-index: 1;
      max-width: 1120px;
      margin: 0 auto;
      padding: 72px 28px;
    }
    .section-meta {
      margin-bottom: 40px;
      text-align: center;
    }
    .eyebrow-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 10px;
    }
    .section-h {
      font-size: clamp(1.65rem, 3vw, 2.2rem);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.03em;
      color: #f1f5f9;
      margin: 0;
    }

    /* ── Bento grid ── */
    .bento {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: auto auto;
      gap: 14px;
    }
    .bcard-wide   { grid-column: 1; grid-row: 1; }
    .bcard-narrow { grid-column: 2; grid-row: 1; }
    .bcard-full   { grid-column: 1 / -1; grid-row: 2; }

    /* Base card */
    .bcard {
      background: var(--glass);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      transition: background 0.2s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.25s;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .bcard:hover {
      background: var(--glass-hover);
      transform: translateY(-3px);
      box-shadow: 0 16px 44px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07);
    }

    .bcard-icon {
      width: 40px; height: 40px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 18px;
    }
    .icon-blue {
      background: var(--accent-dim);
      color: #60a5fa;
      border: 1px solid var(--accent-border);
    }
    .icon-emerald {
      background: rgba(16,185,129,0.1);
      color: #34d399;
      border: 1px solid rgba(16,185,129,0.2);
    }

    .bcard-h {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }
    .bcard-p {
      font-size: 13px;
      line-height: 1.65;
      color: rgba(226,232,240,0.7);
      margin: 0 0 18px;
    }
    .bcard-p strong { color: rgba(226,232,240,0.9); }
    .bcard-tag {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: rgba(226,232,240,0.45);
      margin-top: auto;
    }

    /* ── Mock invite UI ── */
    .mock-invite {
      background: rgba(9,15,26,0.5);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .mi-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mi-av {
      width: 28px; height: 28px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .mi-a { background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
    .mi-b { background: rgba(236,72,153,0.15); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.2); }
    .mi-info { flex: 1; min-width: 0; }
    .mi-name  { display: block; font-size: 11px; font-weight: 600; color: rgba(226,232,240,0.75); line-height: 1.3; }
    .mi-email { display: block; font-size: 10px; color: var(--muted); }
    .mi-badge {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 5px;
      background: rgba(255,255,255,0.06);
      color: var(--muted);
      white-space: nowrap;
    }
    .mi-admin { background: rgba(59,130,246,0.1); color: #60a5fa; }
    .mi-input-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 7px 10px;
    }
    .mi-placeholder { font-size: 11px; color: rgba(226,232,240,0.2); }
    .mi-send-btn {
      font-size: 11px;
      font-weight: 600;
      color: var(--accent);
      opacity: 0.8;
    }

    /* ── Security list ── */
    .sec-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
      margin-bottom: 16px;
    }
    .sec-item {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 12px;
      color: rgba(226,232,240,0.7);
    }
    .sec-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #34d399;
      flex-shrink: 0;
      box-shadow: 0 0 6px rgba(52,211,153,0.5);
    }

    /* ── Dashboard card full ── */
    .bcard-full-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: center;
    }
    .bcard-full-left { display: flex; flex-direction: column; }
    .bcard-full-right {}
    .mini-chart-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 12px;
    }
    .mini-chart-svg {
      width: 100%;
      height: 64px;
      display: block;
    }
    .mini-chart-days {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }
    .mini-chart-days span {
      font-size: 10px;
      color: rgba(226,232,240,0.45);
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── Technical Challenge ── */
    .challenge {
      background: var(--glass);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border: 1px solid rgba(59,130,246,0.15);
      border-radius: var(--radius);
      padding: 36px;
      box-shadow: 0 0 60px rgba(59,130,246,0.04), inset 0 1px 0 rgba(255,255,255,0.04);
    }
    .challenge-hd {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
    }
    .challenge-ico {
      width: 32px; height: 32px;
      border-radius: 9px;
      background: rgba(251,191,36,0.1);
      border: 1px solid rgba(251,191,36,0.2);
      color: #fbbf24;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .challenge-eyebrow {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #fbbf24;
    }
    .challenge-h {
      font-size: 1rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 12px;
      letter-spacing: -0.02em;
    }
    .challenge-txt {
      font-size: 13.5px;
      line-height: 1.7;
      color: rgba(226,232,240,0.7);
      margin: 0 0 20px;
    }
    .challenge-txt strong { color: rgba(226,232,240,0.9); }

    .diff-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .diff-side {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 200px;
    }
    .diff-lbl {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .lbl-red   { color: #f87171; }
    .lbl-green { color: #4ade80; }
    .diff-code {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      padding: 9px 13px;
      border-radius: 9px;
      line-height: 1.5;
    }
    .code-red   { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.14); color: #fca5a5; }
    .code-green { background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.14); color: #86efac; }
    .diff-arr { color: rgba(226,232,240,0.4); flex-shrink: 0; }

    /* ── Stack grid ── */
    .stack-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
      gap: 10px;
    }
    .stack-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      transition: background 0.15s, transform 0.2s;
    }
    .stack-item:hover { background: var(--glass-hover); transform: translateY(-2px); }
    .stack-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .stack-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
    .stack-sub  { font-size: 11px; color: var(--muted); margin-top: 1px; }

    /* ── Footer ── */
    .footer {
      position: relative;
      z-index: 1;
      border-top: 1px solid var(--border);
      padding: 24px 28px;
    }
    .footer-wrap {
      max-width: 1120px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .footer-logo {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
    }
    .footer-links {
      display: flex;
      gap: 16px;
      margin-left: auto;
    }
    .footer-a {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      font-size: 12px;
      color: var(--muted);
      transition: color 0.15s;
    }
    .footer-a:hover { color: #cbd5e1; }
    .footer-copy { font-size: 11px; color: rgba(226,232,240,0.5); }

    /* ── Scroll reveal ── */
    [data-reveal] {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
      transition-delay: calc(var(--i, 0) * 110ms);
    }
    [data-reveal].in-view {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 64px 20px 48px; }
      .bento { grid-template-columns: 1fr; }
      .bcard-wide, .bcard-narrow, .bcard-full { grid-column: 1; grid-row: auto; }
      .bcard-full-inner { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .hero-h1 { letter-spacing: -0.03em; }
      .nav-links { display: none; }
      .hero-right { order: -1; }
      .mock-board { grid-template-columns: 1fr; }
      .mock-col:not(:first-child) { display: none; }
      .diff-row { flex-direction: column; }
      .diff-arr { transform: rotate(90deg); align-self: center; }
      .section { padding: 52px 20px; }
      .footer-links { margin-left: 0; }
      .footer-wrap { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef);
  private observer?: IntersectionObserver;

  readonly stack = [
    { name: 'Angular 17',      desc: 'Frontend SPA',           color: '#f43f5e' },
    { name: 'Spring Boot',     desc: 'API REST backend',       color: '#22c55e' },
    { name: 'PostgreSQL',      desc: 'Base de données',        color: '#3b82f6' },
    { name: 'JWT Auth',        desc: 'Sécurité / tokens',      color: '#f59e0b' },
    { name: 'Docker',          desc: 'Conteneurisation',       color: '#0ea5e9' },
    { name: 'Resend API',      desc: 'Emails transactionnels', color: '#a855f7' },
    { name: 'Spring Security', desc: 'Guards & autorisation',  color: '#10b981' },
    { name: 'RxJS',            desc: 'Programmation réactive', color: '#ec4899' },
  ];

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          this.observer?.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    this.el.nativeElement.querySelectorAll('[data-reveal]')
      .forEach((el: Element) => this.observer!.observe(el));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
